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
import { PressReleaseList } from '@/components/press-releases/press-release-list';
import { PressReleaseFiltersComponent } from '@/components/press-releases/press-release-filters';
import { PaginationWrapper as Pagination } from '@/components/ui/pagination-wrapper';
import { useAuth } from '@/contexts/auth-context';
import {
  deletePressRelease,
  fetchTrashedPressReleases,
  restorePressRelease,
} from '@/lib/api/press-releases';
import { fetchAuthors } from '@/lib/api/authors';
import type { PressRelease, PressReleaseFilters } from '@/lib/types/press-releases';
import type { ReportAuthor } from '@/lib/types/reports';

// Custom hook for trashed press releases
function useTrashedPressReleases(initialFilters?: PressReleaseFilters) {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PressReleaseFilters>(initialFilters || {});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchTrashedPressReleases(filters);
      setPressReleases(response.pressReleases);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch press releases';
      setError(errorMessage);
      toast.error('Failed to load trashed press releases');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilters = useCallback((newFilters: PressReleaseFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const restore = useCallback(
    async (id: number) => {
      try {
        await restorePressRelease(id);
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
        await deletePressRelease(id);
        await fetchData();
      } catch (error) {
        throw error;
      }
    },
    [fetchData]
  );

  return {
    pressReleases,
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

export default function PressReleaseTrashPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState<PressReleaseFilters>({ page: 1, limit: 10 });
  const [authors, setAuthors] = useState<ReportAuthor[]>([]);
  const {
    pressReleases,
    total,
    totalPages,
    currentPage,
    isLoading,
    refetch,
    setFilters: updateFilters,
    restore,
    hardDelete,
  } = useTrashedPressReleases(filters);

  const [restoreDialog, setRestoreDialog] = useState<{
    open: boolean;
    pressReleaseId: number | null;
  }>({
    open: false,
    pressReleaseId: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    pressReleaseId: number | null;
  }>({
    open: false,
    pressReleaseId: null,
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
    if (!restoreDialog.pressReleaseId) return;

    try {
      await restore(restoreDialog.pressReleaseId);
      toast.success('Press release restored successfully');
      setRestoreDialog({ open: false, pressReleaseId: null });
    } catch (error) {
      console.error('Failed to restore press release:', error);
      toast.error('Failed to restore press release');
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteDialog.pressReleaseId) return;

    try {
      await hardDelete(deleteDialog.pressReleaseId);
      toast.success('Press release permanently deleted');
      setDeleteDialog({ open: false, pressReleaseId: null });
    } catch (error) {
      console.error('Failed to delete press release:', error);
      toast.error('Failed to delete press release permanently');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/press-releases')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trash2 className="h-8 w-8" />
              Trash
            </h1>
            <p className="text-muted-foreground mt-1">
              {total} {total === 1 ? 'press release' : 'press releases'} in trash
            </p>
          </div>
        </div>

        <Button onClick={refetch} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <PressReleaseFiltersComponent
        filters={filters}
        onFiltersChange={newFilters => {
          setFilters({ ...newFilters, page: 1 });
          updateFilters({ ...newFilters, page: 1 });
        }}
        authors={authors}
      />

      {/* Press Release List */}
      {isLoading ? (
        <div>Loading...</div>
      ) : pressReleases.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-lg font-medium">Trash is empty</p>
          <p className="text-muted-foreground mt-1">Deleted press releases will appear here</p>
        </div>
      ) : (
        <>
          <PressReleaseList
            pressReleases={pressReleases}
            isLoading={isLoading}
            viewMode="trash"
            onRestore={id => setRestoreDialog({ open: true, pressReleaseId: id })}
            onHardDelete={
              isAdmin ? id => setDeleteDialog({ open: true, pressReleaseId: id }) : undefined
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
            <AlertDialogTitle>Restore Press Release?</AlertDialogTitle>
            <AlertDialogDescription>
              This press release will be restored and moved back to active press releases.
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
            <AlertDialogTitle>Permanently Delete Press Release?</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive font-medium">
              This action cannot be undone! The press release and all its data will be permanently
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
