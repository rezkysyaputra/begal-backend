import { NextFunction, Request, Response } from 'express';
import { SellerService } from '../services/sellerService';
import {
  CreateSellerRequest,
  GetSellerResponse,
  LoginSellerRequest,
} from '../types/sellerType';

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
   *     summary: Registrasi penjual baru
   *     requestBody:
   *       required: true
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
   *                 example: John Doe
   *               name:
   *                 type: string
   *                 example: Toko Berkah
   *               email:
   *                 type: string
   *                 example: john@example.com
   *               password:
   *                 type: string
   *                 example: password123
   *               phone:
   *                 type: string
   *                 example: "+6281234567890"
   *               role:
   *                 type: string
   *                 default: seller
   *               address[province]:
   *                 type: string
   *                 example: "Central Java"
   *               address[regency]:
   *                 type: string
   *                 example: "Semarang"
   *               address[district]:
   *                 type: string
   *                 example: "Semarang City"
   *               address[village]:
   *                 type: string
   *                 example: "Tembalang"
   *               address[street]:
   *                 type: string
   *                 example: "Jl. Raya Tembalang"
   *               address[detail]:
   *                 type: string
   *                 example: "Near the university"
   *               operational_hours[open]:
   *                 type: string
   *                 example: "08:00"
   *               operational_hours[close]:
   *                 type: string
   *                 example: "22:00"
   *     responses:
   *       201:
   *         description: Created successfully
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
   *                 example: john@example.com
   *               password:
   *                 type: string
   *                 example: password123
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
   *     summary: Get seller information only by seller
   *     tags: [Seller]
   *     security:
   *       - sellerAuth: []
   *     responses:
   *       200:
   *         description: Seller information retrieved successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *
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
   * /api/sellers/{sellerId}:
   *   get:
   *     summary: Get seller information only by seller
   *     tags: [Seller]
   *     parameters:
   *       - in: path
   *         name: sellerId
   *         required: true
   *         schema:
   *           type: string
   *           format: mongo-id
   *           description: The ID of the sellerId to get seller information
   *     responses:
   *       200:
   *         description: Seller information retrieved successfully
   *       400:
   *         description: Bad request
   *       404:
   *         description: Seller not found
   *       401:
   *         description: Unauthorized
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { sellerId } = req.params;
      const result = await SellerService.getById(sellerId);

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
   *   get:
   *     summary: Get all sellers information for users
   *     tags: [Seller]
   *     responses:
   *       200:
   *         description: Sellers retrieved successfully
   *       400:
   *         description: Bad request
   */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SellerService.getAll();

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
   * /api/sellers/nearby:
   *   get:
   *     summary: Get nearby sellers only by user
   *     tags: [User]
   *     security:
   *       - userAuth: []
   *     responses:
   *       200:
   *         description: Nearby sellers retrieved successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  static async getNearbySellers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = (req as any).user;
      const result: GetSellerResponse[] =
        await SellerService.getNearbySellers(user);

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
   * /api/sellers/profile:
   *   patch:
   *     summary: Perbarui informasi penjual hanya oleh penjual
   *     tags: [Seller]
   *     security:
   *       - sellerAuth: []
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
   *                 example: Jane Doe
   *               name:
   *                 type: string
   *                 example: Toko Makmur
   *               email:
   *                 type: string
   *                 example: jane@example.com
   *               phone:
   *                 type: string
   *                 example: "+6281234567890"
   *               address[province]:
   *                 type: string
   *                 example: "West Java"
   *               address[regency]:
   *                 type: string
   *                 example: "Bandung"
   *               address[district]:
   *                 type: string
   *                 example: "Bandung City"
   *               address[village]:
   *                 type: string
   *                 example: "Cihampelas"
   *               address[street]:
   *                 type: string
   *                 example: "Jl. Cihampelas"
   *               address[detail]:
   *                 type: string
   *                 example: "Near the mall"
   *               operational_hours[open]:
   *                 type: string
   *                 example: "09:00"
   *               operational_hours[close]:
   *                 type: string
   *                 example: "21:00"
   *     responses:
   *       200:
   *         description: Updated seller information successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Seller not found
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
   *     summary: Change seller password only by seller
   *     tags: [Seller]
   *     security:
   *       - sellerAuth: []
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
   *               old_password:
   *                 type: string
   *                 example: password123
   *               new_password:
   *                 type: string
   *                 example: newpassword123
   *     responses:
   *       200:
   *         description: Password changed successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
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
