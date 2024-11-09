import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/orderModel';

export class MidtransCallbackController {
  static async handleCallback(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const {
      order_id,
      transaction_status,
      payment_type,
      transaction_id,
      fraud_status,
    } = req.body;

    // Temukan order berdasarkan order_id
    const order = await OrderModel.findOne({ transaction_id: order_id });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Update status order berdasarkan status pembayaran dari Midtrans
    if (
      transaction_status === 'capture' ||
      transaction_status === 'settlement'
    ) {
      order.payment_status = 'success';
    } else if (transaction_status === 'pending') {
      order.payment_status = 'pending';
    } else {
      order.payment_status = 'failed';
    }

    order.payment_response = req.body; // Simpan respons lengkap dari Midtrans
    await order.save();

    res.status(200).json({ message: 'Payment status updated successfully' });
  }
}
