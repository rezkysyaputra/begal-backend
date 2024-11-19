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
   * /api/reviews:
   *   post:
   *     summary: Create a new review
   *     tags: [Review]
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
}
