'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { IndustryNews, IndustryNewsFormData } from '@/lib/types/industry-news';
import {
  fetchIndustryNewsById,
  createIndustryNews,
  updateIndustryNews,
  deleteIndustryNews,
  submitForReview,
  publishIndustryNews,
  unpublishIndustryNews,
  schedulePublish,
  cancelScheduledPublish,
} from '@/lib/api/industry-news';

interface UseIndustryNewsReturn {
  industryNews: IndustryNews | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchIndustryNewsItem: (id: number) => Promise<void>;
  saveIndustryNews: (id: number | null, data: IndustryNewsFormData) => Promise<IndustryNews | null>;
  removeIndustryNews: (id: number) => Promise<void>;
  submitIndustryNewsForReview: (id: number) => Promise<IndustryNews | null>;
  publishIndustryNewsPost: (id: number) => Promise<IndustryNews | null>;
  unpublishIndustryNewsPost: (id: number) => Promise<IndustryNews | null>;
  scheduleIndustryNewsPublish: (id: string, publishDate: Date) => Promise<IndustryNews | null>;
  cancelIndustryNewsSchedule: (id: string) => Promise<IndustryNews | null>;
}

export function useIndustryNews(): UseIndustryNewsReturn {
  const [industryNews, setIndustryNews] = useState<IndustryNews | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchIndustryNewsItem = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const { industryNews } = await fetchIndustryNewsById(id);
      setIndustryNews(industryNews);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load industry news';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveIndustryNews = useCallback(
    async (id: number | null, data: IndustryNewsFormData): Promise<IndustryNews | null> => {
      try {
        setIsSaving(true);
        setError(null);

        const response = id ? await updateIndustryNews(id, data) : await createIndustryNews(data);

        setIndustryNews(response.industryNews);
        toast.success(id ? 'Industry news updated successfully' : 'Industry news created successfully');

        if (!id) {
          router.push(`/industry-news/${response.industryNews.id}`);
        }

        return response.industryNews;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save industry news';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [router]
  );

  const removeIndustryNews = useCallback(
    async (id: number) => {
      try {
        setIsSaving(true);
        await deleteIndustryNews(id);
        toast.success('Industry news deleted successfully');
        router.push('/industry-news');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete industry news';
        toast.error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    },
    [router]
  );

  const submitIndustryNewsForReview = useCallback(
    async (id: number): Promise<IndustryNews | null> => {
      try {
        setIsSaving(true);
        setError(null);
        const response = await submitForReview(id);
        setIndustryNews(response.industryNews);
        toast.success('Industry news submitted for review');
        return response.industryNews;
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

  const publishIndustryNewsPost = useCallback(async (id: number): Promise<IndustryNews | null> => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await publishIndustryNews(id);
      setIndustryNews(response.industryNews);
      toast.success('Industry news published successfully');
      return response.industryNews;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish industry news';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const unpublishIndustryNewsPost = useCallback(
    async (id: number): Promise<IndustryNews | null> => {
      try {
        setIsSaving(true);
        setError(null);
        const response = await unpublishIndustryNews(id);
        setIndustryNews(response.industryNews);
        toast.success('Industry news unpublished');
        return response.industryNews;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to unpublish industry news';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const scheduleIndustryNewsPublish = useCallback(
    async (id: string, publishDate: Date): Promise<IndustryNews | null> => {
      try {
        setIsSaving(true);
        setError(null);
        const response = await schedulePublish(id, publishDate);
        setIndustryNews(response.industryNews);
        toast.success('Industry news scheduled for publishing');
        return response.industryNews;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to schedule industry news';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const cancelIndustryNewsSchedule = useCallback(
    async (id: string): Promise<IndustryNews | null> => {
      try {
        setIsSaving(true);
        setError(null);
        const response = await cancelScheduledPublish(id);
        setIndustryNews(response.industryNews);
        toast.success('Scheduled publishing cancelled');
        return response.industryNews;
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
    industryNews,
    isLoading,
    isSaving,
    error,
    fetchIndustryNewsItem,
    saveIndustryNews,
    removeIndustryNews,
    submitIndustryNewsForReview,
    publishIndustryNewsPost,
    unpublishIndustryNewsPost,
    scheduleIndustryNewsPublish,
    cancelIndustryNewsSchedule,
  };
}
