import axios from 'axios';
import { UserModel } from '../models/userModel';

export class MidtransService {
  static async createTransaction(order: any): Promise<any> {
    if (!order) {
      throw new Error('Order tidak ditemukan');
    }

    const midtransAPI = process.env.MIDTRANS_APP_URL as string; // API Midtrans untuk membuat transaksi
    const serverKey = process.env.MIDTRANS_SERVER_KEY; // Gantilah dengan server key Midtrans Anda
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
    };

    const user = await UserModel.findById(order.user_id);

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    const payload = {
      transaction_details: {
        order_id: order._id.toString(),
        gross_amount: order.total_price,
      },
      item_details: [
        order.products.map((item: any) => ({
          id: item._id.toString(),
          price: item.price,
          quantity: item.quantity,
        })),
      ],
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };

    try {
      const response = await axios.post(midtransAPI, payload, { headers });
      return response.data;
    } catch (error: any) {
      throw new Error('Midtrans API error: ' + error.message);
    }
  }
}
