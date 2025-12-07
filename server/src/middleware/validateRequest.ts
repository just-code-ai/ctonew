import { NextFunction, Request, Response } from 'express';
import { ZodObject, ZodRawShape, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validateRequest = (schema: ZodObject<ZodRawShape>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError('Validation error', 400, error.flatten()));
      } else {
        next(new AppError('Invalid request', 400));
      }
    }
  };
