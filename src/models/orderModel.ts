import { Schema, model, Document } from 'mongoose';

interface Address {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  latitude: number;
  longitude: number;
}

interface OrderProduct {
  product_id: Schema.Types.ObjectId;
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
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  order_date: Date;
  delivery_date: Date;
  updated_at: Date;
}

const addressSchema = new Schema<Address>({
  street: String,
  city: String,
  province: String,
  postal_code: String,
  latitude: Number,
  longitude: Number,
});

const orderProductSchema = new Schema<OrderProduct>({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new Schema<Order>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seller_id: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  products: [orderProductSchema],
  delivery_address: { type: addressSchema, required: true },
  total_price: { type: Number, required: true },
  payment_method: { type: String, enum: ['transfer', 'cash'], required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending',
  },
  order_date: { type: Date, default: Date.now },
  delivery_date: { type: Date },
  updated_at: { type: Date, default: Date.now },
});

export const OrderModel = model<Order>('Order', orderSchema);
