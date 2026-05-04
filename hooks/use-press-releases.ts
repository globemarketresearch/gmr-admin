'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { PressRelease, PressReleaseFilters } from '@/lib/types/press-releases';
import {
  fetchPressReleases,
  softDeletePressRelease,
  restorePressRelease,
} from '@/lib/api/press-releases';

interface UsePressReleasesReturn {
  pressReleases: PressRelease[];
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setFilters: (filters: PressReleaseFilters) => void;
  softDelete: (id: number) => Promise<void>;
  restore: (id: number) => Promise<void>;
}

export function usePressReleases(initialFilters?: PressReleaseFilters): UsePressReleasesReturn {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PressReleaseFilters>(initialFilters || {});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchPressReleases(filters);

      setPressReleases(data.pressReleases);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load press releases';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilters = useCallback((newFilters: PressReleaseFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSoftDelete = useCallback(
    async (id: number) => {
      try {
        await softDeletePressRelease(id);
        await fetchData();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to move press release to trash';
        toast.error(errorMessage);
        throw err;
      }
    },
    [fetchData]
  );

  const handleRestore = useCallback(
    async (id: number) => {
      try {
        await restorePressRelease(id);
        await fetchData();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to restore press release';
        toast.error(errorMessage);
        throw err;
      }
    },
    [fetchData]
  );

  return {
    pressReleases,
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
