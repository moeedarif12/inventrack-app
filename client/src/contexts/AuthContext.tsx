import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Business } from '@/types';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  business: Business | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => void;
  updateBusiness: (business: Business) => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    business: null,
    token: localStorage.getItem('token'),
    isLoading: true,
    isAuthenticated: false,
  });

  const setAuthData = (user: User, business: Business, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setState({ user, business, token, isLoading: false, isAuthenticated: true });
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ user: null, business: null, token: null, isLoading: false, isAuthenticated: false });
  };

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState(s => ({ ...s, isLoading: false }));
      return;
    }

    authAPI.getMe()
      .then(({ data }: any) => {
        if (data.success) {
          setAuthData(data.data.user, data.data.business, token);
        } else {
          clearAuthData();
        }
      })
      .catch(() => clearAuthData());
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password });
    if (data.success) {
      setAuthData(data.data.user, data.data.business, data.data.token);
      toast.success(`Welcome back, ${data.data.user.name.split(' ')[0]}!`);
      return data.data.user;
    } else {
      throw new Error(data.message);
    }
  }, []);

  const register = useCallback(async (formData: any) => {
    const { data } = await authAPI.register(formData);
    if (data.success) {
      setAuthData(data.data.user, data.data.business, data.data.token);
      toast.success('Business account created successfully!');
      return data.data.user;
    } else {
      throw new Error(data.message);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    toast.success('Logged out successfully');
    window.location.href = '/login';
  }, []);

  const updateBusiness = useCallback((business: Business) => {
    setState(s => ({ ...s, business }));
  }, []);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setState(s => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateBusiness, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
