import { Document, model, Schema } from 'mongoose';

interface WishList extends Document {
  user_id: Schema.Types.ObjectId;
  product_id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WishListSchema = new Schema<WishList>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  {
    timestamps: true,
  }
);

WishListSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

export const WishListModel = model<WishList>('WishList', WishListSchema);
