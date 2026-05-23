import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Generate an access token (15 minutes expiry).
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

/**
 * Generate a refresh token (7 days expiry).
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Verify an access token.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

/**
 * Verify a refresh token.
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
