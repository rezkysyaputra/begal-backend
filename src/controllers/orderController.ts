import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { Order } from '../types/orderType';

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management
 */
export class OrderController {
  /**
   * @swagger
   * /api/orders:
   *   post:
   *     tags:
   *       - Order
   *     summary: Create a new order only by user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - products
   *               - payment_method
   *               - seller_id
   *             properties:
   *               seller_id:
   *                 type: string
   *               payment_method:
   *                 type: string
   *               products:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     product_id:
   *                       type: string
   *                     quantity:
   *                       type: integer
   *     responses:
   *       201:
   *         description: Order created successfully
   *       400:
   *         description: Bad request
   */
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

  /**
   * @swagger
   * /api/orders:
   *   get:
   *     tags: [Order]
   *     summary: Get all orders only by user or seller
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Orders retrieved successfully
   *       400:
   *         description: Bad request
   */
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

  /**
   * @swagger
   * /api/orders/{orderId}:
   *   get:
   *     tags: [Order]
   *     summary: Get an order by ID only by user or seller
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Order retrieved successfully
   *       400:
   *         description: Bad request
   */
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

  /**
   * @swagger
   * /api/orders/{orderId}:
   *   patch:
   *     tags: [Order]
   *     summary: Update status an order by ID only by seller
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled']
   *     responses:
   *       200:
   *         description: Order status updated successfully
   *       400:
   *         description: Bad request
   */
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
