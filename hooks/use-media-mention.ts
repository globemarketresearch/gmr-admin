'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { MediaMention, MediaMentionFormData } from '@/lib/types/media-mentions';
import {
  fetchMediaMentionById,
  createMediaMention,
  updateMediaMention,
} from '@/lib/api/media-mentions';

interface UseMediaMentionReturn {
  mediaMention: MediaMention | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  handleCreate: (data: MediaMentionFormData) => Promise<MediaMention | null>;
  handleUpdate: (
    id: number | string,
    data: MediaMentionFormData
  ) => Promise<MediaMention | null>;
}

export function useMediaMention(id?: number | string): UseMediaMentionReturn {
  const [mediaMention, setMediaMention] = useState<MediaMention | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchMediaMentionById(id);
      setMediaMention(response.data || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load media mention';
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

  const handleCreate = useCallback(
    async (data: MediaMentionFormData): Promise<MediaMention | null> => {
      try {
        setIsSaving(true);
        const response = await createMediaMention(data);
        toast.success('Media mention created successfully');
        return response.data || null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create media mention';
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const handleUpdate = useCallback(
    async (id: number | string, data: MediaMentionFormData): Promise<MediaMention | null> => {
      try {
        setIsSaving(true);
        const response = await updateMediaMention(id, data);
        toast.success('Media mention updated successfully');
        const updated = response.data || null;
        setMediaMention(updated);
        return updated;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update media mention';
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    mediaMention,
    isLoading,
    isSaving,
    error,
    refetch: fetchData,
    handleCreate,
    handleUpdate,
  };
}
