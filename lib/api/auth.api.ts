/**
 * Authentication API Service
 * Aligned with swagger specification
 */

import { apiClient } from './client';
import { tokenStorage } from '@/lib/auth/token';
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ApiUserResponse,
  ApiResponse,
} from '@/lib/types/api-types';

// ============ Authentication Endpoints ============

/**
 * POST /api/v1/auth/login
 * Authenticate user with email and password
 */
export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/v1/auth/login', credentials, {
    requiresAuth: false,
  });

  // Store tokens if login successful
  if (response.success && response.data) {
    tokenStorage.setToken(response.data.access_token);
    tokenStorage.setRefreshToken(response.data.refresh_token);
  }

  return response;
}

/**
 * POST /api/v1/auth/logout
 * Invalidate refresh token
 */
export async function logout(refreshToken?: string): Promise<ApiResponse<{ message: string }>> {
  const token = refreshToken || tokenStorage.getRefreshToken();
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    '/v1/auth/logout',
    { refresh_token: token },
    {
      requiresAuth: true,
    }
  );

  // Clear local tokens
  tokenStorage.clearAll();

  return response;
}

/**
 * POST /api/v1/auth/refresh
 * Generate new access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken?: string
): Promise<ApiResponse<RefreshResponse>> {
  const token = refreshToken || tokenStorage.getRefreshToken();
  if (!token) {
    throw new Error('No refresh token available');
  }

  const response = await apiClient.post<ApiResponse<RefreshResponse>>(
    '/v1/auth/refresh',
    { refresh_token: token },
    {
      requiresAuth: false,
    }
  );

  // Update tokens if refresh successful
  if (response.success && response.data) {
    tokenStorage.setToken(response.data.access_token);
    if (response.data.refresh_token) {
      tokenStorage.setRefreshToken(response.data.refresh_token);
    }
  }

  return response;
}

// ============ User Management Endpoints (Admin) ============

/**
 * GET /api/v1/users
 * Get all users with pagination (admin only)
 */
export async function fetchUsers(options?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<ApiUserResponse[]>> {
  return apiClient.get<ApiResponse<ApiUserResponse[]>>('/v1/users', {
    params: options,
    requiresAuth: true,
  });
}

/**
 * GET /api/v1/users/me
 * Get the currently authenticated user's information
 */
export async function fetchCurrentUser(): Promise<ApiResponse<ApiUserResponse>> {
  return apiClient.get<ApiResponse<ApiUserResponse>>('/v1/users/me', {
    requiresAuth: true,
  });
}

/**
 * POST /api/v1/users
 * Create a new user (admin only)
 */
export async function createUser(data: CreateUserRequest): Promise<ApiResponse<ApiUserResponse>> {
  return apiClient.post<ApiResponse<ApiUserResponse>>('/v1/users', data, {
    requiresAuth: true,
  });
}

/**
 * PUT /api/v1/users/{id}
 * Update a user's information (admin only)
 */
export async function updateUser(
  id: number,
  data: UpdateUserRequest
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.put<ApiResponse<{ message: string }>>(`/v1/users/${id}`, data, {
    requiresAuth: true,
  });
}

/**
 * DELETE /api/v1/users/{id}
 * Soft-delete a user (admin only)
 */
export async function deleteUser(id: number): Promise<ApiResponse<{ message: string }>> {
  return apiClient.delete<ApiResponse<{ message: string }>>(`/v1/users/${id}`, {
    requiresAuth: true,
  });
}
