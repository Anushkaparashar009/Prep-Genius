import api from './axios';

export const loginRequest = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const registerRequest = async (formData) => {
  const { data } = await api.post('/auth/register', formData);
  return data;
};

export const verifyOtpRequest = async (email, otp) => {
  const { data } = await api.post('/auth/verify-otp', { email, otp });
  return data;
};

export const resendOtpRequest = async (email) => {
  const { data } = await api.post('/auth/resend-otp', { email });
  return data;
};

export const forgotPasswordRequest = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPasswordRequest = async (token, password) => {
  const { data } = await api.post(`/auth/reset-password/${token}`, { password });
  return data;
};

export const fetchMeRequest = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const deleteAccountRequest = async () => {
  const { data } = await api.delete('/auth/account');
  return data;
};