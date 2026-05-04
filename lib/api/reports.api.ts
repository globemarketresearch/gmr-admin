/**
 * Reports API Service
 * Aligned with swagger specification
 */

import { apiClient } from './client';
import type {
  ApiReport,
  ApiReportFilters,
  ApiReportsListResponse,
  ApiReportDetailResponse,
  ApiResponse,
  ApiMeta,
} from '@/lib/types/api-types';

// ============ Reports Endpoints ============

/**
 * GET /api/v1/reports
 * Get all reports with optional filters
 */
export async function fetchReports(filters?: ApiReportFilters): Promise<ApiReportsListResponse> {
  return apiClient.get<ApiReportsListResponse>('/v1/reports', {
    params: filters as Record<string, unknown>,
    requiresAuth: false, // Public endpoint according to swagger
  });
}

/**
 * GET /api/v1/reports/{slug}
 * Get report by slug with relations
 */
export async function fetchReportBySlug(slug: string): Promise<ApiReportDetailResponse> {
  return apiClient.get<ApiReportDetailResponse>(`/v1/reports/${slug}`, {
    requiresAuth: false, // Public endpoint
  });
}

/**
 * GET /api/v1/reports/{id}
 * Get report by ID with relations
 */
export async function fetchReportById(id: number): Promise<ApiReportDetailResponse> {
  return apiClient.get<ApiReportDetailResponse>(`/v1/reports/${id}`, {
    requiresAuth: false, // Public endpoint
  });
}

/**
 * POST /api/v1/reports
 * Create a new report (requires authentication)
 */
export async function createReport(data: Partial<ApiReport>): Promise<ApiReportDetailResponse> {
  return apiClient.post<ApiReportDetailResponse>('/v1/reports', data, {
    requiresAuth: true,
  });
}

/**
 * PUT /api/v1/reports/{id}
 * Update an existing report (requires authentication)
 */
export async function updateReport(
  id: number,
  data: Partial<ApiReport>
): Promise<ApiReportDetailResponse> {
  return apiClient.put<ApiReportDetailResponse>(`/v1/reports/${id}`, data, {
    requiresAuth: true,
  });
}

/**
 * DELETE /api/v1/reports/{id}
 * Delete a report (requires authentication)
 */
export async function deleteReport(id: number): Promise<ApiResponse<{ message: string }>> {
  return apiClient.delete<ApiResponse<{ message: string }>>(`/v1/reports/${id}`, {
    requiresAuth: true,
  });
}

/**
 * PATCH /api/v1/reports/{id}/soft-delete
 * Soft delete a report (moves to trash)
 */
export async function softDeleteReport(id: number): Promise<ApiResponse<{ message: string }>> {
  return apiClient.patch<ApiResponse<{ message: string }>>(
    `/v1/reports/${id}/soft-delete`,
    {},
    {
      requiresAuth: true,
    }
  );
}

/**
 * PATCH /api/v1/reports/{id}/restore
 * Restore a soft-deleted report
 */
export async function restoreReport(id: number): Promise<ApiResponse<{ message: string }>> {
  return apiClient.patch<ApiResponse<{ message: string }>>(
    `/v1/reports/${id}/restore`,
    {},
    {
      requiresAuth: true,
    }
  );
}

/**
 * GET /api/v1/reports?deleted=true
 * Fetch trashed reports
 */
export async function fetchTrashedReports(
  filters?: ApiReportFilters
): Promise<ApiReportsListResponse> {
  const params = { ...filters, deleted: 'true' };
  return apiClient.get<ApiReportsListResponse>('/v1/reports', {
    params: params as Record<string, unknown>,
    requiresAuth: true,
  });
}

// ============ Search Endpoint ============

/**
 * GET /api/v1/search
 * Search for reports by query text
 */
export async function searchReports(
  query: string,
  options?: { page?: number; limit?: number }
): Promise<ApiReportsListResponse> {
  return apiClient.get<ApiReportsListResponse>('/v1/search', {
    params: {
      q: query,
      page: options?.page,
      limit: options?.limit,
    },
    requiresAuth: false,
  });
}

// ============ Category-specific Reports ============

/**
 * GET /api/v1/categories/{slug}/reports
 * Get reports by category slug
 */
export async function fetchReportsByCategory(
  categorySlug: string,
  options?: { page?: number; limit?: number }
): Promise<ApiReportsListResponse> {
  return apiClient.get<ApiReportsListResponse>(`/v1/categories/${categorySlug}/reports`, {
    params: options,
    requiresAuth: false,
  });
}

// ============ Internal Linking ============

export interface LinkSuggestionItem {
  id: number;
  title: string;
  slug: string;
  meta_keywords: string;
}

/**
 * GET /api/v1/reports/link-suggestions
 * Get lightweight list of published reports for internal linking
 */
export async function fetchLinkSuggestions(): Promise<ApiResponse<LinkSuggestionItem[]>> {
  return apiClient.get<ApiResponse<LinkSuggestionItem[]>>('/v1/reports/link-suggestions', {
    requiresAuth: true,
  });
}

// ============ Helper Functions ============

/**
 * Extract data from API response or throw error
 */
export function extractData<T>(response: ApiResponse<T>): T {
  if (!response.success || !response.data) {
    throw new Error(response.error || 'API request failed');
  }
  return response.data;
}

/**
 * Extract list data with metadata
 */
export function extractListData<T>(response: ApiResponse<T[]> & { meta?: ApiMeta }): {
  data: T[];
  meta: ApiMeta;
} {
  if (!response.success || !response.data) {
    throw new Error(response.error || 'API request failed');
  }
  return {
    data: response.data,
    meta: response.meta || {},
  };
}
