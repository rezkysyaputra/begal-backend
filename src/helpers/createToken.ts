import jwt from 'jsonwebtoken';
import { LoginUserRequest } from '../types/userType';
export const CreateJwtToken = (payload: LoginUserRequest): string => {
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });

  return token;
};
