import * as dashboardService from '../services/dashboard.service.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.query.gymId : req.user.gymId;
  if (!gymId) {
    return res.status(400).json({ success: false, error: 'Gym ID is required' });
  }
  const stats = await dashboardService.getDashboardStats(gymId);
  res.json({ success: true, data: stats, message: 'Dashboard stats retrieved' });
});
