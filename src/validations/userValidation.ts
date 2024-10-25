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

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).max(255).optional(),
    profile_picture: z.string().optional(),
    address: z
      .object({
        province: z.string().min(1).max(255).optional(),
        regency: z.string().min(1).max(255).optional(),
        district: z.string().min(1).max(255).optional(),
        village: z.string().min(1).max(255).optional(),
        detail: z.string().min(1).max(255).optional(),
        street: z.string().min(1).max(255).optional(),
      })
      .optional(),
  });

  static readonly CHANGE_PASSWORD: ZodType = z.object({
    old_password: z.string().min(1).max(255),
    new_password: z.string().min(1).max(255),
  });
}
