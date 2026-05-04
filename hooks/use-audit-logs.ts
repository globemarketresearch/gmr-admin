'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { ApiAuditLog, AuditLogFilters } from '@/lib/types/api-types';
import { fetchAuditLogs, fetchAuditLogById } from '@/lib/api/audit-logs';

interface UseAuditLogsReturn {
  logs: ApiAuditLog[];
  total: number;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  filters: AuditLogFilters;
  setFilters: (filters: AuditLogFilters) => void;
  refetch: () => Promise<void>;
  selectedLog: ApiAuditLog | null;
  selectLog: (log: ApiAuditLog | null) => void;
  fetchLogDetail: (id: number) => Promise<void>;
}

export function useAuditLogs(initialFilters?: AuditLogFilters): UseAuditLogsReturn {
  const [logs, setLogs] = useState<ApiAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditLogFilters>(initialFilters || { page: 1, limit: 20 });
  const [selectedLog, setSelectedLog] = useState<ApiAuditLog | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchAuditLogs(filters);

      setLogs(response.data || []);
      setTotal(response.meta?.total || 0);
      setCurrentPage(response.meta?.page || 1);
      setTotalPages(response.meta?.total_pages || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load audit logs';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchLogDetail = useCallback(async (id: number) => {
    try {
      const response = await fetchAuditLogById(id);
      setSelectedLog(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load audit log detail';
      toast.error(errorMessage);
    }
  }, []);

  const selectLog = useCallback((log: ApiAuditLog | null) => {
    setSelectedLog(log);
  }, []);

  return {
    logs,
    total,
    isLoading,
    error,
    currentPage,
    totalPages,
    filters,
    setFilters,
    refetch: fetchData,
    selectedLog,
    selectLog,
    fetchLogDetail,
  };
}
