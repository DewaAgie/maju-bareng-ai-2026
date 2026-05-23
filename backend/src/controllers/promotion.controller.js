import { z } from 'zod';
import * as promotionService from '../services/promotion.service.js';
import asyncHandler from '../middleware/asyncHandler.js';

const promotionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive('Discount value must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.boolean().optional(),
  membershipPlanId: z.string().uuid().optional().nullable(),
});

export const create = asyncHandler(async (req, res) => {
  const data = promotionSchema.parse({
    ...req.body,
    discountValue: Number(req.body.discountValue),
  });
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.body.gymId : req.user.gymId;
  if (req.file) data.imageUrl = `/uploads/promotions/${req.file.filename}`;

  const promotion = await promotionService.createPromotion({
    ...data,
    gymId,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
  });

  res.status(201).json({ success: true, data: promotion, message: 'Promotion created successfully' });
});

export const getAll = asyncHandler(async (req, res) => {
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.query.gymId : req.user.gymId;
  if (!gymId) {
    return res.status(400).json({ success: false, error: 'Gym ID is required' });
  }
  const result = await promotionService.getPromotionsByGym(gymId, req.query);
  res.json({ success: true, ...result, message: 'Promotions retrieved' });
});

export const getById = asyncHandler(async (req, res) => {
  const promotion = await promotionService.getPromotionById(req.params.id);
  res.json({ success: true, data: promotion, message: 'Promotion retrieved' });
});

export const update = asyncHandler(async (req, res) => {
  const data = promotionSchema.partial().parse({
    ...req.body,
    ...(req.body.discountValue && { discountValue: Number(req.body.discountValue) }),
  });
  if (req.file) data.imageUrl = `/uploads/promotions/${req.file.filename}`;
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);

  const promotion = await promotionService.updatePromotion(req.params.id, data);
  res.json({ success: true, data: promotion, message: 'Promotion updated successfully' });
});

export const remove = asyncHandler(async (req, res) => {
  await promotionService.deletePromotion(req.params.id);
  res.json({ success: true, data: null, message: 'Promotion deactivated' });
});
