import { z } from 'zod';
import * as planService from '../services/membershipPlan.service.js';
import asyncHandler from '../middleware/asyncHandler.js';

const planSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  durationDays: z.number().int().positive('Duration must be positive'),
  price: z.number().positive('Price must be positive'),
  isActive: z.boolean().optional(),
  benefits: z.array(z.string()).optional(),
});

export const create = asyncHandler(async (req, res) => {
  const data = planSchema.parse({
    ...req.body,
    durationDays: Number(req.body.durationDays),
    price: Number(req.body.price),
  });
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.body.gymId : req.user.gymId;

  const plan = await planService.createPlan({ ...data, gymId });
  res.status(201).json({ success: true, data: plan, message: 'Membership plan created successfully' });
});

export const getAll = asyncHandler(async (req, res) => {
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.query.gymId : req.user.gymId;
  if (!gymId) {
    return res.status(400).json({ success: false, error: 'Gym ID is required' });
  }
  const result = await planService.getPlansByGym(gymId, req.query);
  res.json({ success: true, ...result, message: 'Membership plans retrieved' });
});

export const getById = asyncHandler(async (req, res) => {
  const plan = await planService.getPlanById(req.params.id);
  res.json({ success: true, data: plan, message: 'Membership plan retrieved' });
});

export const update = asyncHandler(async (req, res) => {
  const data = planSchema.partial().parse({
    ...req.body,
    ...(req.body.durationDays && { durationDays: Number(req.body.durationDays) }),
    ...(req.body.price && { price: Number(req.body.price) }),
  });

  const plan = await planService.updatePlan(req.params.id, data);
  res.json({ success: true, data: plan, message: 'Membership plan updated successfully' });
});

export const remove = asyncHandler(async (req, res) => {
  await planService.deletePlan(req.params.id);
  res.json({ success: true, data: null, message: 'Membership plan deactivated' });
});
