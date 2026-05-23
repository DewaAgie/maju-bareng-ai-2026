import { z } from 'zod';
import * as facilityService from '../services/facility.service.js';
import asyncHandler from '../middleware/asyncHandler.js';

const facilitySchema = z.object({
  name: z.string().min(1, 'Facility name is required'),
  description: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const create = asyncHandler(async (req, res) => {
  const data = facilitySchema.parse({
    ...req.body,
    capacity: req.body.capacity ? Number(req.body.capacity) : undefined,
  });
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.body.gymId : req.user.gymId;
  if (req.file) data.imageUrl = `/uploads/facilities/${req.file.filename}`;

  const facility = await facilityService.createFacility({ ...data, gymId });
  res.status(201).json({ success: true, data: facility, message: 'Facility created successfully' });
});

export const getAll = asyncHandler(async (req, res) => {
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.query.gymId : req.user.gymId;
  if (!gymId) {
    return res.status(400).json({ success: false, error: 'Gym ID is required' });
  }
  const result = await facilityService.getFacilitiesByGym(gymId, req.query);
  res.json({ success: true, ...result, message: 'Facilities retrieved' });
});

export const getById = asyncHandler(async (req, res) => {
  const facility = await facilityService.getFacilityById(req.params.id);
  res.json({ success: true, data: facility, message: 'Facility retrieved' });
});

export const update = asyncHandler(async (req, res) => {
  const data = facilitySchema.partial().parse({
    ...req.body,
    capacity: req.body.capacity ? Number(req.body.capacity) : undefined,
  });
  if (req.file) data.imageUrl = `/uploads/facilities/${req.file.filename}`;

  const facility = await facilityService.updateFacility(req.params.id, data);
  res.json({ success: true, data: facility, message: 'Facility updated successfully' });
});

export const remove = asyncHandler(async (req, res) => {
  await facilityService.deleteFacility(req.params.id);
  res.json({ success: true, data: null, message: 'Facility deactivated' });
});
