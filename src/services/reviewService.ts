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
import { UserModel } from '../models/userModel';

export class ReviewService {
  static async create(
    user: { id: string },
    data: CreateReviewRequest
  ): Promise<ReviewResponse> {
    const validatedData = Validation.validate(ReviewValidation.CREATE, data);

    if (!mongoose.Types.ObjectId.isValid(data.seller_id)) {
      throw new ResponseError(404, 'Seller tidak ditemukan');
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

    console.log(newData);

    const newReview = await ReviewModel.create(newData);
    console.log(newData);
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

    const userReviews = await UserModel.findById(user.id).select('name');

    const response = {
      ...toReviewResponse(newReview),
      user_name: (userReviews as any).name,
    };

    console.log(response);

    return response;
  }

  static async getReviewsBySellerId(
    sellerId: string
  ): Promise<ReviewResponse[]> {
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new ResponseError(404, 'Seller tidak ditemukan');
    }

    const reviews = await ReviewModel.find({ seller_id: sellerId }).populate(
      'user_id',
      'name'
    );

    if (!reviews.length) {
      throw new ResponseError(404, 'Review untuk seller tidak ditemukan');
    }

    const response = reviews.map((review) => ({
      ...toReviewResponse(review),
      user_name: (review.user_id as any).name,
      user_id: (review.user_id as any)._id,
    }));

    return response;
  }

  static async getAllReviews(user: { id: string }): Promise<ReviewResponse[]> {
    const reviews = await ReviewModel.find({ seller_id: user.id }).populate(
      'user_id',
      'name'
    );

    if (!reviews.length) {
      throw new ResponseError(404, 'Review untuk seller tidak ditemukan');
    }

    const response = reviews.map((review) => ({
      ...toReviewResponse(review),
      user_name: (review.user_id as any).name,
      user_id: (review.user_id as any)._id,
    }));

    return response;
  }

  static async update(
    user: { id: string },
    reviewId: string,
    data: CreateReviewRequest
  ) {
    const validatedData = Validation.validate(ReviewValidation.UPDATE, data);

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      throw new ResponseError(400, 'Review tidak valid');
    }

    const review = await ReviewModel.findOne({
      _id: reviewId,
      user_id: user.id,
    });

    if (!review) {
      throw new ResponseError(404, 'Review tidak ditemukan');
    }

    const updatedReview = await ReviewModel.findByIdAndUpdate(
      reviewId,
      { ...validatedData },
      { new: true }
    );

    if (!updatedReview) {
      throw new ResponseError(404, 'Gagal mengupdate review');
    }

    const reviews = await ReviewModel.find({ seller_id: review.seller_id });
    const totalRatings = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = totalRatings / reviews.length;

    await SellerModel.findByIdAndUpdate(review.seller_id, {
      rating: averageRating,
      reviews_count: reviews.length,
    });

    const userDetails = await UserModel.findById(user.id);
    if (!userDetails) {
      throw new ResponseError(404, 'User tidak ditemukan');
    }

    return {
      ...toReviewResponse(updatedReview),
      user_name: userDetails.name,
    };
  }

  static async delete(user: { id: string }, reviewId: string) {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      throw new ResponseError(400, 'Review tidak valid');
    }

    const review = await ReviewModel.findOneAndDelete({
      _id: reviewId,
      user_id: user.id,
    });

    if (!review) {
      throw new ResponseError(404, 'Review tidak ditemukan');
    }

    const reviews = await ReviewModel.find({ seller_id: review.seller_id });
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRatings = reviews.reduce((sum, rev) => sum + rev.rating, 0);
      averageRating = totalRatings / reviews.length;
    }

    await SellerModel.findByIdAndUpdate(review.seller_id, {
      rating: averageRating,
      reviews_count: reviews.length,
    });

    return 'Review berhasil dihapus';
  }
}
