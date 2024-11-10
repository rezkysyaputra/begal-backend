import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { Order } from '../types/orderType';

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const orderData = req.body;

      const result = await OrderService.create(user, orderData);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result: Order[] = await OrderService.list(user);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const orderId = req.params.orderId;
      const result: Order = await OrderService.get(user, orderId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const orderId = req.params.orderId;
      const { status } = req.body;

      const result: Order = await OrderService.update(user, orderId, status);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
