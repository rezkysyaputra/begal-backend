import { Schema, model, Document } from 'mongoose';

interface Notification extends Document {
  user_id: Schema.Types.ObjectId;
  message: string;
  read: boolean;
  created_at: Date;
}

const notificationSchema = new Schema<Notification>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

export const NotificationModel = model<Notification>(
  'Notification',
  notificationSchema
);
