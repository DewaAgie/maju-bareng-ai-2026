import api from './axios.js';

export const getCoachesApi = (params) => api.get('/coaches', { params });
export const getCoachApi = (id) => api.get(`/coaches/${id}`);
export const createCoachApi = (data) => api.post('/coaches', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCoachApi = (id, data) => api.put(`/coaches/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCoachApi = (id) => api.delete(`/coaches/${id}`);
