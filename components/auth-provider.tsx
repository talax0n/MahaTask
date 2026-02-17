"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient, getToken, setToken, removeToken } from "@/lib/api-client";
import { API_CONFIG } from "@/lib/api-config";
import type { LoginRequest, RegisterRequest, LoginResponse, User, UpdateUserRequest } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<User | null>;
  register: (data: RegisterRequest) => Promise<User | null>;
  logout: () => void;
  updateUser: (updates: UpdateUserRequest) => Promise<User | null>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    // If we already have a user and token, we might not need to set loading=true
    // but to be safe and ensure data is fresh, we fetch. 
    // We can optimize to not show loading spinner if just refreshing in background,
    // but for initial load (loading=true), we want to keep it true.
    
    setError(null);
    try {
      const data = await apiClient.get<User>(API_CONFIG.ENDPOINTS.USERS.ME);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      setToken(response.access_token);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        data
      );
      setToken(response.access_token);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setError(null);
  }, []);

  const updateUser = useCallback(async (updates: UpdateUserRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await apiClient.patch<User>(
        API_CONFIG.ENDPOINTS.USERS.UPDATE_ME,
        updates
      );
      setUser(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
