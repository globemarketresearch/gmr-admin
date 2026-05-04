'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { PressRelease, PressReleaseFormData } from '@/lib/types/press-releases';
import {
  fetchPressReleaseById,
  createPressRelease,
  updatePressRelease,
  deletePressRelease,
  submitForReview,
  publishPressRelease,
  unpublishPressRelease,
  schedulePublish,
  cancelScheduledPublish,
} from '@/lib/api/press-releases';

interface UsePressReleaseReturn {
  pressRelease: PressRelease | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchPressRelease: (id: number) => Promise<void>;
  savePressRelease: (id: number | null, data: PressReleaseFormData) => Promise<PressRelease | null>;
  removePressRelease: (id: number) => Promise<void>;
  submitPressReleaseForReview: (id: number) => Promise<PressRelease | null>;
  publishPressReleasePost: (id: number) => Promise<PressRelease | null>;
  unpublishPressReleasePost: (id: number) => Promise<PressRelease | null>;
  schedulePressReleasePublish: (id: string, publishDate: Date) => Promise<PressRelease | null>;
  cancelPressReleaseSchedule: (id: string) => Promise<PressRelease | null>;
}

export function usePressRelease(): UsePressReleaseReturn {
  const [pressRelease, setPressRelease] = useState<PressRelease | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchPressRelease = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const { pressRelease } = await fetchPressReleaseById(id);
      setPressRelease(pressRelease);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load press release';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePressRelease = useCallback(
    async (id: number | null, data: PressReleaseFormData): Promise<PressRelease | null> => {
      try {
        setIsSaving(true);
        setError(null);

        const response = id ? await updatePressRelease(id, data) : await createPressRelease(data);

        setPressRelease(response.pressRelease);
        toast.success(
          id ? 'Press release updated successfully' : 'Press release created successfully'
        );

        // Navigate to edit page for new press releases
        if (!id) {
          router.push(`/press-releases/${response.pressRelease.id}`);
        }

        return response.pressRelease;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save press release';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [router]
  );

  const removePressRelease = useCallback(
    async (id: number) => {
      try {
        setIsSaving(true);
        await deletePressRelease(id);
        toast.success('Press release deleted successfully');
        router.push('/press-releases');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete press release';
        toast.error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    },
    [router]
  );

  const submitPressReleaseForReview = useCallback(
    async (id: number): Promise<PressRelease | null> => {
      try {
        setIsSaving(true);
        setError(null);
        const response = await submitForReview(id);
        setPressRelease(response.pressRelease);
        toast.success('Press release submitted for review');
        return response.pressRelease;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit for review';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const publishPressReleasePost = useCallback(async (id: number): Promise<PressRelease | null> => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await publishPressRelease(id);
      setPressRelease(response.pressRelease);
      toast.success('Press release published successfully');
      return response.pressRelease;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish press release';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const unpublishPressReleasePost = useCallback(
    async (id: number): Promise<PressRelease | null> => {
      try {
        setIsSaving(true);
        setError(null);
        const response = await unpublishPressRelease(id);
        setPressRelease(response.pressRelease);
        toast.success('Press release unpublished');
        return response.pressRelease;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to unpublish press release';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const schedulePressReleasePublish = useCallback(
    async (id: string, publishDate: Date): Promise<PressRelease | null> => {
      try {
        setIsSaving(true);
        setError(null);
        const response = await schedulePublish(id, publishDate);
        setPressRelease(response.pressRelease);
        toast.success('Press release scheduled for publishing');
        return response.pressRelease;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to schedule press release';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const cancelPressReleaseSchedule = useCallback(
    async (id: string): Promise<PressRelease | null> => {
      try {
        setIsSaving(true);
        setError(null);
        const response = await cancelScheduledPublish(id);
        setPressRelease(response.pressRelease);
        toast.success('Scheduled publishing cancelled');
        return response.pressRelease;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to cancel scheduled publishing';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    pressRelease,
    isLoading,
    isSaving,
    error,
    fetchPressRelease,
    savePressRelease,
    removePressRelease,
    submitPressReleaseForReview,
    publishPressReleasePost,
    unpublishPressReleasePost,
    schedulePressReleasePublish,
    cancelPressReleaseSchedule,
  };
}
