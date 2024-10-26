import { Schema, model, Document } from 'mongoose';

interface Admin extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
}

const adminSchema = new Schema<Admin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  {
    timestamps: true,
  }
);

export const AdminModel = model<Admin>('Admin', adminSchema);
