'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Statistic, StatisticFormData } from '@/lib/types/statistics';
import {
  fetchStatisticById,
  createStatistic,
  updateStatistic,
  deleteStatistic,
  submitForReview,
  publishStatistic,
  unpublishStatistic,
  formDataToCreateRequest,
  formDataToUpdateRequest,
  schedulePublish,
  cancelScheduledPublish,
} from '@/lib/api/statistics';

interface UseStatisticReturn {
  statistic: Statistic | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchStatistic: (id: string) => Promise<void>;
  saveStatistic: (id: string | null, data: StatisticFormData) => Promise<Statistic | null>;
  removeStatistic: (id: string) => Promise<void>;
  submitStatisticForReview: (id: string) => Promise<Statistic | null>;
  publishStatisticPost: (id: string) => Promise<Statistic | null>;
  unpublishStatisticPost: (id: string) => Promise<Statistic | null>;
  scheduleStatisticPublish: (id: string, publishDate: Date) => Promise<Statistic | null>;
  cancelStatisticSchedule: (id: string) => Promise<Statistic | null>;
}

export function useStatistic(): UseStatisticReturn {
  const [statistic, setStatistic] = useState<Statistic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchStatistic = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { statistic } = await fetchStatisticById(id);
      setStatistic(statistic);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistic post';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveStatistic = useCallback(
    async (id: string | null, data: StatisticFormData): Promise<Statistic | null> => {
      try {
        setIsSaving(true);
        setError(null);

        const response = id
          ? await updateStatistic(id, formDataToUpdateRequest(data))
          : await createStatistic(formDataToCreateRequest(data));

        setStatistic(response.statistic);
        toast.success(
          id ? 'Statistic post updated successfully' : 'Statistic post created successfully'
        );

        // Navigate to edit page for new statistics
        if (!id) {
          router.push(`/statistics/${response.statistic.id}`);
        }

        return response.statistic;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save statistic post';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [router]
  );

  const removeStatistic = useCallback(
    async (id: string) => {
      try {
        setIsSaving(true);
        await deleteStatistic(id);
        toast.success('Statistic post deleted successfully');
        router.push('/statistics');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete statistic post';
        toast.error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    },
    [router]
  );

  const submitStatisticForReview = useCallback(async (id: string): Promise<Statistic | null> => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await submitForReview(id);
      setStatistic(response.statistic);
      toast.success('Statistic post submitted for review');
      return response.statistic;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit for review';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const publishStatisticPost = useCallback(async (id: string): Promise<Statistic | null> => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await publishStatistic(id);
      setStatistic(response.statistic);
      toast.success('Statistic post published successfully');
      return response.statistic;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish statistic post';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const unpublishStatisticPost = useCallback(async (id: string): Promise<Statistic | null> => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await unpublishStatistic(id);
      setStatistic(response.statistic);
      toast.success('Statistic post unpublished');
      return response.statistic;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to unpublish statistic post';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const scheduleStatisticPublish = useCallback(
    async (id: string, publishDate: Date): Promise<Statistic | null> => {
      try {
        setIsSaving(true);
        const { statistic: updatedStatistic } = await schedulePublish(id, publishDate);
        setStatistic(updatedStatistic);
        toast.success('Statistic scheduled successfully');
        return updatedStatistic;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to schedule statistic';
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const cancelStatisticSchedule = useCallback(async (id: string): Promise<Statistic | null> => {
    try {
      setIsSaving(true);
      const { statistic: updatedStatistic } = await cancelScheduledPublish(id);
      setStatistic(updatedStatistic);
      toast.success('Schedule cancelled');
      return updatedStatistic;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel schedule';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    statistic,
    isLoading,
    isSaving,
    error,
    fetchStatistic,
    saveStatistic,
    removeStatistic,
    submitStatisticForReview,
    publishStatisticPost,
    unpublishStatisticPost,
    scheduleStatisticPublish,
    cancelStatisticSchedule,
  };
}
