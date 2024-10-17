import { Schema, model, Document } from 'mongoose';

interface User extends Document {
  name: string;
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
  role: 'user' | 'seller' | 'admin';
  profile_picture?: string;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  profile_picture: { type: String, required: false },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postal_code: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const UserModel = model<User>('User', userSchema);
