import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.get('Authorization')?.split(' ')[1];

  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET as string);

      if (user) {
        (req as any).user = user;
        next();
        return;
      }
    } catch (error) {
      res.status(401).json({
        errors: 'Unauthorized',
      });
      return;
    }
  }

  res.status(401).json({
    errors: 'Unauthorized',
  });
};
