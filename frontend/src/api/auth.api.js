import api from './axios.js';

export const loginApi = (data) => api.post('/auth/login', data);
export const refreshApi = () => api.post('/auth/refresh');
export const logoutApi = () => api.post('/auth/logout');
export const getMeApi = () => api.get('/auth/me');
export const registerGymAdminApi = (data) => api.post('/auth/register', data);
