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
import { ReportList } from '@/components/reports/report-list';
import { ReportFiltersComponent } from '@/components/reports/report-filters';
import { PaginationWrapper as Pagination } from '@/components/ui/pagination-wrapper';
import { useAuth } from '@/contexts/auth-context';
import { deleteReport, fetchTrashedReports, restoreReport } from '@/lib/api/reports';
import type { Report, ReportFilters } from '@/lib/types/reports';

// Custom hook for trashed reports
function useTrashedReports(initialFilters?: ReportFilters) {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ReportFilters>(initialFilters || {});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchTrashedReports(filters);
      setReports(response.reports);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reports';
      setError(errorMessage);
      toast.error('Failed to load trashed reports');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilters = useCallback((newFilters: ReportFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const restore = useCallback(
    async (id: string) => {
      try {
        await restoreReport(id);
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
        await deleteReport(id);
        await fetchData();
      } catch (error) {
        throw error;
      }
    },
    [fetchData]
  );

  return {
    reports,
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

export default function TrashPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState<ReportFilters>({ page: 1, limit: 10 });
  const {
    reports,
    total,
    totalPages,
    currentPage,
    isLoading,
    refetch,
    setFilters: updateFilters,
    restore,
    hardDelete,
  } = useTrashedReports(filters);

  const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; reportId: string | null }>({
    open: false,
    reportId: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; reportId: string | null }>({
    open: false,
    reportId: null,
  });

  const isAdmin = user?.role === 'admin';

  const handleRestore = async () => {
    if (!restoreDialog.reportId) return;

    try {
      await restore(restoreDialog.reportId);
      toast.success('Report restored successfully');
      setRestoreDialog({ open: false, reportId: null });
    } catch (error) {
      console.error('Failed to restore report:', error);
      toast.error('Failed to restore report');
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteDialog.reportId) return;

    try {
      await hardDelete(deleteDialog.reportId);
      toast.success('Report permanently deleted');
      setDeleteDialog({ open: false, reportId: null });
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('Failed to delete report permanently');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/reports')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trash2 className="h-8 w-8" />
              Trash
            </h1>
            <p className="text-muted-foreground mt-1">
              {total} {total === 1 ? 'report' : 'reports'} in trash
            </p>
          </div>
        </div>

        <Button onClick={refetch} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <ReportFiltersComponent
        filters={filters}
        onFiltersChange={newFilters => {
          setFilters({ ...newFilters, page: 1 });
          updateFilters({ ...newFilters, page: 1 });
        }}
      />

      {/* Report List */}
      {isLoading ? (
        <div>Loading...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-lg font-medium">Trash is empty</p>
          <p className="text-muted-foreground mt-1">Deleted reports will appear here</p>
        </div>
      ) : (
        <>
          <ReportList
            reports={reports}
            isLoading={isLoading}
            viewMode="trash"
            onRestore={id => setRestoreDialog({ open: true, reportId: id })}
            onHardDelete={isAdmin ? id => setDeleteDialog({ open: true, reportId: id }) : undefined}
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
            <AlertDialogTitle>Restore Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This report will be restored and moved back to active reports.
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
            <AlertDialogTitle>Permanently Delete Report?</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive font-medium">
              This action cannot be undone! The report and all its data will be permanently deleted
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
