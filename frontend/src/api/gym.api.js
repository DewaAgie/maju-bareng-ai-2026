import api from './axios.js';

export const getGymsApi = (params) => api.get('/gyms', { params });
export const getGymApi = (id) => api.get(`/gyms/${id}`);
export const createGymApi = (data) => {
  const formData = data instanceof FormData ? data : (() => { const fd = new FormData(); Object.entries(data).forEach(([k, v]) => fd.append(k, v)); return fd; })();
  return api.post('/gyms', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const updateGymApi = (id, data) => {
  const formData = data instanceof FormData ? data : (() => { const fd = new FormData(); Object.entries(data).forEach(([k, v]) => { if (v !== undefined) fd.append(k, v); }); return fd; })();
  return api.put(`/gyms/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteGymApi = (id) => api.delete(`/gyms/${id}`);
