import { z, ZodType } from 'zod';

export class ProductValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(255),
    description: z.string().min(1).max(255),
    price: z.number().min(1),
    stock: z.number().min(1),
    image_url: z.string().optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(1).max(255),
    name: z.string().min(1).max(255).optional(),
    description: z.string().min(1).max(255).optional(),
    price: z.number().min(1).optional(),
    stock: z.number().min(1).optional(),
    image_url: z.string().optional(),
  });
}
