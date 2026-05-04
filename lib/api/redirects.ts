import { apiClient } from './client';
import type {
  Redirect,
  RedirectsResponse,
  RedirectResponse,
  CreateRedirectRequest,
  UpdateRedirectRequest,
  RedirectFilters,
} from '@/lib/types/redirects';

export async function getRedirects(filters?: RedirectFilters): Promise<RedirectsResponse> {
  const params: Record<string, unknown> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.enabled !== undefined && filters.enabled !== '') params.enabled = filters.enabled;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;

  return apiClient.get<RedirectsResponse>('/v1/redirects/', { params });
}

export async function getRedirect(id: number): Promise<RedirectResponse> {
  return apiClient.get<RedirectResponse>(`/v1/redirects/${id}`);
}

export async function createRedirect(data: CreateRedirectRequest): Promise<RedirectResponse> {
  return apiClient.post<RedirectResponse>('/v1/redirects/', data);
}

export async function updateRedirect(
  id: number,
  data: UpdateRedirectRequest
): Promise<RedirectResponse> {
  return apiClient.put<RedirectResponse>(`/v1/redirects/${id}`, data);
}

export async function deleteRedirect(id: number): Promise<void> {
  return apiClient.delete<void>(`/v1/redirects/${id}`);
}

export async function toggleRedirect(id: number): Promise<RedirectResponse> {
  return apiClient.patch<RedirectResponse>(`/v1/redirects/${id}/toggle`);
}

export async function bulkDeleteRedirects(ids: number[]): Promise<void> {
  return apiClient.request<void>('/v1/redirects/bulk', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
}

export type { Redirect };
