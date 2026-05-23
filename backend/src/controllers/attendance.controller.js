import { z } from 'zod';
import * as attendanceService from '../services/attendance.service.js';
import asyncHandler from '../middleware/asyncHandler.js';

const checkInSchema = z.object({
  qrCode: z.string().optional(),
  barcodeValue: z.string().optional(),
  gymId: z.string().uuid('Invalid gym ID'),
}).refine((data) => data.qrCode || data.barcodeValue, {
  message: 'Either qrCode or barcodeValue is required',
});

export const checkIn = asyncHandler(async (req, res) => {
  const data = checkInSchema.parse(req.body);
  const result = await attendanceService.checkIn(data);

  res.status(201).json({ success: true, data: result, message: 'Check-in successful' });
});

export const getLogs = asyncHandler(async (req, res) => {
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.query.gymId : req.user.gymId;
  if (!gymId) {
    return res.status(400).json({ success: false, error: 'Gym ID is required' });
  }
  const result = await attendanceService.getAttendanceLogs(gymId, req.query);
  res.json({ success: true, ...result, message: 'Attendance logs retrieved' });
});

export const getToday = asyncHandler(async (req, res) => {
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.query.gymId : req.user.gymId;
  if (!gymId) {
    return res.status(400).json({ success: false, error: 'Gym ID is required' });
  }
  const result = await attendanceService.getTodayAttendance(gymId);
  res.json({ success: true, data: result, message: "Today's attendance retrieved" });
});

export const getMemberAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.getMemberAttendance(req.params.memberId, req.query);
  res.json({ success: true, ...result, message: 'Member attendance retrieved' });
});
