import { NextFunction, Request, Response } from 'express';
import { CreateUserRequest, LoginUserRequest } from '../types/userType';
import { UserService } from '../services/userService';

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */
export class UserController {
  /**
   * @swagger
   * /api/users/register:
   *   post:
   *     summary: Registrasi pengguna baru
   *     tags: [User]
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
   *               name:
   *                 type: string
   *                 example: John Doe
   *               email:
   *                 type: string
   *                 example: john@example.com
   *               password:
   *                 type: string
   *                 example: password123
   *               phone:
   *                 type: string
   *                 example: "+1234567890"
   *               role:
   *                 type: string
   *                 default: user
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
   *     responses:
   *       201:
   *         description: Pengguna berhasil terdaftar
   *       400:
   *         description: Permintaan tidak valid
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const image = req.file;
      const request: CreateUserRequest = req.body;

      const result = await UserService.register(request, image);

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
   * /api/users/login:
   *   post:
   *     summary: Log in a user and get a token
   *     tags: [User]
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
   *         description: Login successful
   *       400:
   *         description: Bad request
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request: LoginUserRequest = req.body;
      const result = await UserService.login(request);

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
   * /api/users/profile:
   *   get:
   *     summary: Get user information only by user
   *     tags: [User]
   *     security:
   *       - userAuth: []
   *     responses:
   *       200:
   *         description: User information retrieved successfully
   *       400:
   *         description: Bad request
   */
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await UserService.get(user);

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
   * /api/users/profile:
   *   patch:
   *     summary: Update user information only by user
   *     tags: [User]
   *     security:
   *       - userAuth: []
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
   *               name:
   *                 type: string
   *                 example: Jane Doe
   *               email:
   *                 type: string
   *                 example: jane@example.com
   *               phone:
   *                 type: string
   *                 example: "+1234567890"
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
   *     responses:
   *       200:
   *         description: User information updated successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: User not found
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const request = req.body;
      const image = req.file;

      const result = await UserService.update(user, request, image);

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
   * /api/users/change-password:
   *   patch:
   *     summary: Change user password only by user
   *     tags: [User]
   *     security:
   *       - userAuth: []
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
      const request = req.body;

      const result = await UserService.changePassword(user, request);

      res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
