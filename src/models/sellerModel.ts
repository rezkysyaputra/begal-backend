import { Schema, model, Document } from 'mongoose';

interface Seller extends Document {
  name: string;
  owner_name: string;
  email: string;
  password: string;
  phone: string;
  profile_picture_url?: string;
  role: 'user' | 'seller' | 'admin';
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
  reset_code?: string;
  reset_code_expiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sellerSchema = new Schema<Seller>(
  {
    name: { type: String, required: true },
    owner_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    profile_picture_url: { type: String, required: false },
    role: {
      type: String,
      enum: ['user', 'seller', 'admin'],
      default: 'seller',
    },
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
    reset_code: { type: String },
    reset_code_expiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const SellerModel = model<Seller>('Seller', sellerSchema);
