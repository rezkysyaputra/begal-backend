import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/orderService";
import { Order } from "../types/orderType";

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
   *       - userAuth: []
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
   *                 enum: ['transfer', 'cash']
   *                 example: 'transfer'
   *               products:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     product_id:
   *                       type: string
   *                     quantity:
   *                       type: integer
   *                       example: 2
   *
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
   *       - bearerAuth : []
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
   * /api/sellers/orders/{orderId}:
   *   patch:
   *     tags: [Order]
   *     summary: Update status an order by ID only by seller
   *     security:
   *       - sellerAuth: []
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
   *                 enum: ['confirmed', 'shipped', 'cancelled']
   *                 example: 'confirmed'
   *     responses:
   *       200:
   *         description: Order status updated successfully
   *       400:
   *         description: Bad request
   */
  static async updateOrderStatusSeller(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user.id;
      const orderId = req.params.orderId;
      const { status } = req.body;

      const result: Order = await OrderService.updateOrderStatusSeller(
        userId,
        orderId,
        status
      );

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
   * /api/users/orders/{orderId}:
   *   patch:
   *     tags: [Order]
   *     summary: Update status an order by ID only by user
   *     security:
   *       - userAuth: []
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
   *                 enum: [ 'delivered' ,'cancelled']
   *                 example: 'delivered'
   *     responses:
   *       200:
   *         description: Order status updated successfully
   *       400:
   *         description: Bad request
   */
  static async updateOrderStatusUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user.id;
      const orderId = req.params.orderId;
      const { status } = req.body;

      const result: Order = await OrderService.updateOrderStatusUser(
        userId,
        orderId,
        status
      );

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
   * /api/orders/{orderId}/payment-status:
   *   patch:
   *     tags: [Order]
   *     summary: Update payment status an order by ID only by seller
   *     security:
   *       - sellerAuth: []
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
   *                 enum: ['success', 'failed']
   *                 example: 'success'
   *     responses:
   *       200:
   *         description: Order payment status updated successfully
   *       400:
   *         description: Bad request
   */
  static async updatePaymentStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user.id;
      const orderId = req.params.orderId;
      const { status } = req.body;

      const result: Order = await OrderService.updatePaymentStatus(
        userId,
        orderId,
        status
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
