import { apiClient } from './client';
import type { DashboardStats, ActivityResponse } from '@/lib/types/dashboard';
import type { ApiResponse } from '@/lib/types/api-types';

/**
 * Fetches dashboard statistics including reports, blogs, users, traffic, and leads metrics
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<ApiResponse<DashboardStats>>('/v1/dashboard/stats');
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch dashboard stats');
  }
  return response.data;
}

/**
 * Fetches recent activity feed
 * @param limit - Number of activities to fetch (default: 10)
 */
export async function fetchRecentActivity(limit: number = 10): Promise<ActivityResponse> {
  const response = await apiClient.get<ApiResponse<ActivityResponse>>(
    `/v1/dashboard/activity?limit=${limit}`
  );
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch recent activity');
  }
  return response.data;
}
