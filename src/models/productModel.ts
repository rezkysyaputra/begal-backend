import { Schema, model, Document } from 'mongoose';

interface Product extends Document {
  seller_id: Schema.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
}

const productSchema = new Schema<Product>(
  {
    seller_id: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    image_url: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export const ProductModel = model<Product>('Product', productSchema);
