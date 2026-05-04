'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { ApiUserResponse, CreateUserRequest, UpdateUserRequest } from '@/lib/types/api-types';
import { fetchUserById, createUser, updateUser } from '@/lib/api/users';

interface UseUserReturn {
  user: ApiUserResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  handleCreate: (data: CreateUserRequest) => Promise<ApiUserResponse | null>;
  handleUpdate: (id: number | string, data: UpdateUserRequest) => Promise<ApiUserResponse | null>;
}

export function useUser(id?: number | string): UseUserReturn {
  const [user, setUser] = useState<ApiUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchUserById(id);
      setUser(response.data || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user';
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

  const handleCreate = useCallback(async (data: CreateUserRequest): Promise<ApiUserResponse | null> => {
    try {
      setIsSaving(true);
      const response = await createUser(data);
      toast.success('User created successfully');
      return response.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleUpdate = useCallback(
    async (id: number | string, data: UpdateUserRequest): Promise<ApiUserResponse | null> => {
      try {
        setIsSaving(true);
        const response = await updateUser(id, data);
        toast.success('User updated successfully');
        const updatedUser = response.data || null;
        setUser(updatedUser);
        return updatedUser;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    user,
    isLoading,
    isSaving,
    error,
    refetch: fetchData,
    handleCreate,
    handleUpdate,
  };
}
