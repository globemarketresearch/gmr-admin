import { apiClient } from './client';
import type {
  ApiResponse,
  ApiUserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ApiMeta
} from '@/lib/types/api-types';

/**
 * Response types for user endpoints
 */
export interface UsersListResponse extends ApiResponse<ApiUserResponse[]> {
  data: ApiUserResponse[];
  meta?: ApiMeta;
}

export interface UserDetailResponse extends ApiResponse<ApiUserResponse> {
  data: ApiUserResponse;
}

/**
 * Fetches all users with pagination
 */
export async function fetchUsers(page: number = 1, limit: number = 20): Promise<UsersListResponse> {
  return apiClient.get<UsersListResponse>(`/v1/users?page=${page}&limit=${limit}`);
}

/**
 * Fetches the currently authenticated user
 */
export async function fetchCurrentUser(): Promise<UserDetailResponse> {
  return apiClient.get<UserDetailResponse>('/v1/users/me');
}

/**
 * Fetches a single user by ID (admin only)
 */
export async function fetchUserById(id: number | string): Promise<UserDetailResponse> {
  return apiClient.get<UserDetailResponse>(`/v1/users/${id}`);
}

/**
 * Creates a new user (admin only)
 */
export async function createUser(data: CreateUserRequest): Promise<UserDetailResponse> {
  return apiClient.post<UserDetailResponse>('/v1/users', data);
}

/**
 * Updates an existing user (admin only)
 */
export async function updateUser(
  id: number | string,
  data: UpdateUserRequest
): Promise<UserDetailResponse> {
  return apiClient.put<UserDetailResponse>(`/v1/users/${id}`, data);
}

/**
 * Deletes a user (soft-delete, admin only)
 */
export async function deleteUser(id: number | string): Promise<ApiResponse> {
  return apiClient.delete<ApiResponse>(`/v1/users/${id}`);
}
