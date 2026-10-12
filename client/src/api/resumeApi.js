import api from './axios';

export const analyzeResumeApi = async (file, targetRole) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('targetRole', targetRole);

  const response = await api.post('/resume/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getResumeHistoryApi = async () => {
  const response = await api.get('/resume/history');
  return response.data;
};