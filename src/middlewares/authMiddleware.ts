import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface CustomRequest extends Request {
  user?: string | JwtPayload;
}

export const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.get('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const user = jwt.verify(token as string, JWT_SECRET);

    if (user) {
      req.user = user;
      next();
    }
  }

  res.status(401).json({
    errors: 'Unauthorized',
  });
};
