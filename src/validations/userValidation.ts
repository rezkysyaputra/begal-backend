import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string().min(1).max(255),
    email: z.string().email(),
    password: z.string().min(1).max(255),
    phone: z.string().min(1).max(255),
    profile_picture: z.string().optional(),
    role: z.enum(['user', 'seller', 'admin']).default('user'),
    address: z.object({
      province: z.string().min(1).max(255),
      regency: z.string().min(1).max(255),
      district: z.string().min(1).max(255),
      village: z.string().min(1).max(255),
      detail: z.string().min(1).max(255),
      street: z.string().min(1).max(255),
    }),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(1).max(255),
  });
}
