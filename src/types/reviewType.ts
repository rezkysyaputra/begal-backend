export type ReviewResponse = {
  id: string;
  user_name: string;
  user_id: string;
  seller_id: string;
  rating: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateReviewRequest = {
  seller_id: string;
  rating: number;
  comment?: string;
};

export type UpdateReviewRequest = {
  rating?: number;
  comment?: string;
};

export function toReviewResponse(review: any): ReviewResponse {
  return {
    id: review._id,
    user_name: review.name,
    user_id: review.user_id,
    seller_id: review.seller_id,
    rating: review.rating,
    comment: review.review,
    created_at: review.createdAt,
    updated_at: review.updatedAt,
  };
}
