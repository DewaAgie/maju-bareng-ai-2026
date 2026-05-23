import api from './axios.js';

export const getSchedulesApi = (params) => api.get('/schedules', { params });
export const getWeeklyScheduleApi = (params) => api.get('/schedules/weekly', { params });
export const getScheduleApi = (id) => api.get(`/schedules/${id}`);
export const createScheduleApi = (data) => api.post('/schedules', data);
export const updateScheduleApi = (id, data) => api.put(`/schedules/${id}`, data);
export const deleteScheduleApi = (id) => api.delete(`/schedules/${id}`);
