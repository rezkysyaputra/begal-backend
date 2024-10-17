import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string().min(1).max(255),
    email: z.string().email(),
    password: z.string().min(1).max(255),
    phone: z.string().min(1).max(255),
    profile_picture: z.string().optional(),
    address: z.object({
      street: z.string().min(1).max(255),
      city: z.string().min(1).max(255),
      province: z.string().min(1).max(255),
      postal_code: z.string().min(1).max(255),
      latitude: z.number(),
      longitude: z.number(),
    }),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(1).max(255),
  });
}
