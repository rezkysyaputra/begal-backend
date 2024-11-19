import mongoose from 'mongoose';
import ResponseError from '../helpers/responseError';
import { ReviewModel } from '../models/reviewModel';
import {
  CreateReviewRequest,
  ReviewResponse,
  toReviewResponse,
} from '../types/reviewType';
import { ReviewValidation } from '../validations/reviewValidation';
import { Validation } from '../validations/validation';
import { SellerModel } from '../models/sellerModel';

export class ReviewService {
  static async create(
    user: { id: string },
    data: CreateReviewRequest
  ): Promise<ReviewResponse> {
    const validatedData = Validation.validate(ReviewValidation.CREATE, data);

    if (!mongoose.Types.ObjectId.isValid(data.seller_id)) {
      throw new ResponseError(400, 'Seller tidak ditemukan');
    }

    const seller = await SellerModel.findById(validatedData.seller_id);
    if (!seller) {
      throw new ResponseError(404, 'Seller tidak ditemukan');
    }

    const reviewExists = await ReviewModel.findOne({
      user_id: user.id,
      seller_id: validatedData.seller_id,
    });

    if (reviewExists) {
      throw new ResponseError(400, 'Review sudah ada');
    }

    const newData = {
      ...validatedData,
      user_id: user.id,
    };

    const newReview = await ReviewModel.create(newData);

    const reviews = await ReviewModel.find({
      seller_id: validatedData.seller_id,
    });

    const totalRatings = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating = totalRatings / reviews.length;

    await SellerModel.findByIdAndUpdate(validatedData.seller_id, {
      rating: averageRating,
      reviews_count: reviews.length,
    });

    return toReviewResponse(newReview);
  }
}
