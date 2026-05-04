'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type {
  Redirect,
  RedirectFilters,
  CreateRedirectRequest,
  UpdateRedirectRequest,
} from '@/lib/types/redirects';
import {
  getRedirects,
  createRedirect,
  updateRedirect,
  deleteRedirect,
  toggleRedirect,
  bulkDeleteRedirects,
} from '@/lib/api/redirects';

interface UseRedirectsReturn {
  redirects: Redirect[];
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  fetchRedirects: (filters?: RedirectFilters) => Promise<void>;
  createRedirectItem: (data: CreateRedirectRequest) => Promise<Redirect | null>;
  updateRedirectItem: (id: number, data: UpdateRedirectRequest) => Promise<Redirect | null>;
  deleteRedirectItem: (id: number) => Promise<void>;
  toggleRedirectItem: (id: number) => Promise<Redirect | null>;
  bulkDelete: (ids: number[]) => Promise<void>;
}

export function useRedirects(): UseRedirectsReturn {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRedirects = useCallback(async (filters?: RedirectFilters) => {
    try {
      setIsLoading(true);
      const data = await getRedirects(filters);
      setRedirects(data.redirects || []);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load redirects';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRedirectItem = useCallback(
    async (data: CreateRedirectRequest): Promise<Redirect | null> => {
      try {
        const res = await createRedirect(data);
        toast.success('Redirect created successfully');
        return res.redirect;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create redirect';
        toast.error(msg);
        return null;
      }
    },
    []
  );

  const updateRedirectItem = useCallback(
    async (id: number, data: UpdateRedirectRequest): Promise<Redirect | null> => {
      try {
        const res = await updateRedirect(id, data);
        toast.success('Redirect updated successfully');
        return res.redirect;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update redirect';
        toast.error(msg);
        return null;
      }
    },
    []
  );

  const deleteRedirectItem = useCallback(async (id: number): Promise<void> => {
    try {
      await deleteRedirect(id);
      toast.success('Redirect deleted successfully');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete redirect';
      toast.error(msg);
      throw err;
    }
  }, []);

  const toggleRedirectItem = useCallback(async (id: number): Promise<Redirect | null> => {
    try {
      const res = await toggleRedirect(id);
      return res.redirect;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle redirect';
      toast.error(msg);
      return null;
    }
  }, []);

  const bulkDelete = useCallback(async (ids: number[]): Promise<void> => {
    try {
      await bulkDeleteRedirects(ids);
      toast.success(`${ids.length} redirect(s) deleted successfully`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete redirects';
      toast.error(msg);
      throw err;
    }
  }, []);

  return {
    redirects,
    total,
    totalPages,
    currentPage,
    isLoading,
    fetchRedirects,
    createRedirectItem,
    updateRedirectItem,
    deleteRedirectItem,
    toggleRedirectItem,
    bulkDelete,
  };
}
