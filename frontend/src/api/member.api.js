import api from './axios.js';

export const getMembersApi = (params) => api.get('/members', { params });
export const getMemberApi = (id) => api.get(`/members/${id}`);
export const createMemberApi = (data) => api.post('/members', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateMemberApi = (id, data) => api.put(`/members/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteMemberApi = (id) => api.delete(`/members/${id}`);
export const assignMembershipApi = (id, data) => api.post(`/members/${id}/membership`, data);
