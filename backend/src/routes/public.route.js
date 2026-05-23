import { Router } from 'express';
import * as publicController from '../controllers/public.controller.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { success: false, error: 'Too many messages. Please wait a moment.' },
});

router.use(publicLimiter);

router.get('/gym/:gymId', publicController.getGym);
router.get('/gym/:gymId/facilities', publicController.getFacilities);
router.get('/gym/:gymId/classes', publicController.getClasses);
router.get('/gym/:gymId/coaches', publicController.getCoaches);
router.get('/gym/:gymId/membership-plans', publicController.getMembershipPlans);
router.get('/gym/:gymId/promotions', publicController.getPromotions);
router.get('/gym/:gymId/schedules', publicController.getSchedules);
router.post('/gym/:gymId/register', publicController.registerMember);
router.post('/chatbot/message', chatbotLimiter, publicController.sendGymInfoBotMessage);

export default router;
