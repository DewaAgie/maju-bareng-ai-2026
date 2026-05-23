import api from './axios.js';

export const getClassesApi = (params) => api.get('/classes', { params });
export const getClassApi = (id) => api.get(`/classes/${id}`);
export const createClassApi = (data) => api.post('/classes', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateClassApi = (id, data) => api.put(`/classes/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteClassApi = (id) => api.delete(`/classes/${id}`);
