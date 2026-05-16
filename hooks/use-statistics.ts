'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Statistic, StatisticFilters } from '@/lib/types/statistics';
import { fetchStatistics, softDeleteStatistic, restoreStatistic } from '@/lib/api/statistics';

interface UseStatisticsReturn {
  statistics: Statistic[];
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setFilters: (filters: StatisticFilters) => void;
  softDelete: (id: string) => Promise<void>;
  restore: (id: string) => Promise<void>;
}

export function useStatistics(initialFilters?: StatisticFilters): UseStatisticsReturn {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<StatisticFilters>(initialFilters || {});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchStatistics(filters);

      setStatistics(data.statistics);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistic posts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilters = useCallback((newFilters: StatisticFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSoftDelete = useCallback(
    async (id: string) => {
      try {
        await softDeleteStatistic(id);
        await fetchData();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to move statistic to trash';
        toast.error(errorMessage);
        throw err;
      }
    },
    [fetchData]
  );

  const handleRestore = useCallback(
    async (id: string) => {
      try {
        await restoreStatistic(id);
        await fetchData();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to restore statistic';
        toast.error(errorMessage);
        throw err;
      }
    },
    [fetchData]
  );

  return {
    statistics,
    total,
    totalPages,
    currentPage,
    isLoading,
    error,
    refetch: fetchData,
    setFilters,
    softDelete: handleSoftDelete,
    restore: handleRestore,
  };
}
