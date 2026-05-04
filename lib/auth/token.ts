import { config } from '@/lib/config';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  exp: number;
}

function setCookie(name: string, value: string, days: number = 7): void {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.tokenKey);
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(config.auth.tokenKey, token);
    setCookie(config.auth.tokenKey, token);
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(config.auth.tokenKey);
    removeCookie(config.auth.tokenKey);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.refreshTokenKey);
  },

  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(config.auth.refreshTokenKey, token);
  },

  removeRefreshToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(config.auth.refreshTokenKey);
  },

  clearAll: (): void => {
    tokenStorage.removeToken();
    tokenStorage.removeRefreshToken();
  },
};

export function decodeToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export function getTokenExpiryTime(token: string): number | null {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000;
}
