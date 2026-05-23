import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import prisma from '../config/database.js';

/**
 * JWT authentication middleware.
 * Validates Bearer token from Authorization header and attaches req.user.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token is required',
        details: [],
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        gymId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive',
        details: [],
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        details: [],
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      details: [],
    });
  }
};

export default authenticate;
