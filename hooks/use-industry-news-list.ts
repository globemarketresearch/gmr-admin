'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { IndustryNews, IndustryNewsFilters } from '@/lib/types/industry-news';
import {
  fetchIndustryNewsList,
  softDeleteIndustryNews,
  restoreIndustryNews,
} from '@/lib/api/industry-news';

interface UseIndustryNewsListReturn {
  industryNewsItems: IndustryNews[];
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setFilters: (filters: IndustryNewsFilters) => void;
  softDelete: (id: number) => Promise<void>;
  restore: (id: number) => Promise<void>;
}

export function useIndustryNewsList(initialFilters?: IndustryNewsFilters): UseIndustryNewsListReturn {
  const [industryNewsItems, setIndustryNewsItems] = useState<IndustryNews[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<IndustryNewsFilters>(initialFilters || {});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchIndustryNewsList(filters);

      setIndustryNewsItems(data.industryNews);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load industry news';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilters = useCallback((newFilters: IndustryNewsFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSoftDelete = useCallback(
    async (id: number) => {
      try {
        await softDeleteIndustryNews(id);
        await fetchData();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to move industry news to trash';
        toast.error(errorMessage);
        throw err;
      }
    },
    [fetchData]
  );

  const handleRestore = useCallback(
    async (id: number) => {
      try {
        await restoreIndustryNews(id);
        await fetchData();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to restore industry news';
        toast.error(errorMessage);
        throw err;
      }
    },
    [fetchData]
  );

  return {
    industryNewsItems,
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
