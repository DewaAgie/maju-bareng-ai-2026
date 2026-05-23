import { z } from 'zod';
import * as classService from '../services/class.service.js';
import asyncHandler from '../middleware/asyncHandler.js';

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  durationMinutes: z.number().int().positive('Duration must be positive'),
  maxCapacity: z.number().int().positive('Max capacity must be positive'),
  isActive: z.boolean().optional(),
});

export const create = asyncHandler(async (req, res) => {
  const data = classSchema.parse({
    ...req.body,
    durationMinutes: Number(req.body.durationMinutes),
    maxCapacity: Number(req.body.maxCapacity),
  });
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.body.gymId : req.user.gymId;
  if (req.file) data.imageUrl = `/uploads/classes/${req.file.filename}`;

  const cls = await classService.createClass({ ...data, gymId });
  res.status(201).json({ success: true, data: cls, message: 'Class created successfully' });
});

export const getAll = asyncHandler(async (req, res) => {
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.query.gymId : req.user.gymId;
  if (!gymId) {
    return res.status(400).json({ success: false, error: 'Gym ID is required' });
  }
  const result = await classService.getClassesByGym(gymId, req.query);
  res.json({ success: true, ...result, message: 'Classes retrieved' });
});

export const getById = asyncHandler(async (req, res) => {
  const cls = await classService.getClassById(req.params.id);
  res.json({ success: true, data: cls, message: 'Class retrieved' });
});

export const update = asyncHandler(async (req, res) => {
  const data = classSchema.partial().parse({
    ...req.body,
    ...(req.body.durationMinutes && { durationMinutes: Number(req.body.durationMinutes) }),
    ...(req.body.maxCapacity && { maxCapacity: Number(req.body.maxCapacity) }),
  });
  if (req.file) data.imageUrl = `/uploads/classes/${req.file.filename}`;

  const cls = await classService.updateClass(req.params.id, data);
  res.json({ success: true, data: cls, message: 'Class updated successfully' });
});

export const remove = asyncHandler(async (req, res) => {
  await classService.deleteClass(req.params.id);
  res.json({ success: true, data: null, message: 'Class deactivated' });
});
