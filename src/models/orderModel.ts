import { Schema, model, Document } from 'mongoose';

interface Address {
  province: string;
  regency: string;
  district: string;
  village: string;
  street: string;
  detail: string;
}

interface OrderProduct {
  product_id: Schema.Types.ObjectId;
  name: string;
  image_url?: string;
  quantity: number;
  price: number;
}

interface Order extends Document {
  user_id: Schema.Types.ObjectId;
  seller_id: Schema.Types.ObjectId;
  products: OrderProduct[];
  delivery_address: Address;
  total_price: number;
  payment_method: 'transfer' | 'cash';
  payment_status: 'pending' | 'success' | 'failed';
  transaction_id: string;
  payment_code?: string;
  payment_response?: Record<string, any>;
  payment_expiry?: Date;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<Address>({
  province: String,
  regency: String,
  district: String,
  village: String,
  street: String,
  detail: String,
});

const orderProductSchema = new Schema<OrderProduct>({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image_url: { type: String, required: false },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new Schema<Order>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller_id: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    products: [orderProductSchema],
    delivery_address: { type: addressSchema, required: true },
    total_price: { type: Number, required: true },
    payment_method: {
      type: String,
      enum: ['transfer', 'cash'],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    transaction_id: { type: String, required: false },
    payment_code: { type: String },
    payment_response: { type: Schema.Types.Mixed },
    payment_expiry: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = model<Order>('Order', orderSchema);
