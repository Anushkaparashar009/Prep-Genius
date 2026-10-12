import api from './axiosClient.js';

export const sendTutorMessageApi = async ({ problemId, message, userCode, language }) => {
  const response = await api.post('/tutor/chat', {
    problemId,
    message,
    userCode,
    language,
  });
  return response.data;
};

export const sendTutorMessage = async (message, sessionId, problemTopic, code, language) => {
  const response = await api.post('/tutor/chat', {
    message,
    sessionId,
    problemTopic,
    userCode: code,
    language,
  });
  return response.data;
};

export const getTutorHistoryApi = async (problemId) => {
  const response = await api.get(`/tutor/history/${problemId}`);
  return response.data;
};

export const fetchUserSessions = async () => {
  const response = await api.get('/tutor/sessions');
  return response.data;
};

export const fetchSessionById = async (sessionId) => {
  const response = await api.get(`/tutor/sessions/${sessionId}`);
  return response.data;
};

export const deleteUserSession = async (sessionId) => {
  const response = await api.delete(`/tutor/sessions/${sessionId}`);
  return response.data;
};

export const resetTutorSessionApi = async (problemId) => {
  const response = await api.delete(`/tutor/session/${problemId}`);
  return response.data;
};