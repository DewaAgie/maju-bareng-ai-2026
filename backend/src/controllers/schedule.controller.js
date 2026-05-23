import { z } from 'zod';
import * as scheduleService from '../services/schedule.service.js';
import asyncHandler from '../middleware/asyncHandler.js';

const scheduleSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  coachId: z.string().uuid('Invalid coach ID'),
  facilityId: z.string().uuid('Invalid facility ID'),
  dayOfWeek: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be HH:MM format'),
  isRecurring: z.boolean().optional().default(true),
  isActive: z.boolean().optional(),
});

export const create = asyncHandler(async (req, res) => {
  const data = scheduleSchema.parse(req.body);
  const schedule = await scheduleService.createSchedule(data);

  res.status(201).json({ success: true, data: schedule, message: 'Schedule created successfully' });
});

export const getAll = asyncHandler(async (req, res) => {
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.query.gymId : req.user.gymId;
  const result = await scheduleService.getSchedules({ ...req.query, gymId });
  res.json({ success: true, ...result, message: 'Schedules retrieved' });
});

export const getWeekly = asyncHandler(async (req, res) => {
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.query.gymId : req.user.gymId;
  if (!gymId) {
    return res.status(400).json({ success: false, error: 'Gym ID is required' });
  }
  const weekly = await scheduleService.getWeeklySchedule(gymId);
  res.json({ success: true, data: weekly, message: 'Weekly schedule retrieved' });
});

export const getById = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.getScheduleById(req.params.id);
  res.json({ success: true, data: schedule, message: 'Schedule retrieved' });
});

export const update = asyncHandler(async (req, res) => {
  const data = scheduleSchema.partial().parse(req.body);
  const schedule = await scheduleService.updateSchedule(req.params.id, data);

  res.json({ success: true, data: schedule, message: 'Schedule updated successfully' });
});

export const remove = asyncHandler(async (req, res) => {
  await scheduleService.deleteSchedule(req.params.id);
  res.json({ success: true, data: null, message: 'Schedule deactivated' });
});
