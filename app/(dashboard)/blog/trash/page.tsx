'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BlogList } from '@/components/blogs/blog-list';
import { BlogFiltersComponent } from '@/components/blogs/blog-filters';
import { PaginationWrapper as Pagination } from '@/components/ui/pagination-wrapper';
import { useAuth } from '@/contexts/auth-context';
import { deleteBlog, fetchTrashedBlogs, restoreBlog } from '@/lib/api/blogs';
import { fetchAuthors } from '@/lib/api/authors';
import type { Blog, BlogFilters } from '@/lib/types/blogs';
import type { ReportAuthor } from '@/lib/types/reports';

// Custom hook for trashed blogs
function useTrashedBlogs(initialFilters?: BlogFilters) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<BlogFilters>(initialFilters || {});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchTrashedBlogs(filters);
      setBlogs(response.blogs);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blogs';
      setError(errorMessage);
      toast.error('Failed to load trashed blogs');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilters = useCallback((newFilters: BlogFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const restore = useCallback(
    async (id: string) => {
      try {
        await restoreBlog(id);
        await fetchData();
      } catch (error) {
        throw error;
      }
    },
    [fetchData]
  );

  const hardDelete = useCallback(
    async (id: string) => {
      try {
        await deleteBlog(id);
        await fetchData();
      } catch (error) {
        throw error;
      }
    },
    [fetchData]
  );

  return {
    blogs,
    total,
    totalPages,
    currentPage,
    isLoading,
    error,
    refetch: fetchData,
    setFilters,
    restore,
    hardDelete,
  };
}

export default function BlogTrashPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState<BlogFilters>({ page: 1, limit: 10 });
  const [authors, setAuthors] = useState<ReportAuthor[]>([]);
  const {
    blogs,
    total,
    totalPages,
    currentPage,
    isLoading,
    refetch,
    setFilters: updateFilters,
    restore,
    hardDelete,
  } = useTrashedBlogs(filters);

  const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; blogId: string | null }>({
    open: false,
    blogId: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; blogId: string | null }>({
    open: false,
    blogId: null,
  });

  const isAdmin = user?.role === 'admin';

  const loadAuthors = async () => {
    try {
      const response = await fetchAuthors();
      setAuthors(response.data || []);
    } catch {
      // Error is logged by the API client
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const handleRestore = async () => {
    if (!restoreDialog.blogId) return;

    try {
      await restore(restoreDialog.blogId);
      toast.success('Blog restored successfully');
      setRestoreDialog({ open: false, blogId: null });
    } catch (error) {
      console.error('Failed to restore blog:', error);
      toast.error('Failed to restore blog');
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteDialog.blogId) return;

    try {
      await hardDelete(deleteDialog.blogId);
      toast.success('Blog permanently deleted');
      setDeleteDialog({ open: false, blogId: null });
    } catch (error) {
      console.error('Failed to delete blog:', error);
      toast.error('Failed to delete blog permanently');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/blog')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trash2 className="h-8 w-8" />
              Trash
            </h1>
            <p className="text-muted-foreground mt-1">
              {total} {total === 1 ? 'blog' : 'blogs'} in trash
            </p>
          </div>
        </div>

        <Button onClick={refetch} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <BlogFiltersComponent
        filters={filters}
        onFiltersChange={newFilters => {
          setFilters({ ...newFilters, page: 1 });
          updateFilters({ ...newFilters, page: 1 });
        }}
        authors={authors}
      />

      {/* Blog List */}
      {isLoading ? (
        <div>Loading...</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-lg font-medium">Trash is empty</p>
          <p className="text-muted-foreground mt-1">Deleted blogs will appear here</p>
        </div>
      ) : (
        <>
          <BlogList
            blogs={blogs}
            isLoading={isLoading}
            viewMode="trash"
            onRestore={id => setRestoreDialog({ open: true, blogId: id })}
            onHardDelete={isAdmin ? id => setDeleteDialog({ open: true, blogId: id }) : undefined}
          />

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={page => {
                const newFilters = { ...filters, page };
                setFilters(newFilters);
                updateFilters(newFilters);
              }}
            />
          )}
        </>
      )}

      {/* Restore Confirmation Dialog */}
      <AlertDialog
        open={restoreDialog.open}
        onOpenChange={open => setRestoreDialog({ ...restoreDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Blog?</AlertDialogTitle>
            <AlertDialogDescription>
              This blog will be restored and moved back to active blogs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={open => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Blog?</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive font-medium">
              This action cannot be undone! The blog and all its data will be permanently deleted
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
