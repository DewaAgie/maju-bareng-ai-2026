import { z } from 'zod';
import * as memberService from '../services/member.service.js';
import asyncHandler from '../middleware/asyncHandler.js';

const memberSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  isActive: z.boolean().optional(),
});

const membershipAssignSchema = z.object({
  membershipPlanId: z.string().uuid('Invalid membership plan ID'),
  startDate: z.string().min(1, 'Start date is required'),
});

export const create = asyncHandler(async (req, res) => {
  const data = memberSchema.parse(req.body);
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.body.gymId : req.user.gymId;
  if (req.file) data.avatarUrl = `/uploads/members/${req.file.filename}`;

  const member = await memberService.createMember({
    ...data,
    gymId,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
  });

  res.status(201).json({ success: true, data: member, message: 'Member registered successfully' });
});

export const getAll = asyncHandler(async (req, res) => {
  const gymId = req.user.role === 'SUPER_ADMIN' ? req.query.gymId : req.user.gymId;
  if (!gymId) {
    return res.status(400).json({ success: false, error: 'Gym ID is required' });
  }
  const result = await memberService.getMembersByGym(gymId, req.query);
  res.json({ success: true, ...result, message: 'Members retrieved' });
});

export const getById = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberById(req.params.id);
  res.json({ success: true, data: member, message: 'Member retrieved' });
});

export const update = asyncHandler(async (req, res) => {
  const data = memberSchema.partial().parse(req.body);
  if (req.file) data.avatarUrl = `/uploads/members/${req.file.filename}`;
  if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);

  const member = await memberService.updateMember(req.params.id, data);
  res.json({ success: true, data: member, message: 'Member updated successfully' });
});

export const remove = asyncHandler(async (req, res) => {
  await memberService.deleteMember(req.params.id);
  res.json({ success: true, data: null, message: 'Member deactivated' });
});

export const assignMembership = asyncHandler(async (req, res) => {
  const { membershipPlanId, startDate } = membershipAssignSchema.parse(req.body);
  const membership = await memberService.assignMembership(req.params.id, membershipPlanId, startDate);

  res.status(201).json({ success: true, data: membership, message: 'Membership assigned successfully' });
});
