import { z } from 'zod';
import * as gymService from '../services/gym.service.js';
import asyncHandler from '../middleware/asyncHandler.js';

const gymSchema = z.object({
  name: z.string().min(1, 'Gym name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const create = asyncHandler(async (req, res) => {
  const data = gymSchema.parse(req.body);
  if (req.file) data.logoUrl = `/uploads/gyms/${req.file.filename}`;
  const gym = await gymService.createGym(data);

  res.status(201).json({ success: true, data: gym, message: 'Gym created successfully' });
});

export const getAll = asyncHandler(async (req, res) => {
  const result = await gymService.getAllGyms(req.query);
  res.json({ success: true, ...result, message: 'Gyms retrieved' });
});

export const getById = asyncHandler(async (req, res) => {
  const gym = await gymService.getGymById(req.params.id);
  res.json({ success: true, data: gym, message: 'Gym retrieved' });
});

export const update = asyncHandler(async (req, res) => {
  const data = gymSchema.partial().parse(req.body);
  if (req.file) data.logoUrl = `/uploads/gyms/${req.file.filename}`;
  const gym = await gymService.updateGym(req.params.id, data);

  res.json({ success: true, data: gym, message: 'Gym updated successfully' });
});

export const remove = asyncHandler(async (req, res) => {
  await gymService.deleteGym(req.params.id);
  res.json({ success: true, data: null, message: 'Gym deactivated' });
});
