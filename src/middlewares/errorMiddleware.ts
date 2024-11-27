import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodIssue } from 'zod';
import ResponseError from '../helpers/responseError';

export const errorMiddleware = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      errors: err.format(),
    });
    return;
  }

  if (err instanceof ResponseError) {
    res.status(err.status).json({
      success: false,
      errors: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    errors: err.message,
  });
};
