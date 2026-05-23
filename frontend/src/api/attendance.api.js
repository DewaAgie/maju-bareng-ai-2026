import api from './axios.js';

export const checkInApi = (data) => api.post('/attendance/check-in', data);
export const getAttendanceLogsApi = (params) => api.get('/attendance', { params });
export const getTodayAttendanceApi = (params) => api.get('/attendance/today', { params });
export const getMemberAttendanceApi = (memberId, params) => api.get(`/attendance/member/${memberId}`, { params });
