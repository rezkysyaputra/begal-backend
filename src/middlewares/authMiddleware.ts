import jwt from 'jsonwebtoken';
import { NextFunction, Request, RequestHandler, Response } from 'express';

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

export const roleAuthorization = (roles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user.role;

    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ message: 'Akses ditolak' });
      return;
    }
    next();
  };
};
