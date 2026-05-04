import { apiClient } from './client';
import type {
  AuditLogsListResponse,
  AuditLogDetailResponse,
  AuditLogFilters,
} from '@/lib/types/api-types';

/**
 * Fetches audit logs with filtering and pagination
 */
export async function fetchAuditLogs(filters?: AuditLogFilters): Promise<AuditLogsListResponse> {
  return apiClient.get<AuditLogsListResponse>('/v1/audit-logs', {
    params: filters as Record<string, unknown>,
  });
}

/**
 * Fetches a single audit log by ID
 */
export async function fetchAuditLogById(id: string | number): Promise<AuditLogDetailResponse> {
  return apiClient.get<AuditLogDetailResponse>(`/v1/audit-logs/${id}`);
}
