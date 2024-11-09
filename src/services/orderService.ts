import { OrderModel } from '../models/orderModel';
import { ProductModel } from '../models/productModel';
import { MidtransService } from './midtransService';
import {
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
    data: any
  ): Promise<CreateOrderResponse> {
    // Validasi order
    const orderData = Validation.validate(OrderValidation.CREATE, data);

    if (!mongoose.Types.ObjectId.isValid(orderData.seller_id)) {
      throw new ResponseError(400, 'Seller tidak ditemukan');
    }

    const matchUser = await UserModel.findById(user.id);
    if (!matchUser) throw new ResponseError(404, 'User tidak ditemukan');

    // Validasi dan proses order
    const products = await ProductModel.find({
      _id: {
        $in: orderData.products.map(
          (product: { product_id: string }) => product.product_id
        ),
      },
    });

    if (products.length !== orderData.products.length) {
      throw new ResponseError(400, 'Beberapa produk tidak ditemukan');
    }

    // Hitung total harga
    const totalPrice: number = orderData.products.reduce(
      (total: number, product: any) => total + product.price * product.quantity,
      0
    );

    // Simpan order sementara dengan status 'pending'
    const order = await OrderModel.create({
      user_id: user.id,
      seller_id: orderData.seller_id,
      products: orderData.products,
      delivery_address: matchUser.address,
      total_price: totalPrice,
      payment_method: orderData.payment_method,
      payment_status: 'pending',
      transaction_id: '', // Transaction ID dari Midtrans akan ditambahkan nanti
      status: 'pending',
    });

    if (orderData.payment_method === 'cash') {
      return {
        order_id: (order._id as string).toString(),
        payment_method: order.payment_method,
      };
    }
    // Lakukan integrasi dengan Midtrans untuk pembayaran
    let paymentData: any;
    try {
      paymentData = await MidtransService.createTransaction(order); // Menghubungi Midtrans
    } catch (error) {
      throw new ResponseError(500, 'Transaksi pembayaran gagal dilakukan');
    }

    // Update Order dengan informasi dari Midtrans
    order.transaction_id = paymentData.transaction_id;
    order.payment_response = paymentData; // Simpan seluruh respons dari Midtrans
    order.payment_expiry = paymentData.expiry_time; // Kadaluarsa pembayaran
    await order.save();

    return {
      order_id: order._id as string,
      token: paymentData.token,
      redirect_url: paymentData.redirect_url,
      payment_method: order.payment_method,
    };
  }

  static async list(user: { id: string }): Promise<Order[]> {
    const orders = await OrderModel.find({ user_id: user.id });
    return orders.map((order) => toOrderResponse(order));
  }

  static async get(user: { id: string }, id: string): Promise<Order> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ResponseError(400, 'Order tidak ditemukan');
    }

    const order = await OrderModel.findById({ _id: id, user_id: user.id });
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

    const order = await OrderModel.findById({ _id: id, user_id: user.id });
    if (!order) throw new ResponseError(404, 'Order tidak ditemukan');

    order.status = status;
    await order.save();

    return toOrderResponse(order);
  }
}
