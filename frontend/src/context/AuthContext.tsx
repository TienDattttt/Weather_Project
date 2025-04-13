// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api';

interface User {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { login: string; password: string }) => Promise<void>;
  register: (userData: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra token trong localStorage khi ứng dụng khởi động
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials: { login: string; password: string }) => {
    try {
      const response = await loginUser(credentials);
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (userData: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    try {
      await registerUser(userData);
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};