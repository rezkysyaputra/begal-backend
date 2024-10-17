import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import ResponseError from '../helpers/responseError';

export const errorMiddleware = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!err) {
    next();
    return;
  }

  if (err instanceof ResponseError) {
    res.status(err.status).json({
      errors: err.message,
    });
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      errors: JSON.stringify(err.issues.map((issue) => issue.message)),
    });
  }

  res.status(500).json({
    errors: err.message,
  });
};
