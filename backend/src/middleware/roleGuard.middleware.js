/**
 * Role guard middleware factory.
 * Usage: requireRole('SUPER_ADMIN') or requireRole('GYM_ADMIN', 'SUPER_ADMIN')
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        details: [],
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        details: [],
      });
    }

    next();
  };
};

export default requireRole;
