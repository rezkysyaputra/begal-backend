import { NextFunction, Request, Response } from "express";
import { WishListService } from "../services/wishListService";

/**
 * @swagger
 * tags:
 *   name: WishList
 *   description: WishList management
 */
export class WishListController {
  /**
   * @swagger
   * /api/users/wishlist:
   *   post:
   *     tags: [WishList]
   *     summary: Create wishlist only by user
   *     security:
   *       - userAuth: []
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
   *                 description: The ID of the product to add to the wishlist
   *             example:
   *               product_id: "62a6c3b4c3a4c3a4c3a4c3a4"
   *     responses:
   *       201:
   *         description: Wishlist created successfully
   *       400:
   *         description: Invalid request body
   *       401:
   *         description: Unauthorized
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      data.user_id = (req as any).user.id;

      const result = await WishListService.create(data);

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
   * /api/users/wishlist:
   *   get:
   *     tags: [WishList]
   *     summary: Get all wishlists only by user
   *     security:
   *       - userAuth: []
   *     responses:
   *       200:
   *         description: Retrieved all wishlists successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
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
   * /api/users/wishlist/{wishlistId}:
   *   delete:
   *     tags: [WishList]
   *     summary: Delete wishlist by ID only by user
   *     security:
   *       - userAuth: []
   *     parameters:
   *       - in: path
   *         name: wishlistId
   *         required: true
   *         schema:
   *           type: string
   *           format: mongo-id
   *           description: The ID of the wishlist to delete
   *     responses:
   *       200:
   *         description: Wishlist deleted successfully
   *       400:
   *         description: Invalid wishlist ID
   *       404:
   *         description: Wishlist not found
   *       401:
   *         description: Unauthorized
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
