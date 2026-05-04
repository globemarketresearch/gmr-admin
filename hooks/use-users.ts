'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { ApiUserResponse } from '@/lib/types/api-types';
import { fetchUsers, deleteUser } from '@/lib/api/users';

interface UseUsersReturn {
  users: ApiUserResponse[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  handleDelete: (id: number | string) => Promise<boolean>;
}

export function useUsers(page: number = 1, limit: number = 20): UseUsersReturn {
  const [users, setUsers] = useState<ApiUserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchUsers(page, limit);

      setUsers(response.data || []);
      setTotal(response.meta?.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(
    async (id: number | string): Promise<boolean> => {
      try {
        await deleteUser(id);
        toast.success('User deleted successfully');
        await fetchData();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchData]
  );

  return {
    users,
    total,
    isLoading,
    error,
    refetch: fetchData,
    handleDelete,
  };
}
