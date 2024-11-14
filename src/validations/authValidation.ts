import { z } from 'zod';

export class AuthValidation {
  static readonly email = z.string().min(5).max(255);
  static readonly password = z.string().min(5).max(255);
}
