import { Schema, model, Document } from 'mongoose';

interface Admin extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

const adminSchema = new Schema<Admin>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const AdminModel = model<Admin>('Admin', adminSchema);
