import { createContext, useContext, useState, useEffect } from 'react';
import {
  loginRequest,
  registerRequest,
  verifyOtpRequest,
  fetchMeRequest,
  deleteAccountRequest,
} from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await fetchMeRequest();
        setUser(userData);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
      });
    }
    return data;
  };

  const register = async (formData) => {
    const data = await registerRequest(formData);
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
      });
    }
    return data;
  };

  const verifyOtp = async (email, otp) => {
    const data = await verifyOtpRequest(email, otp);
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
      });
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const deleteAccount = async () => {
    const data = await deleteAccountRequest();
    localStorage.removeItem('token');
    setUser(null);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, verifyOtp, logout, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};