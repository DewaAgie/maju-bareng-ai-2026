import api from './axios.js';

export const getFacilitiesApi = (params) => api.get('/facilities', { params });
export const getFacilityApi = (id) => api.get(`/facilities/${id}`);
export const createFacilityApi = (data) => api.post('/facilities', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateFacilityApi = (id, data) => api.put(`/facilities/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteFacilityApi = (id) => api.delete(`/facilities/${id}`);
