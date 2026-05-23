import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const publicApi = axios.create({
  baseURL: `${API_URL}/public`,
  headers: { 'Content-Type': 'application/json' },
});

const GYM_ID = import.meta.env.VITE_GYM_ID || '1';

export const getPublicGymApi = () => publicApi.get(`/gym/${GYM_ID}`);
export const getPublicFacilitiesApi = () => publicApi.get(`/gym/${GYM_ID}/facilities`);
export const getPublicClassesApi = () => publicApi.get(`/gym/${GYM_ID}/classes`);
export const getPublicCoachesApi = () => publicApi.get(`/gym/${GYM_ID}/coaches`);
export const getPublicMembershipPlansApi = () => publicApi.get(`/gym/${GYM_ID}/membership-plans`);
export const getPublicPromotionsApi = () => publicApi.get(`/gym/${GYM_ID}/promotions`);
export const getPublicSchedulesApi = () => publicApi.get(`/gym/${GYM_ID}/schedules`);
export const registerPublicMemberApi = (data) => publicApi.post(`/gym/${GYM_ID}/register`, data);
export const sendGymInfoBotMessageApi = (data) =>
  publicApi.post('/chatbot/message', { ...data, gymId: GYM_ID });
