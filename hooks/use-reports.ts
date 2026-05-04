'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Report, ReportFilters } from '@/lib/types/reports';
import { fetchReports, softDeleteReport, restoreReport } from '@/lib/api/reports';

interface UseReportsReturn {
  reports: Report[];
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setFilters: (filters: ReportFilters) => void;
  softDelete: (id: string) => Promise<void>;
  restore: (id: string) => Promise<void>;
}

export function useReports(initialFilters?: ReportFilters): UseReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ReportFilters>(initialFilters || {});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchReports(filters);

      setReports(data.reports);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilters = useCallback((newFilters: ReportFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const softDelete = useCallback(
    async (id: string) => {
      try {
        await softDeleteReport(id);
        await fetchData();
      } catch (error) {
        throw error;
      }
    },
    [fetchData]
  );

  const restore = useCallback(
    async (id: string) => {
      try {
        await restoreReport(id);
        await fetchData();
      } catch (error) {
        throw error;
      }
    },
    [fetchData]
  );

  return {
    reports,
    total,
    totalPages,
    currentPage,
    isLoading,
    error,
    refetch: fetchData,
    setFilters,
    softDelete,
    restore,
  };
}
