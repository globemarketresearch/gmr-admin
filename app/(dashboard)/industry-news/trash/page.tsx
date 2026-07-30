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
import { IndustryNewsList } from '@/components/industry-news/industry-news-list';
import { IndustryNewsFiltersComponent } from '@/components/industry-news/industry-news-filters';
import { PaginationWrapper as Pagination } from '@/components/ui/pagination-wrapper';
import { useAuth } from '@/contexts/auth-context';
import {
  deleteIndustryNews,
  fetchTrashedIndustryNews,
  restoreIndustryNews,
} from '@/lib/api/industry-news';
import { fetchAuthors } from '@/lib/api/authors';
import type { IndustryNews, IndustryNewsFilters } from '@/lib/types/industry-news';
import type { ReportAuthor } from '@/lib/types/reports';

function useTrashedIndustryNews(initialFilters?: IndustryNewsFilters) {
  const [industryNewsItems, setIndustryNewsItems] = useState<IndustryNews[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<IndustryNewsFilters>(initialFilters || {});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchTrashedIndustryNews(filters);
      setIndustryNewsItems(response.industryNews);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch industry news';
      setError(errorMessage);
      toast.error('Failed to load trashed industry news');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilters = useCallback((newFilters: IndustryNewsFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const restore = useCallback(
    async (id: number) => {
      try {
        await restoreIndustryNews(id);
        await fetchData();
      } catch (error) {
        throw error;
      }
    },
    [fetchData]
  );

  const hardDelete = useCallback(
    async (id: number) => {
      try {
        await deleteIndustryNews(id);
        await fetchData();
      } catch (error) {
        throw error;
      }
    },
    [fetchData]
  );

  return {
    industryNewsItems,
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

export default function IndustryNewsTrashPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState<IndustryNewsFilters>({ page: 1, limit: 10 });
  const [authors, setAuthors] = useState<ReportAuthor[]>([]);
  const {
    industryNewsItems,
    total,
    totalPages,
    currentPage,
    isLoading,
    refetch,
    setFilters: updateFilters,
    restore,
    hardDelete,
  } = useTrashedIndustryNews(filters);

  const [restoreDialog, setRestoreDialog] = useState<{
    open: boolean;
    industryNewsId: number | null;
  }>({
    open: false,
    industryNewsId: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    industryNewsId: number | null;
  }>({
    open: false,
    industryNewsId: null,
  });

  const isAdmin = user?.role === 'admin';

  const loadAuthors = async () => {
    try {
      const { data: authors } = await fetchAuthors();
      setAuthors(authors);
    } catch {
      // Error is logged by the API client
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const handleRestore = async () => {
    if (!restoreDialog.industryNewsId) return;

    try {
      await restore(restoreDialog.industryNewsId);
      toast.success('Industry news restored successfully');
      setRestoreDialog({ open: false, industryNewsId: null });
    } catch (error) {
      console.error('Failed to restore industry news:', error);
      toast.error('Failed to restore industry news');
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteDialog.industryNewsId) return;

    try {
      await hardDelete(deleteDialog.industryNewsId);
      toast.success('Industry news permanently deleted');
      setDeleteDialog({ open: false, industryNewsId: null });
    } catch (error) {
      console.error('Failed to delete industry news:', error);
      toast.error('Failed to delete industry news permanently');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/industry-news')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trash2 className="h-8 w-8" />
              Trash
            </h1>
            <p className="text-muted-foreground mt-1">
              {total} {total === 1 ? 'article' : 'articles'} in trash
            </p>
          </div>
        </div>

        <Button onClick={refetch} variant="outline">
          Refresh
        </Button>
      </div>

      <IndustryNewsFiltersComponent
        filters={filters}
        onFiltersChange={newFilters => {
          setFilters({ ...newFilters, page: 1 });
          updateFilters({ ...newFilters, page: 1 });
        }}
        authors={authors}
      />

      {isLoading ? (
        <div>Loading...</div>
      ) : industryNewsItems.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-lg font-medium">Trash is empty</p>
          <p className="text-muted-foreground mt-1">Deleted industry news will appear here</p>
        </div>
      ) : (
        <>
          <IndustryNewsList
            industryNewsItems={industryNewsItems}
            isLoading={isLoading}
            viewMode="trash"
            onRestore={id => setRestoreDialog({ open: true, industryNewsId: id })}
            onHardDelete={
              isAdmin ? id => setDeleteDialog({ open: true, industryNewsId: id }) : undefined
            }
          />

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

      <AlertDialog
        open={restoreDialog.open}
        onOpenChange={open => setRestoreDialog({ ...restoreDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Industry News?</AlertDialogTitle>
            <AlertDialogDescription>
              This article will be restored and moved back to active industry news.
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

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={open => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Industry News?</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive font-medium">
              This action cannot be undone! The article and all its data will be permanently deleted
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
