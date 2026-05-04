'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage, decodeToken } from '@/lib/auth/token';
import * as authApi from '@/lib/api/auth.api';
import { config } from '@/lib/config';
import type { User } from '@/lib/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from token on mount
  useEffect(() => {
    const token = tokenStorage.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const payload = decodeToken(token);
    if (payload) {
      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role,
      });
    } else {
      tokenStorage.clearAll();
    }
    setIsLoading(false);
  }, []);

  const loadUserFromToken = useCallback(() => {
    const token = tokenStorage.getToken();
    if (!token) {
      setUser(null);
      return;
    }

    const payload = decodeToken(token);
    if (payload) {
      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role,
      });
    } else {
      tokenStorage.clearAll();
      setUser(null);
    }
  }, []);

  const handleLogout = useCallback(
    async (shouldCallApi = false) => {
      if (shouldCallApi) {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch {
            // Ignore logout API errors - we still want to clear local state
          }
        }
      }
      tokenStorage.clearAll();
      setUser(null);
      router.push('/login');
    },
    [router]
  );

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const token = tokenStorage.getToken();
      if (!token) {
        handleLogout(false);
        return;
      }

      const payload = decodeToken(token);
      if (!payload || Date.now() >= payload.exp * 1000 - config.session.tokenRefreshInterval) {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          handleLogout(false);
          return;
        }

        authApi
          .refreshAccessToken(refreshToken)
          .then(response => {
            if (response.success && response.data) {
              // Token storage is already handled by the API
              loadUserFromToken();
            } else {
              handleLogout(false);
            }
          })
          .catch(() => {
            handleLogout(false);
          });
      }
    }, config.session.tokenRefreshInterval);

    return () => clearInterval(interval);
  }, [user, loadUserFromToken, handleLogout]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await authApi.login({ email, password });

        if (response.success && response.data) {
          // Tokens are already stored by the API
          // Convert ApiUserResponse to User type
          setUser({
            id: response.data.user.id.toString(),
            email: response.data.user.email,
            role: response.data.user.role as User['role'],
            name: response.data.user.name,
          });
          router.push('/dashboard');
        } else {
          throw new Error(response.error || 'Login failed');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    handleLogout(true);
  }, [handleLogout]);

  const refreshUser = useCallback(async () => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
