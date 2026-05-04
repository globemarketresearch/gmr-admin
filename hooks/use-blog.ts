'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Blog, BlogFormData } from '@/lib/types/blogs';
import {
  fetchBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  submitForReview,
  publishBlog,
  unpublishBlog,
  formDataToCreateRequest,
  formDataToUpdateRequest,
  schedulePublish,
  cancelScheduledPublish,
} from '@/lib/api/blogs';

interface UseBlogReturn {
  blog: Blog | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchBlog: (id: string) => Promise<void>;
  saveBlog: (id: string | null, data: BlogFormData) => Promise<Blog | null>;
  removeBlog: (id: string) => Promise<void>;
  submitBlogForReview: (id: string) => Promise<Blog | null>;
  publishBlogPost: (id: string) => Promise<Blog | null>;
  unpublishBlogPost: (id: string) => Promise<Blog | null>;
  scheduleBlogPublish: (id: string, publishDate: Date) => Promise<Blog | null>;
  cancelBlogSchedule: (id: string) => Promise<Blog | null>;
}

export function useBlog(): UseBlogReturn {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchBlog = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { blog } = await fetchBlogById(id);
      setBlog(blog);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load blog post';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveBlog = useCallback(
    async (id: string | null, data: BlogFormData): Promise<Blog | null> => {
      try {
        setIsSaving(true);
        setError(null);

        const response = id
          ? await updateBlog(id, formDataToUpdateRequest(data))
          : await createBlog(formDataToCreateRequest(data));

        setBlog(response.blog);
        toast.success(id ? 'Blog post updated successfully' : 'Blog post created successfully');

        // Navigate to edit page for new blogs
        if (!id) {
          router.push(`/blog/${response.blog.id}`);
        }

        return response.blog;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save blog post';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [router]
  );

  const removeBlog = useCallback(
    async (id: string) => {
      try {
        setIsSaving(true);
        await deleteBlog(id);
        toast.success('Blog post deleted successfully');
        router.push('/blog');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete blog post';
        toast.error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    },
    [router]
  );

  const submitBlogForReview = useCallback(async (id: string): Promise<Blog | null> => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await submitForReview(id);
      setBlog(response.blog);
      toast.success('Blog post submitted for review');
      return response.blog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit for review';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const publishBlogPost = useCallback(async (id: string): Promise<Blog | null> => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await publishBlog(id);
      setBlog(response.blog);
      toast.success('Blog post published successfully');
      return response.blog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish blog post';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const unpublishBlogPost = useCallback(async (id: string): Promise<Blog | null> => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await unpublishBlog(id);
      setBlog(response.blog);
      toast.success('Blog post unpublished');
      return response.blog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unpublish blog post';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const scheduleBlogPublish = useCallback(
    async (id: string, publishDate: Date): Promise<Blog | null> => {
      try {
        setIsSaving(true);
        const { blog: updatedBlog } = await schedulePublish(id, publishDate);
        setBlog(updatedBlog);
        toast.success('Blog scheduled successfully');
        return updatedBlog;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to schedule blog';
        toast.error(errorMessage);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const cancelBlogSchedule = useCallback(async (id: string): Promise<Blog | null> => {
    try {
      setIsSaving(true);
      const { blog: updatedBlog } = await cancelScheduledPublish(id);
      setBlog(updatedBlog);
      toast.success('Schedule cancelled');
      return updatedBlog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel schedule';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    blog,
    isLoading,
    isSaving,
    error,
    fetchBlog,
    saveBlog,
    removeBlog,
    submitBlogForReview,
    publishBlogPost,
    unpublishBlogPost,
    scheduleBlogPublish,
    cancelBlogSchedule,
  };
}
