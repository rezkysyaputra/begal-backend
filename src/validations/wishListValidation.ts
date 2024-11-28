import { z, ZodType } from 'zod';

export class WishListValidation {
  static readonly WISH_LIST: ZodType = z.object({
    user_id: z.string().min(1).max(255),
    product_id: z.string().min(1).max(255),
  });
}
