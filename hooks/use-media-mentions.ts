'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { MediaMention } from '@/lib/types/media-mentions';
import { fetchMediaMentions, deleteMediaMention } from '@/lib/api/media-mentions';

interface UseMediaMentionsReturn {
  mediaMentions: MediaMention[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  handleDelete: (id: number | string) => Promise<boolean>;
}

export function useMediaMentions(): UseMediaMentionsReturn {
  const [mediaMentions, setMediaMentions] = useState<MediaMention[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchMediaMentions();

      setMediaMentions(response.data || []);
      setTotal(response.meta?.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load media mentions';
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
        await deleteMediaMention(id);
        toast.success('Media mention deleted successfully');
        await fetchData();
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete media mention';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchData]
  );

  return {
    mediaMentions,
    total,
    isLoading,
    error,
    refetch: fetchData,
    handleDelete,
  };
}
