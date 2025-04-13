// src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Địa chỉ backend

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào header nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// API calls
export const registerUser = (userData) => api.post('/auth/register/', userData);
export const loginUser = (credentials) => api.post('/auth/login/', credentials);
export const requestPasswordReset = (email) => api.post('/auth/request_password_reset/', email);
export const resetPassword = (token, password) => api.post(`/auth/reset-password/${token}/`, { password });

export const getCurrentWeather = (locationData) => api.post('/current/by_location/', locationData);
export const getWeatherAlerts = (locationData) => api.post('/alerts/by_location/', locationData);
export const getForecast = (locationId, type = 'daily') =>
  api.get(`/forecast/${locationId}/?type=${type}`);
export const getAllForecastTypes = (locationId) => api.get(`/forecast/${locationId}/all_types/`);
export const getNewsArticles = () => api.get('/news/');

export default api;