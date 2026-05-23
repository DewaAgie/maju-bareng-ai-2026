import api from './axios.js';

export const getPromotionsApi = (params) => api.get('/promotions', { params });
export const getPromotionApi = (id) => api.get(`/promotions/${id}`);
export const createPromotionApi = (data) => api.post('/promotions', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePromotionApi = (id, data) => api.put(`/promotions/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePromotionApi = (id) => api.delete(`/promotions/${id}`);
