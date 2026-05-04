'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type {
  ApiFormSubmission,
  FormSubmissionFilters,
  FormSubmissionStats,
} from '@/lib/types/api-types';
import {
  fetchFormSubmissions,
  deleteFormSubmission,
  bulkDeleteFormSubmissions,
  fetchFormSubmissionStats,
  updateFormSubmissionStatus,
} from '@/lib/api/leads';

interface UseLeadsReturn {
  submissions: ApiFormSubmission[];
  stats: FormSubmissionStats | null;
  total: number;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  refetch: () => Promise<void>;
  handleDelete: (id: string) => Promise<boolean>;
  handleBulkDelete: (ids: string[]) => Promise<boolean>;
  handleStatusUpdate: (
    id: string,
    status: 'pending' | 'processed' | 'archived',
    notes?: string
  ) => Promise<boolean>;
  setFilters: (filters: FormSubmissionFilters) => void;
  filters: FormSubmissionFilters;
}

export function useLeads(initialFilters?: FormSubmissionFilters): UseLeadsReturn {
  const [submissions, setSubmissions] = useState<ApiFormSubmission[]>([]);
  const [stats, setStats] = useState<FormSubmissionStats | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FormSubmissionFilters>(
    initialFilters || { page: 1, limit: 20, sortOrder: 'desc' }
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchFormSubmissions(filters);

      setSubmissions(response.data || []);
      setTotal(response.pagination?.total || 0);
      setCurrentPage(response.pagination?.page || 1);
      setTotalPages(response.pagination?.totalPages || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load form submissions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetchFormSubmissionStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  const handleDelete = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteFormSubmission(id);
        toast.success('Submission deleted successfully');
        await fetchData();
        await fetchStats();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete submission';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchData, fetchStats]
  );

  const handleBulkDelete = useCallback(
    async (ids: string[]): Promise<boolean> => {
      try {
        const response = await bulkDeleteFormSubmissions(ids);
        toast.success(`${response.deletedCount} submission(s) deleted successfully`);
        await fetchData();
        await fetchStats();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete submissions';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchData, fetchStats]
  );

  const handleStatusUpdate = useCallback(
    async (
      id: string,
      status: 'pending' | 'processed' | 'archived',
      notes?: string
    ): Promise<boolean> => {
      try {
        await updateFormSubmissionStatus(id, status, notes);
        toast.success('Status updated successfully');
        await fetchData();
        await fetchStats();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchData, fetchStats]
  );

  return {
    submissions,
    stats,
    total,
    isLoading,
    error,
    currentPage,
    totalPages,
    refetch: fetchData,
    handleDelete,
    handleBulkDelete,
    handleStatusUpdate,
    setFilters,
    filters,
  };
}
