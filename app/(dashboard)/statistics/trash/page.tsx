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
import { StatisticsList } from '@/components/statistics/statistics-list';
import { StatisticsFiltersComponent } from '@/components/statistics/statistics-filters';
import { PaginationWrapper as Pagination } from '@/components/ui/pagination-wrapper';
import { useAuth } from '@/contexts/auth-context';
import {
  deleteStatistic,
  fetchTrashedStatistics,
  restoreStatistic,
} from '@/lib/api/statistics';
import { fetchAuthors } from '@/lib/api/authors';
import type { Statistic, StatisticFilters } from '@/lib/types/statistics';
import type { ReportAuthor } from '@/lib/types/reports';

// Custom hook for trashed statistics
function useTrashedStatistics(initialFilters?: StatisticFilters) {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<StatisticFilters>(initialFilters || {});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchTrashedStatistics(filters);
      setStatistics(response.statistics);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(errorMessage);
      toast.error('Failed to load trashed statistics');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilters = useCallback((newFilters: StatisticFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const restore = useCallback(
    async (id: string) => {
      try {
        await restoreStatistic(id);
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
        await deleteStatistic(id);
        await fetchData();
      } catch (error) {
        throw error;
      }
    },
    [fetchData]
  );

  return {
    statistics,
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

export default function StatisticsTrashPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState<StatisticFilters>({ page: 1, limit: 10 });
  const [authors, setAuthors] = useState<ReportAuthor[]>([]);
  const {
    statistics,
    total,
    totalPages,
    currentPage,
    isLoading,
    refetch,
    setFilters: updateFilters,
    restore,
    hardDelete,
  } = useTrashedStatistics(filters);

  const [restoreDialog, setRestoreDialog] = useState<{
    open: boolean;
    statisticId: string | null;
  }>({
    open: false,
    statisticId: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    statisticId: string | null;
  }>({
    open: false,
    statisticId: null,
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
    if (!restoreDialog.statisticId) return;

    try {
      await restore(restoreDialog.statisticId);
      toast.success('Statistic restored successfully');
      setRestoreDialog({ open: false, statisticId: null });
    } catch (error) {
      console.error('Failed to restore statistic:', error);
      toast.error('Failed to restore statistic');
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteDialog.statisticId) return;

    try {
      await hardDelete(deleteDialog.statisticId);
      toast.success('Statistic permanently deleted');
      setDeleteDialog({ open: false, statisticId: null });
    } catch (error) {
      console.error('Failed to delete statistic:', error);
      toast.error('Failed to delete statistic permanently');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/statistics')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trash2 className="h-8 w-8" />
              Trash
            </h1>
            <p className="text-muted-foreground mt-1">
              {total} {total === 1 ? 'statistic' : 'statistics'} in trash
            </p>
          </div>
        </div>

        <Button onClick={refetch} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <StatisticsFiltersComponent
        filters={filters}
        onFiltersChange={newFilters => {
          setFilters({ ...newFilters, page: 1 });
          updateFilters({ ...newFilters, page: 1 });
        }}
        authors={authors}
      />

      {/* Statistics List */}
      {isLoading ? (
        <div>Loading...</div>
      ) : statistics.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-lg font-medium">Trash is empty</p>
          <p className="text-muted-foreground mt-1">Deleted statistics will appear here</p>
        </div>
      ) : (
        <>
          <StatisticsList
            statistics={statistics}
            isLoading={isLoading}
            viewMode="trash"
            onRestore={id => setRestoreDialog({ open: true, statisticId: id })}
            onHardDelete={
              isAdmin ? id => setDeleteDialog({ open: true, statisticId: id }) : undefined
            }
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
            <AlertDialogTitle>Restore Statistic?</AlertDialogTitle>
            <AlertDialogDescription>
              This statistic will be restored and moved back to active statistics.
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
            <AlertDialogTitle>Permanently Delete Statistic?</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive font-medium">
              This action cannot be undone! The statistic and all its data will be permanently
              deleted from the database.
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
