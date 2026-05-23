import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../config/database.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { generateQRCodeString, generateBarcodeValue } from '../utils/qr.js';
import { sendWelcomeEmail } from '../config/mailer.js';
import env from '../config/env.js';

// ─── GymInfoBot ─────────────────────────────────────────────────────────────

let genAI;
const getGenAI = () => {
  if (!genAI) {
    if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return genAI;
};

const buildSystemInstruction = (gym) => `
You are GymInfoBot, a helpful assistant for ${gym.name}, a gym and fitness center.
Your sole purpose is to help potential members and website visitors learn about the gym.

You can answer questions about:
- Gym facilities, equipment, and amenities
- Available classes, schedules, and instructors
- Membership plans, pricing, and benefits
- Current promotions and discounts
- How to register or join the gym
- General gym policies, opening hours, and contact info

You must NEVER:
- Recommend drugs, medications, supplements, or any ingestible products
- Provide medical or dietary advice
- Answer questions completely unrelated to the gym or fitness

If asked about something you don't have specific information on, respond:
"I don't have that specific detail right now — please contact us directly at ${gym.phone || 'our phone number'} or ${gym.email || 'our email'} and our team will be happy to help!"

Keep responses friendly, concise, and encouraging. Use bullet points where helpful.
`.trim();

// ─── Validation Schemas ──────────────────────────────────────────────────────

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  membershipPlanId: z.string().uuid('Invalid membership plan ID').optional(),
});

const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        parts: z.array(z.object({ text: z.string() })),
      })
    )
    .optional()
    .default([]),
  gymId: z.string().optional(),
});

// ─── Controllers ─────────────────────────────────────────────────────────────

export const getGym = asyncHandler(async (req, res) => {
  const { gymId } = req.params;
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      email: true,
      logoUrl: true,
      description: true,
    },
  });

  if (!gym) {
    return res.status(404).json({ success: false, error: 'Gym not found' });
  }

  res.json({ success: true, data: gym, message: 'Gym info retrieved' });
});

export const getFacilities = asyncHandler(async (req, res) => {
  const { gymId } = req.params;
  const facilities = await prisma.facility.findMany({
    where: { gymId, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      capacity: true,
      imageUrl: true,
    },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: facilities, message: 'Facilities retrieved' });
});

export const getClasses = asyncHandler(async (req, res) => {
  const { gymId } = req.params;
  const classes = await prisma.class.findMany({
    where: { gymId, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      durationMinutes: true,
      maxCapacity: true,
      imageUrl: true,
    },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: classes, message: 'Classes retrieved' });
});

export const getCoaches = asyncHandler(async (req, res) => {
  const { gymId } = req.params;
  const coaches = await prisma.coach.findMany({
    where: { gymId, isActive: true },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      bio: true,
      specializations: true,
      avatarUrl: true,
    },
    orderBy: { fullName: 'asc' },
  });

  res.json({ success: true, data: coaches, message: 'Coaches retrieved' });
});

export const getMembershipPlans = asyncHandler(async (req, res) => {
  const { gymId } = req.params;
  const plans = await prisma.membershipPlan.findMany({
    where: { gymId, isActive: true },
    include: {
      benefits: {
        select: { id: true, description: true },
        orderBy: { id: 'asc' },
      },
    },
    orderBy: { price: 'asc' },
  });

  res.json({ success: true, data: plans, message: 'Membership plans retrieved' });
});

export const getPromotions = asyncHandler(async (req, res) => {
  const { gymId } = req.params;
  const today = new Date();

  const promotions = await prisma.promotion.findMany({
    where: {
      gymId,
      isActive: true,
      startDate: { lte: today },
      endDate: { gte: today },
    },
    select: {
      id: true,
      title: true,
      description: true,
      discountType: true,
      discountValue: true,
      startDate: true,
      endDate: true,
      imageUrl: true,
    },
    orderBy: { endDate: 'asc' },
  });

  res.json({ success: true, data: promotions, message: 'Promotions retrieved' });
});

export const getSchedules = asyncHandler(async (req, res) => {
  const { gymId } = req.params;

  // ClassSchedule is linked to gymId through class -> gym
  const schedules = await prisma.classSchedule.findMany({
    where: {
      class: { gymId },
      isActive: true,
    },
    include: {
      class: { select: { id: true, name: true, category: true, durationMinutes: true } },
      coach: { select: { id: true, fullName: true } },
      facility: { select: { id: true, name: true } },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });

  // Group by dayOfWeek
  const grouped = schedules.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {});

  res.json({ success: true, data: { schedules, grouped }, message: 'Schedules retrieved' });
});

export const registerMember = asyncHandler(async (req, res) => {
  const { gymId } = req.params;
  const data = registerSchema.parse(req.body);

  // Verify gym exists
  const gym = await prisma.gym.findUnique({ where: { id: gymId } });
  if (!gym) {
    return res.status(404).json({ success: false, error: 'Gym not found' });
  }

  // Check for duplicate email within gym
  const existing = await prisma.member.findFirst({
    where: { email: data.email, gymId },
  });
  if (existing) {
    return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
  }

  const qrCode = generateQRCodeString();
  const barcodeValue = generateBarcodeValue();

  const member = await prisma.member.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      gender: data.gender || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gymId,
      isActive: false,
      qrCode,
      barcodeValue,
    },
  });

  // Assign membership plan if provided
  if (data.membershipPlanId) {
    const plan = await prisma.membershipPlan.findUnique({ where: { id: data.membershipPlanId } });
    if (plan) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationDays);

      await prisma.memberMembership.create({
        data: {
          memberId: member.id,
          membershipPlanId: plan.id,
          startDate,
          endDate,
          status: 'ACTIVE',
        },
      });
    }
  }

  // Send welcome email (non-blocking)
  sendWelcomeEmail(member).catch(() => {});

  res.status(201).json({
    success: true,
    data: {
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      qrCode: member.qrCode,
    },
    message: 'Registration successful! We will contact you shortly to activate your membership.',
  });
});

export const sendGymInfoBotMessage = asyncHandler(async (req, res) => {
  const { message, history, gymId: bodyGymId } = chatMessageSchema.parse(req.body);

  // Fetch gym info to populate system instruction
  const gymId = bodyGymId;
  const gym = await prisma.gym.findFirst({
    where: gymId ? { id: gymId } : undefined,
    select: { name: true, phone: true, email: true },
  });

  const gymInfo = gym || { name: 'GymCore', phone: null, email: null };

  const systemInstruction = buildSystemInstruction(gymInfo);

  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction,
  });

  const chat = model.startChat({
    history: history.map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    })),
  });

  const result = await chat.sendMessage(message);
  const reply = result.response.text();

  res.json({ success: true, data: { reply }, message: 'Message sent' });
});
