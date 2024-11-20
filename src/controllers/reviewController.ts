import { NextFunction, Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';
import { ReviewResponse } from '../types/reviewType';

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Review management by user
 */

export class ReviewController {
  /**
   * @swagger
   * /api/users/reviews:
   *   post:
   *     summary: Create a new review only by user
   *     tags: [Review]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - seller_id
   *               - rating
   *             properties:
   *               seller_id:
   *                 type: string
   *               rating:
   *                 type: number
   *               review:
   *                 type: string
   *     responses:
   *       200:
   *         description: Review created successfully
   *       400:
   *         description: Bad request
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const user = (req as any).user;
      const result: ReviewResponse = await ReviewService.create(user, data);

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
   * /api/users/reviews/{reviewId}:
   *   get:
   *     summary: Get a review by ID for user
   *     tags: [Review]
   *     parameters:
   *       - in: path
   *         name: reviewId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Review retrieved successfully
   *       400:
   *         description: Bad request
   */
  static async getReviewsBySellerId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { sellerId } = req.params;

      const result: ReviewResponse[] = await ReviewService.getReviewsBySellerId(
        sellerId
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
   * /api/sellers/reviews:
   *   get:
   *     summary: Get all reviews only by seller
   *     tags: [Review]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Reviews retrieved successfully
   *       400:
   *         description: Bad request
   */
  static async getAllReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result: ReviewResponse[] = await ReviewService.getAllReviews(user);

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
   * /api/users/reviews/{reviewId}:
   *   patch:
   *     summary: Update a review by ID only by user
   *     tags: [Review]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: reviewId
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
   *               rating:
   *                 type: number
   *               review:
   *                 type: string
   *     responses:
   *       200:
   *         description: Review updated successfully
   *       400:
   *         description: Bad request
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const user = (req as any).user;
      const { reviewId } = req.params;

      const result: ReviewResponse = await ReviewService.update(
        user,
        reviewId,
        data
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
   * /api/users/reviews/{reviewId}:
   *   delete:
   *     summary: Delete a review by ID only by user
   *     tags: [Review]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: reviewId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Review deleted successfully
   *       400:
   *         description: Bad request
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const { reviewId } = req.params;

      const result: string = await ReviewService.delete(user, reviewId);

      res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
