import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/authService';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API related to user and seller authentication and password reset
 */
export class AuthController {
  /**
   * @swagger
   * /auth/request-reset-password:
   *   post:
   *     tags: [Authentication]
   *     summary: Request a password reset
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - role
   *             properties:
   *               email:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [user, seller]
   *     responses:
   *       200:
   *         description: Reset code sent successfully.
   *       400:
   *         description: Invalid input.
   *       500:
   *         description: Server error.
   */

  static async requestPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, role } = req.body;
      const result = await AuthService.requestPasswordReset(email, role);

      res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/verify-reset-code:
   *   post:
   *     tags: [Authentication]
   *     summary: Verify the reset code
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - code
   *               - role
   *             properties:
   *               email:
   *                 type: string
   *               code:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [user, seller]
   *     responses:
   *       200:
   *         description: Reset code verified successfully.
   *       400:
   *         description: Invalid code or input.
   *       500:
   *         description: Server error.
   */
  static async verifyResetCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, code, role } = req.body;
      const result = await AuthService.verifyResetCode(email, code, role);

      res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/reset-password:
   *   post:
   *     tags: [Authentication]
   *     summary: Reset the user's password
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - newPassword
   *               - role
   *             properties:
   *               email:
   *                 type: string
   *               newPassword:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [user, seller]
   *     responses:
   *       200:
   *         description: Password reset successfully.
   *       400:
   *         description: Invalid input.
   *       500:
   *         description: Server error.
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, newPassword, role } = req.body;
      const result = await AuthService.resetPassword(email, newPassword, role);

      res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
