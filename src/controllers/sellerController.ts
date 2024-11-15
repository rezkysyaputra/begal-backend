import { NextFunction, Request, Response } from 'express';
import { SellerService } from '../services/sellerService';
import { CreateSellerRequest, LoginSellerRequest } from '../types/sellerType';

/**
 * @swagger
 * tags:
 *   name: Seller
 *   description: Seller management
 */
export class SellerController {
  /**
   * @swagger
   * /api/sellers/register:
   *   post:
   *     tags:
   *       - Seller
   *     name: Register a new seller
   *     summary: Register a new seller
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - owner_name
   *               - name
   *               - email
   *               - password
   *               - phone
   *               - address
   *               - role
   *               - operational_hours
   *             properties:
   *               owner_name:
   *                 type: string
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               phone:
   *                 type: string
   *               address:
   *                 type: object
   *                 properties:
   *                   province:
   *                     type: string
   *                   regency:
   *                     type: string
   *                   district:
   *                     type: string
   *                   village:
   *                     type: string
   *                   street:
   *                     type: string
   *                   detail:
   *                     type: string
   *               operational_hours:
   *                 type: object
   *                 properties:
   *                   open:
   *                     type: string
   *                   close:
   *                     type: string
   *               role:
   *                 type: string
   *                 default: seller
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: Created
   *       400:
   *         description: Bad Request
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const image = req.file;
      const request: CreateSellerRequest = req.body;
      const result = await SellerService.register(request, image);

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
   * /api/sellers/login:
   *   post:
   *     tags:
   *       - Seller
   *     name: Login a seller
   *     summary: Login a seller
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: OK
   *       400:
   *         description: Bad Request
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request: LoginSellerRequest = req.body;
      const result = await SellerService.login(request);

      res.status(200).json({
        success: true,
        token: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/sellers/profile:
   *   get:
   *     summary: Get seller information
   *     tags: [Seller]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Seller information retrieved successfully
   *       400:
   *         description: Bad request
   */
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await SellerService.get(user);

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
   * /api/sellers:
   *   patch:
   *     summary: Update seller information
   *     tags: [Seller]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               image:
   *                 type: string
   *                 format: binary
   *               owner_name:
   *                 type: string
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               address:
   *                 type: object
   *                 properties:
   *                   province:
   *                     type: string
   *                   regency:
   *                     type: string
   *                   district:
   *                     type: string
   *                   village:
   *                     type: string
   *                   street:
   *                     type: string
   *                   detail:
   *                     type: string
   *               operational_hours:
   *                 type: object
   *                 properties:
   *                   open:
   *                     type: string
   *                   close:
   *                     type: string
   *     responses:
   *       200:
   *         description: Updated
   *       400:
   *         description: Bad Request
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const request = req.body;
      const image = req.file;

      const result = await SellerService.update(user, request, image);

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
   * /api/sellers/change-password:
   *   patch:
   *     summary: Change seller password
   *     tags: [Seller]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - oldPassword
   *               - newPassword
   *             properties:
   *               oldPassword:
   *                 type: string
   *               newPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password changed successfully
   *       400:
   *         description: Bad request
   */
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const data = req.body;

      const result = await SellerService.changePassword(user, data);

      res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
