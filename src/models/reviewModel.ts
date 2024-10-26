import { Schema, model, Document } from 'mongoose';

interface Review extends Document {
  user_id: Schema.Types.ObjectId;
  seller_id: Schema.Types.ObjectId;
  rating: number;
  review: string;
}

const reviewSchema = new Schema<Review>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller_id: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    rating: { type: Number, required: true },
    review: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const ReviewModel = model<Review>('Review', reviewSchema);
