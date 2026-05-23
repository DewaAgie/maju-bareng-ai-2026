import { z } from 'zod';
import * as coachService from '../services/coach.service.js';
import asyncHandler from '../middleware/asyncHandler.js';

const coachSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specializations: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional(),
});

export const create = asyncHandler(async (req, res) => {
  const data = coachSchema.parse(req.body);
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.body.gymId : req.user.gymId;
  if (req.file) data.avatarUrl = `/uploads/coaches/${req.file.filename}`;

  const coach = await coachService.createCoach({ ...data, gymId });
  res.status(201).json({ success: true, data: coach, message: 'Coach created successfully' });
});

export const getAll = asyncHandler(async (req, res) => {
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.query.gymId : req.user.gymId;
  if (!gymId) {
    return res.status(400).json({ success: false, error: 'Gym ID is required' });
  }
  const result = await coachService.getCoachesByGym(gymId, req.query);
  res.json({ success: true, ...result, message: 'Coaches retrieved' });
});

export const getById = asyncHandler(async (req, res) => {
  const coach = await coachService.getCoachById(req.params.id);
  res.json({ success: true, data: coach, message: 'Coach retrieved' });
});

export const update = asyncHandler(async (req, res) => {
  const data = coachSchema.partial().parse(req.body);
  if (req.file) data.avatarUrl = `/uploads/coaches/${req.file.filename}`;

  const coach = await coachService.updateCoach(req.params.id, data);
  res.json({ success: true, data: coach, message: 'Coach updated successfully' });
});

export const remove = asyncHandler(async (req, res) => {
  await coachService.deleteCoach(req.params.id);
  res.json({ success: true, data: null, message: 'Coach deactivated' });
});
