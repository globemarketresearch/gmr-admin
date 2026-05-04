import { apiClient } from './client';
import type {
  ApiResponse,
  FormSubmissionsListResponse,
  FormSubmissionDetailResponse,
  FormSubmissionFilters,
  FormSubmissionStatsResponse,
  BulkDeleteResponse,
  FormCategory,
} from '@/lib/types/api-types';

/**
 * Fetches form submissions with filtering and pagination
 */
export async function fetchFormSubmissions(
  filters?: FormSubmissionFilters
): Promise<FormSubmissionsListResponse> {
  return apiClient.get<FormSubmissionsListResponse>('/v1/forms/submissions', {
    params: filters as Record<string, unknown>,
  });
}

/**
 * Fetches a single form submission by ID
 */
export async function fetchFormSubmissionById(id: string): Promise<FormSubmissionDetailResponse> {
  return apiClient.get<FormSubmissionDetailResponse>(`/v1/forms/submissions/${id}`);
}

/**
 * Fetches form submissions by category
 */
export async function fetchFormSubmissionsByCategory(
  category: FormCategory,
  filters?: Omit<FormSubmissionFilters, 'category'>
): Promise<FormSubmissionsListResponse> {
  return apiClient.get<FormSubmissionsListResponse>(`/v1/forms/submissions/category/${category}`, {
    params: filters as Record<string, unknown>,
  });
}

/**
 * Deletes a single form submission
 */
export async function deleteFormSubmission(id: string): Promise<ApiResponse> {
  return apiClient.delete<ApiResponse>(`/v1/forms/submissions/${id}`);
}

/**
 * Bulk deletes multiple form submissions
 */
export async function bulkDeleteFormSubmissions(ids: string[]): Promise<BulkDeleteResponse> {
  return apiClient.delete<BulkDeleteResponse>('/v1/forms/submissions', {
    body: JSON.stringify({ ids }),
  });
}

/**
 * Fetches form submission statistics
 */
export async function fetchFormSubmissionStats(): Promise<FormSubmissionStatsResponse> {
  return apiClient.get<FormSubmissionStatsResponse>('/v1/forms/stats');
}

/**
 * Updates the status of a form submission
 */
export async function updateFormSubmissionStatus(
  id: string,
  status: 'pending' | 'processed' | 'archived',
  notes?: string
): Promise<FormSubmissionDetailResponse> {
  return apiClient.patch<FormSubmissionDetailResponse>(`/v1/forms/submissions/${id}/status`, {
    status,
    notes,
  });
}

/**
 * Exports form submissions to specified format
 */
export async function exportFormSubmissions(
  format: 'csv' | 'xlsx' | 'json',
  filters?: FormSubmissionFilters
): Promise<Blob> {
  const queryParams = new URLSearchParams({
    format,
    ...(filters?.category && { category: filters.category }),
    ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
    ...(filters?.dateTo && { dateTo: filters.dateTo }),
  });

  const token = await apiClient['getAuthHeaders']?.();
  const response = await fetch(`${apiClient['baseUrl']}/v1/forms/export?${queryParams}`, {
    headers: token || {},
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
}
