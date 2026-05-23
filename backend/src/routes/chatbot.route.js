import { Router } from 'express';
import * as chatbotController from '../controllers/chatbot.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limit: max 20 requests per minute per user
const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, error: 'Too many messages. Please wait a moment.' },
});

router.use(authenticate);

router.post('/message', chatbotLimiter, chatbotController.sendMessage);

export default router;
