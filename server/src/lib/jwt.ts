import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayloadInput {
  id: string;
  email: string;
  displayName: string;
}

export interface TokenPayload extends JwtPayload {
  sub: string;
  email: string;
  displayName: string;
}

const buildPayload = ({ id, email, displayName }: TokenPayloadInput) => ({
  sub: id,
  email,
  displayName,
});

const ACCESS_TOKEN_SECRET: jwt.Secret = env.JWT_SECRET;
const REFRESH_TOKEN_SECRET: jwt.Secret = env.JWT_REFRESH_SECRET;

export const generateAccessToken = (payload: TokenPayloadInput): string => {
  return jwt.sign(buildPayload(payload), ACCESS_TOKEN_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: TokenPayloadInput): string => {
  return jwt.sign(buildPayload(payload), REFRESH_TOKEN_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};


export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
};

export const generateAuthTokens = (payload: TokenPayloadInput) => ({
  accessToken: generateAccessToken(payload),
  refreshToken: generateRefreshToken(payload),
  expiresIn: env.JWT_EXPIRES_IN,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
});
