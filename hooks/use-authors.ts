'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { ReportAuthor } from '@/lib/types/reports';
import { fetchAuthors, deleteAuthor } from '@/lib/api/authors';

interface UseAuthorsReturn {
  authors: ReportAuthor[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  handleDelete: (id: number | string) => Promise<boolean>;
}

export function useAuthors(): UseAuthorsReturn {
  const [authors, setAuthors] = useState<ReportAuthor[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchAuthors();

      setAuthors(response.data || []);
      setTotal(response.meta?.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load authors';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(
    async (id: number | string): Promise<boolean> => {
      try {
        await deleteAuthor(id);
        toast.success('Author deleted successfully');
        await fetchData();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete author';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchData]
  );

  return {
    authors,
    total,
    isLoading,
    error,
    refetch: fetchData,
    handleDelete,
  };
}
