import { z, ZodType } from 'zod';

export class OrderValidation {
  static readonly CREATE: ZodType = z.object({
    seller_id: z.string().min(1).max(255),
    products: z.array(
      z.object({
        product_id: z.string().min(1).max(255),
        quantity: z.number().min(1),
        price: z.number().min(1),
      })
    ),
    payment_method: z.enum(['transfer', 'cash']),
  });
}
