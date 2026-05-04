'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { ReportAuthor, AuthorFormData } from '@/lib/types/reports';
import { fetchAuthorById, createAuthor, updateAuthor } from '@/lib/api/authors';

interface UseAuthorReturn {
  author: ReportAuthor | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  handleCreate: (data: AuthorFormData) => Promise<ReportAuthor | null>;
  handleUpdate: (id: number | string, data: AuthorFormData) => Promise<ReportAuthor | null>;
}

export function useAuthor(id?: number | string): UseAuthorReturn {
  const [author, setAuthor] = useState<ReportAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchAuthorById(id);
      setAuthor(response.data || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load author';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  const handleCreate = useCallback(async (data: AuthorFormData): Promise<ReportAuthor | null> => {
    try {
      setIsSaving(true);
      const response = await createAuthor(data);
      toast.success('Author created successfully');
      return response.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create author';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleUpdate = useCallback(
    async (id: number | string, data: AuthorFormData): Promise<ReportAuthor | null> => {
      try {
        setIsSaving(true);
        const response = await updateAuthor(id, data);
        toast.success('Author updated successfully');
        const updatedAuthor = response.data || null;
        setAuthor(updatedAuthor);
        return updatedAuthor;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update author';
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    author,
    isLoading,
    isSaving,
    error,
    refetch: fetchData,
    handleCreate,
    handleUpdate,
  };
}
