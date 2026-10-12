import api from './axiosClient.js';

// 1. Start session (supports both role/difficulty and roleTitle/interviewType)
export const startInterviewApi = async (data) => {
  const payload = {
    roleTitle: data?.roleTitle || data?.role || 'Full Stack Engineer (SDE-1)',
    difficulty: data?.difficulty || data?.interviewType || 'Entry',
    role: data?.role || data?.roleTitle || 'Full Stack Engineer (SDE-1)',
    interviewType: data?.interviewType || data?.difficulty || 'Entry',
  };
  const response = await api.post('/interview/start', payload);
  return response.data;
};

// 2. Submit reply / answer
export const sendInterviewReplyApi = async (data) => {
  const payload = {
    sessionId: data?.sessionId,
    answer: data?.answer || data?.userReply || '',
  };
  const response = await api.post('/interview/reply', payload);
  return response.data;
};

// 3. Conclude & score interview
export const finishInterviewApi = async (data) => {
  const payload = typeof data === 'string' ? { sessionId: data } : data;
  const response = await api.post('/interview/finish', payload);
  return response.data;
};

// 4. History fetching
export const getInterviewHistoryApi = async () => {
  const response = await api.get('/interview/history');
  return response.data;
};

// 5. Details fetching
export const getInterviewDetailsApi = async (sessionId) => {
  const response = await api.get(`/interview/${sessionId}`);
  return response.data;
};

// Aliases to guarantee no component import ever fails:
export const submitInterviewAnswerApi = sendInterviewReplyApi;
export const getUserInterviewsApi = getInterviewHistoryApi;
export const startInterview = startInterviewApi;
export const sendInterviewReply = sendInterviewReplyApi;
export const finishInterview = finishInterviewApi;
export const getInterviewHistory = getInterviewHistoryApi;

export default {
  startInterviewApi,
  sendInterviewReplyApi,
  finishInterviewApi,
  getInterviewHistoryApi,
  getInterviewDetailsApi,
  submitInterviewAnswerApi,
  getUserInterviewsApi,
  startInterview,
  sendInterviewReply,
  finishInterview,
  getInterviewHistory,
};