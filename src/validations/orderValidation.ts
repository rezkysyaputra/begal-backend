import { z, ZodType } from 'zod';

export class OrderValidation {
  static readonly CREATE: ZodType = z.object({
    seller_id: z.string().min(1).max(255),
    products: z.array(
      z.object({
        product_id: z.string().min(1).max(255),
        quantity: z.number().min(1),
      })
    ),
    payment_method: z.enum(['transfer', 'cash']),
  });

  static readonly ORDER_STATUS_SELLER: ZodType = z.enum([
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
  ]);

  static readonly ORDER_STATUS_USER: ZodType = z.enum([
    'delivered',
    'cancelled',
  ]);

  static readonly ORDER_STATUS_PAYMENT: ZodType = z.enum(['success', 'failed']);
}
