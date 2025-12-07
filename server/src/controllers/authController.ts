import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { generateAuthTokens, verifyRefreshToken } from '../lib/jwt.js';
import { AppError } from '../utils/AppError.js';
import { RegisterInput, LoginInput, RefreshInput } from '../schemas/authSchemas.js';
import { toUserResponse } from '../utils/userMapper.js';

export const register = async (
  req: Request<object, object, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, displayName } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        displayName,
      },
    });

    const tokens = generateAuthTokens({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: toUserResponse(user),
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokens = generateAuthTokens({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: toUserResponse(user),
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request<object, object, RefreshInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const tokens = generateAuthTokens({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    });

    res.status(200).json({
      status: 'success',
      data: tokens,
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
      next(new AppError('Invalid or expired refresh token', 401));
    } else {
      next(error);
    }
  }
};
