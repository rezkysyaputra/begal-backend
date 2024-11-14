import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
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
