import { Schema, model, Document } from 'mongoose';

interface Seller extends Document {
  name: string;
  owner_name: string;
  email: string;
  password: string;
  phone: string;
  address: {
    province: string;
    regency: string;
    district: string;
    village: string;
    street: string;
    detail: string;
  };
  operational_hours: {
    open: string;
    close: string;
  };
  rating: number;
  reviews_count: number;
  created_at: Date;
  updated_at: Date;
}

const sellerSchema = new Schema<Seller>({
  name: { type: String, required: true },
  owner_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    province: { type: String, required: true },
    regency: { type: String, required: true },
    district: { type: String, required: true },
    village: { type: String, required: true },
    street: { type: String, required: true },
    detail: { type: String, required: true },
  },
  operational_hours: {
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  rating: { type: Number, default: 0 },
  reviews_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const SellerModel = model<Seller>('Seller', sellerSchema);
