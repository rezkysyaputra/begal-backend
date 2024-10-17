import { Schema, model, Document } from 'mongoose';

interface Seller extends Document {
  name: string;
  owner_name: string;
  email: string;
  password: string;
  phone: string;
  address: {
    street: string;
    city: string;
    province: string;
    postal_code: string;
    latitude: number;
    longitude: number;
  };
  operational_hours: {
    open: string;
    close: string;
  };
  rating: number;
  reviews_count: number;
  verified: boolean;
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
    street: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postal_code: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  operational_hours: {
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  rating: { type: Number, default: 0 },
  reviews_count: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const SellerModel = model<Seller>('Seller', sellerSchema);
