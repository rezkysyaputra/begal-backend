import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/orderModel';
import { ProductModel } from '../models/productModel';

export class MidtransCallbackController {
  static async handleCallback(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { order_id, transaction_status, expiry_time, transaction_id } =
      req.body;

    const order = await OrderModel.findOne({ _id: order_id });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (
      transaction_status === 'capture' ||
      transaction_status === 'settlement'
    ) {
      order.payment_status = 'success';
    } else if (transaction_status === 'pending') {
      order.payment_status = 'pending';
    } else {
      order.payment_status = 'failed';
      order.status = 'cancelled';

      order.products.forEach(async (product) => {
        const productData = await ProductModel.findById(product.product_id);
        if (productData) {
          productData.stock += product.quantity;
          await productData.save();
        }
      });
    }

    order.transaction_id = transaction_id;
    order.payment_expiry = expiry_time;
    order.payment_response = req.body;
    await order.save();

    res.status(200).json({ message: 'Payment status updated successfully' });
  }
}
