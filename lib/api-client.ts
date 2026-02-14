import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { getApiUrl } from './api-config';

// Get JWT token from localStorage
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Set JWT token in localStorage
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

// Remove JWT token from localStorage
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

// Create axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const errorMessage = (error.response.data as any)?.message || 
                        (error.response.data as any)?.error || 
                        'Request failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('No response from server');
    } else {
      // Error in setting up the request
      throw new Error(error.message || 'An error occurred');
    }
  }
);

// Generic API request function using axios
export async function apiRequest<T>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  const response = await axiosInstance.request<T>({
    url: endpoint,
    ...options,
  });
  return response.data;
}

// API client with convenience methods
export const apiClient = {
  get: <T>(endpoint: string, config?: AxiosRequestConfig) => 
    apiRequest<T>(endpoint, { ...config, method: 'GET' }),
  
  post: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>(endpoint, { ...config, method: 'POST', data }),
  
  patch: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>(endpoint, { ...config, method: 'PATCH', data }),
  
  delete: <T>(endpoint: string, config?: AxiosRequestConfig) => 
    apiRequest<T>(endpoint, { ...config, method: 'DELETE' }),
  
  put: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>(endpoint, { ...config, method: 'PUT', data }),
};

export default axiosInstance;
