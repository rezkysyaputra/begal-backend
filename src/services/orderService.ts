import { OrderModel } from '../models/orderModel';
import { ProductModel } from '../models/productModel';
import { MidtransService } from './midtransService';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  StatusOrder,
  StatusPayment,
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
      throw new ResponseError(404, 'Seller tidak ditemukan');
    }

    const matchUser = await UserModel.findById(user.id);
    if (!matchUser) {
      throw new ResponseError(404, 'User tidak ditemukan');
    }

    const productIds = orderData.products.map(
      (product: { product_id: string }) => product.product_id
    );

    const invalidProductId = productIds.find(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidProductId) {
      throw new ResponseError(
        404,
        `Product ID '${invalidProductId}' tidak valid`
      );
    }

    const products = await ProductModel.find({ _id: { $in: productIds } });

    if (products.length !== orderData.products.length) {
      throw new ResponseError(404, 'Beberapa produk tidak ditemukan');
    }

    const detailedProducts = orderData.products.map((orderProduct: any) => {
      const product = products.find(
        (p) => (p._id as string).toString() === orderProduct.product_id
      );
      if (!product) {
        throw new ResponseError(404, 'Produk tidak ditemukan');
      }
      if (product.stock < orderProduct.quantity) {
        throw new ResponseError(
          400,
          `Stok tidak mencukupi untuk produk ${product.name}`
        );
      }

      product.stock -= orderProduct.quantity;
      product.save();

      return {
        product_id: product._id,
        name: product.name,
        quantity: orderProduct.quantity,
        price: product.price,
        image_url: product.image_url ?? null,
      };
    });

    const totalPrice: number = detailedProducts.reduce(
      (total: number, product: any) => total + product.price * product.quantity,
      0
    );

    const order = await OrderModel.create({
      user_id: user.id,
      seller_id: orderData.seller_id,
      products: detailedProducts,
      delivery_address: matchUser.address,
      total_price: totalPrice,
      payment_method: orderData.payment_method,
      payment_status: 'pending',
      transaction_id: '',
      status: 'pending',
    });

    if (orderData.payment_method === 'cash') {
      return {
        order_id: order._id as string,
        payment_method: order.payment_method,
      };
    }

    let paymentData: any;
    try {
      paymentData = await MidtransService.createTransaction(order);
    } catch (error) {
      throw new ResponseError(500, 'Transaksi pembayaran gagal dilakukan');
    }

    order.payment_response = paymentData;
    await order.save();

    return {
      order_id: order._id as string,
      token: paymentData.token,
      redirect_url: paymentData.redirect_url,
      payment_method: order.payment_method,
    };
  }

  static async list(user: { id: string; role: string }): Promise<Order[]> {
    const filterId = user.role === 'user' ? 'user_id' : 'seller_id';
    const orders = await OrderModel.find({ [filterId]: user.id }).sort({
      createdAt: -1,
    });
    return orders.map((order) => toOrderResponse(order));
  }

  static async get(
    user: { id: string; role: string },
    id: string
  ): Promise<Order> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ResponseError(404, 'Order tidak ditemukan');
    }

    const filterId = user.role === 'user' ? 'user_id' : 'seller_id';
    const order = await OrderModel.findById({ _id: id, [filterId]: user.id });
    if (!order) throw new ResponseError(404, 'Order tidak ditemukan');
    return toOrderResponse(order);
  }

  static async updateOrderStatusSeller(
    sellerId: string,
    id: string,
    status: string
  ): Promise<Order> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ResponseError(404, 'Order tidak ditemukan');
    }

    const statusValidated = Validation.validate(
      OrderValidation.ORDER_STATUS_SELLER,
      status
    );

    const order = await OrderModel.findById({ _id: id, seller_id: sellerId });
    if (!order) {
      throw new ResponseError(404, 'Order tidak ditemukan');
    }

    if (statusValidated === 'cancelled') {
      order.payment_status = 'failed';

      order.products.forEach(async (product) => {
        const productData = await ProductModel.findById(product.product_id);

        if (productData) {
          productData.stock += product.quantity;
          await productData.save();
        }
      });
    }

    order.status = statusValidated as StatusOrder;
    await order.save();

    return toOrderResponse(order);
  }

  static async updateOrderStatusUser(
    userId: string,
    orderId: string,
    status: string
  ): Promise<Order> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ResponseError(404, 'Order tidak ditemukan');
    }

    const statusValidated = Validation.validate(
      OrderValidation.ORDER_STATUS_USER,
      status
    );

    const order = await OrderModel.findById({
      _id: orderId,
      user_id: userId,
    });
    if (!order) {
      throw new ResponseError(404, 'Order tidak ditemukan');
    }

    if (statusValidated === 'cancelled') {
      order.payment_status = 'failed';

      order.products.forEach(async (product) => {
        const productData = await ProductModel.findById(product.product_id);

        if (productData) {
          productData.stock += product.quantity;
          await productData.save();
        }
      });
    }

    order.status = statusValidated as StatusOrder;
    await order.save();

    return toOrderResponse(order);
  }

  static async updatePaymentStatus(
    userId: string,
    orderId: string,
    paymentStatus: string
  ): Promise<Order> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ResponseError(404, 'Order tidak ditemukan');
    }

    const paymentStatusValidated = Validation.validate(
      OrderValidation.ORDER_STATUS_PAYMENT,
      paymentStatus
    );

    const order = await OrderModel.findOne({
      _id: orderId,
      seller_id: userId,
    });

    if (!order) {
      throw new ResponseError(404, 'Order tidak ditemukan');
    }

    if (paymentStatusValidated === 'failed') {
      order.status = 'cancelled';

      order.products.forEach(async (product) => {
        const productData = await ProductModel.findById(product.product_id);

        if (productData) {
          productData.stock += product.quantity;
          await productData.save();
        }
      });
    }

    order.payment_status = paymentStatusValidated as StatusPayment;
    await order.save();

    return toOrderResponse(order);
  }
}
