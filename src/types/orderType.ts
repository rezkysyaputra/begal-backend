export type CreateOrderResponse = {
  order_id: string;
  token?: string | null;
  redirect_url?: string | null;
  payment_method: string;
};

type OrderProduct = {
  product_id: string;
  name: string;
  image_url?: string;
  quantity: number;
  price: number;
};

type Address = {
  province: string;
  regency: string;
  district: string;
  village: string;
  street: string;
  detail: string;
};

export type Order = {
  _id: string;
  user_id: string;
  seller_id: string;
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
  created_at: Date;
  updated_at: Date;
};

export type CreateOrderRequest = {
  seller_id: string;
  products: OrderProduct[];
  payment_method: 'transfer' | 'cash';
};
export type MidtransResponse = {
  transaction_id?: string;
  payment_code?: string;
  payment_response?: Record<string, any>;
  payment_expiry?: Date;
};

export type StatusOrder = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export const toOrderResponse = (order: any): Order => {
  return {
    _id: order._id,
    user_id: order.user_id,
    seller_id: order.seller_id,
    total_price: order.total_price,
    payment_method: order.payment_method,
    status: order.status,
    payment_status: order.payment_status,
    transaction_id: order.transaction_id,
    payment_code: order.payment_code,
    payment_response: order.payment_response,
    payment_expiry: order.payment_expiry,
    products: order.products,
    delivery_address: order.delivery_address,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
};
