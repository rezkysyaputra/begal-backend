import { OrderModel } from '../models/orderModel';
import { ProductModel } from '../models/productModel';
import { MidtransService } from './midtransService';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  StatusOrder,
  toOrderResponse,
} from '../types/orderType';
import ResponseError from '../helpers/responseError';
import { UserModel } from '../models/userModel';
import { OrderValidation } from '../validations/orderValidation';
import { Validation } from '../validations/validation';
import mongoose from 'mongoose';

export class OrderService {
  static async create(
    user: { id: string },
    data: CreateOrderRequest
  ): Promise<CreateOrderResponse> {
    const orderData = Validation.validate(OrderValidation.CREATE, data);

    if (!mongoose.Types.ObjectId.isValid(orderData.seller_id)) {
      throw new ResponseError(400, 'Seller tidak ditemukan');
    }

    const matchUser = await UserModel.findById(user.id);
    if (!matchUser) throw new ResponseError(404, 'User tidak ditemukan');

    const session = await mongoose.startSession();
    session.startTransaction();
    let transactionSuccessful = false;

    try {
      const productIds = orderData.products.map(
        (product: { product_id: string }) => product.product_id
      );
      const products = await ProductModel.find({
        _id: { $in: productIds },
      }).session(session);

      if (products.length !== orderData.products.length) {
        throw new ResponseError(400, 'Beberapa produk tidak ditemukan');
      }

      // Cek stok untuk semua produk terlebih dahulu
      orderData.products.forEach((orderProduct: any) => {
        const product = products.find(
          (p) => (p._id as string).toString() === orderProduct.product_id
        );
        if (!product) {
          throw new ResponseError(400, 'Produk tidak ditemukan');
        }
        if (product.stock < orderProduct.quantity) {
          throw new ResponseError(
            400,
            `Stok tidak mencukupi untuk produk ${product.name}`
          );
        }
      });

      // Jika stok cukup, lanjutkan mengurangi stok
      const detailedProducts = orderData.products.map((orderProduct: any) => {
        const product = products.find(
          (p) => (p._id as string).toString() === orderProduct.product_id
        )!;
        product.stock -= orderProduct.quantity;
        product.save({ session });

        return {
          product_id: product._id,
          name: product.name,
          quantity: orderProduct.quantity,
          price: product.price,
          image_url: product.image_url ?? null,
        };
      });

      const totalPrice: number = detailedProducts.reduce(
        (total: number, product: any) =>
          total + product.price * product.quantity,
        0
      );

      const order = await OrderModel.create(
        [
          {
            user_id: user.id,
            seller_id: orderData.seller_id,
            products: detailedProducts,
            delivery_address: matchUser.address,
            total_price: totalPrice,
            payment_method: orderData.payment_method,
            payment_status: 'pending',
            transaction_id: '',
            status: 'pending',
          },
        ],
        { session }
      );

      if (orderData.payment_method === 'cash') {
        await session.commitTransaction();
        transactionSuccessful = true;
        return {
          order_id: (order[0]._id as string).toString(),
          payment_method: order[0].payment_method,
        };
      }

      let paymentData: any;
      try {
        paymentData = await MidtransService.createTransaction(order[0]);
      } catch (error) {
        throw new ResponseError(500, 'Transaksi pembayaran gagal dilakukan');
      }

      order[0].payment_response = paymentData;
      await order[0].save({ session });

      await session.commitTransaction();
      transactionSuccessful = true;

      return {
        order_id: order[0]._id as string,
        token: paymentData.token,
        redirect_url: paymentData.redirect_url,
        payment_method: order[0].payment_method,
      };
    } catch (error) {
      if (!transactionSuccessful) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async list(user: { id: string; role: string }): Promise<Order[]> {
    const filterId = user.role === 'user' ? 'user_id' : 'seller_id';
    const orders = await OrderModel.find({ [filterId]: user.id });
    return orders.map((order) => toOrderResponse(order));
  }

  static async get(
    user: { id: string; role: string },
    id: string
  ): Promise<Order> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ResponseError(400, 'Order tidak ditemukan');
    }

    const filterId = user.role === 'user' ? 'user_id' : 'seller_id';
    const order = await OrderModel.findById({ _id: id, [filterId]: user.id });
    if (!order) throw new ResponseError(404, 'Order tidak ditemukan');
    return toOrderResponse(order);
  }

  static async update(
    user: { id: string },
    id: string,
    status: StatusOrder
  ): Promise<Order> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ResponseError(400, 'Order tidak ditemukan');
    }

    const order = await OrderModel.findById({ _id: id, seller_id: user.id });
    if (!order) throw new ResponseError(404, 'Order tidak ditemukan');

    order.status = status;
    await order.save();

    return toOrderResponse(order);
  }
}
