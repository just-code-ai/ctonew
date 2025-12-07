import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else {
    message = err.message;
  }

  console.error(`[Error] ${statusCode}: ${message}`);
  console.error(err.stack);

  const payload: Record<string, unknown> = {
    status: 'error',
    statusCode,
    message: env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal Server Error' : message,
  };

  if (details) {
    payload.details = details;
  }

  if (env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};
