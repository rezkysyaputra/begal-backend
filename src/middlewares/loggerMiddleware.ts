import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Middleware untuk mencatat informasi setiap request
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming Request: ${req.method} ${req.url}`);
  next();
};

// Middleware untuk mencatat informasi error
const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error occurred: ${err.message}`);
  next(err);
};

export { requestLogger, errorLogger };
