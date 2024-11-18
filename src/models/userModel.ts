import { Schema, model, Document } from 'mongoose';

interface User extends Document {
  name: string;
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
  role: 'user' | 'seller' | 'admin';
  profile_picture_url?: string;
  reset_code?: string;
  reset_code_expiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    profile_picture_url: { type: String, required: false },
    role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
    address: {
      province: { type: String, required: true },
      regency: { type: String, required: true },
      district: { type: String, required: true },
      village: { type: String, required: true },
      street: { type: String, required: true },
      detail: { type: String, required: true },
    },
    reset_code: { type: String },
    reset_code_expiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<User>('User', userSchema);
