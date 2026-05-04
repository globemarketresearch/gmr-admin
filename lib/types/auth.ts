export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

// API Response wrapper matching backend response.Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Logout
export interface LogoutRequest {
  refreshToken?: string;
}

export interface LogoutResponse {
  message: string;
}

// Refresh Token
export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}
