import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../lib/jwt.js';
import { AppError } from '../utils/AppError.js';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    const decoded = verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        next(new AppError('Invalid token', 401));
      } else if (error.name === 'TokenExpiredError') {
        next(new AppError('Token expired', 401));
      } else {
        next(new AppError('Authentication failed', 401));
      }
    } else {
      next(new AppError('Authentication failed', 401));
    }
  }
};
