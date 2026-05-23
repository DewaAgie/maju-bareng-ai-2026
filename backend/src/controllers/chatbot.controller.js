import { z } from 'zod';
import * as chatbotService from '../services/chatbot.service.js';
import asyncHandler from '../middleware/asyncHandler.js';

const messageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      parts: z.array(z.object({ text: z.string() })),
    })
  ).optional().default([]),
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { message, history } = messageSchema.parse(req.body);
  const result = await chatbotService.sendMessage(message, history);

  res.json({
    success: true,
    data: result,
  });
});
