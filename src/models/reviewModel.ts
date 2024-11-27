import { Schema, model, Document } from 'mongoose';

interface Review extends Document {
  user_id: Schema.Types.ObjectId;
  seller_id: Schema.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<Review>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller_id: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const ReviewModel = model<Review>('Review', reviewSchema);
