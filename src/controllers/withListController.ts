import { NextFunction, Request, Response } from 'express';
import { WishListService } from '../services/wishListService';

export class WithListController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      data.user_id = (req as any).user.id;

      const result = await WishListService.create(data);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await WishListService.getAll(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { wishlistId } = req.params;
      const result = await WishListService.delete(wishlistId);

      res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
