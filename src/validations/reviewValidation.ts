import { z, ZodType } from 'zod';

export class ReviewValidation {
  static readonly CREATE: ZodType = z.object({
    seller_id: z.string().min(1).max(255),
    rating: z.number().min(1).max(5),
    review: z.string().min(1).max(255).optional(),
  });
}
