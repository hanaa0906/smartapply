import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('smartapply_token');
    if (!token) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      localStorage.removeItem('smartapply_token');
      localStorage.removeItem('smartapply_user');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('smartapply_token', res.data.token);
      localStorage.setItem('smartapply_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      await fetchCurrentUser();
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      localStorage.setItem('smartapply_token', res.data.token);
      localStorage.setItem('smartapply_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      await fetchCurrentUser();
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('smartapply_token');
    localStorage.removeItem('smartapply_user');
    setUser(null);
    setProfile(null);
  };

  const loginAsDemo = async (role = 'student') => {
    if (role === 'admin') {
      return await login('admin@smartapply.edu', 'Admin@123');
    } else {
      return await login('student@smartapply.edu', 'Student@123');
    }
  };

  const refreshProfile = async () => {
    if (user && user.role === 'student') {
      try {
        const res = await api.get('/profile');
        if (res.data.success) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.error('Failed to refresh profile:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        loginAsDemo,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
