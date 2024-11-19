import { NextFunction, Request, Response } from 'express';
import { CreateUserRequest, LoginUserRequest } from '../types/userType';
import { UserService } from '../services/userService';
import { GetSellerResponse } from '../types/sellerType';

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */
export class UserController {
  /**
   * @swagger
   /api/users/register:
   *   post:
   *     summary: Register a new user
   *     tags: [User]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *               - phone
   *               - address
   *               - role
   *             properties:
   *               image:
   *                 type: string
   *                 format: binary
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               phone:
   *                 type: string
   *               role:
   *                 type: string
   *                 default: user
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
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Bad request
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
   *                 description: User's email address
   *               password:
   *                 type: string
   *                 description: User's password
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
   *     summary: Get user information
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
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
   * /api/users:
   *   patch:
   *     summary: Update user information
   *     tags: [User]
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
   *     responses:
   *       200:
   *         description: User information updated successfully
   *       400:
   *         description: Bad request
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
   *     summary: Change user password
   *     tags: [User]
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
   *                 description: User's old password
   *               newPassword:
   *                 type: string
   *                 description: User's new password
   *     responses:
   *       200:
   *         description: Password changed successfully
   *       400:
   *         description: Bad request
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
