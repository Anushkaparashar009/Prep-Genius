import api from './axios';

/**
 * Start a new mock interview session
 */
export const startInterviewApi = async ({ roleTitle, difficulty }) => {
  const response = await api.post('/interview/start', {
    roleTitle,
    difficulty,
  });
  return response.data;
};

/**
 * Send candidate answer and receive interviewer follow-up
 */
export const sendInterviewReplyApi = async ({ sessionId, answer }) => {
  const response = await api.post('/interview/reply', {
    sessionId,
    answer,
  });
  return response.data;
};

/**
 * Conclude the interview and retrieve evaluation scorecard
 */
export const finishInterviewApi = async ({ sessionId }) => {
  const response = await api.post('/interview/finish', {
    sessionId,
  });
  return response.data;
};

/**
 * Retrieve user's mock interview history
 */
export const getInterviewHistoryApi = async () => {
  const response = await api.get('/interview/history');
  return response.data;
};

/**
 * Retrieve a specific interview by session ID
 */
export const getInterviewByIdApi = async (sessionId) => {
  const response = await api.get(`/interview/${sessionId}`);
  return response.data;
};