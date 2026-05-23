import api from './axios.js';

export const sendChatMessageApi = (data) => api.post('/chatbot/message', data);
