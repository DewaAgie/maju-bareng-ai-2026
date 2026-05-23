import api from './axios.js';

export const getMembershipPlansApi = (params) => api.get('/membership-plans', { params });
export const getMembershipPlanApi = (id) => api.get(`/membership-plans/${id}`);
export const createMembershipPlanApi = (data) => api.post('/membership-plans', data);
export const updateMembershipPlanApi = (id, data) => api.put(`/membership-plans/${id}`, data);
export const deleteMembershipPlanApi = (id) => api.delete(`/membership-plans/${id}`);
