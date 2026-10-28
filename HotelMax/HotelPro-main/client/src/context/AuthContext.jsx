import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hotelpro_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('hotelpro_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If token exists, verify and refresh user profile
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data && res.data.data) {
            setUser(res.data.data.user);
            localStorage.setItem('hotelpro_user', JSON.stringify(res.data.data.user));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: userToken } = res.data.data;
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('hotelpro_token', userToken);
    localStorage.setItem('hotelpro_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { user: newUser, token: newToken } = res.data.data;
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('hotelpro_token', newToken);
    localStorage.setItem('hotelpro_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hotelpro_token');
    localStorage.removeItem('hotelpro_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hotelpro_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isStaff: user?.role === 'staff' || user?.role === 'admin',
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
