import { NextFunction, Request, Response } from 'express';
import { WishListService } from '../services/wishListService';

/**
 * @swagger
 * tags:
 *   name: WishList
 *   description: WishList management
 */
export class WithListController {
  /**
   * @swagger
   * /api/wishlists:
   *   post:
   *     tags: [WishList]
   *     summary: Create wishlist only by user
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               product_id:
   *                 type: string
   *                 format: mongo-id
   *             example:
   *               product_id: "62a6c3b4c3a4c3a4c3a4c3a4"
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad request
   */
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

  /**
   * @swagger
   * /api/wishlists:
   *   get:
   *     tags: [WishList]
   *     summary: Get all wishlists only by user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad request
   */
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

  /**
   * @swagger
   * /api/wishlists/{wishlistId}:
   *   delete:
   *     tags: [WishList]
   *     summary: Delete wishlist by ID only by user
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: wishlistId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad request
   */
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
