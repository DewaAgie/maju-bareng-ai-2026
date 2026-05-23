import api from './axios.js';

export const getDashboardStatsApi = (params) => api.get('/dashboard', { params });
