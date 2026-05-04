'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ReportFiltersComponent } from '@/components/reports/report-filters';
import { ReportList } from '@/components/reports/report-list';
import { PaginationWrapper as Pagination } from '@/components/ui/pagination-wrapper';
import { useReports } from '@/hooks/use-reports';
import { useAuth } from '@/contexts/auth-context';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { ReportFilters } from '@/lib/types/reports';

export default function ReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialPage = Number(searchParams.get('page')) > 0 ? Number(searchParams.get('page')) : 1;
  const [filters, setFilters] = useState<ReportFilters>({ page: initialPage });
  const {
    reports,
    total,
    totalPages,
    currentPage,
    isLoading,
    refetch,
    setFilters: updateFilters,
    softDelete,
  } = useReports(filters);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    reportId: string | null;
  }>({
    open: false,
    reportId: null,
  });

  const syncPageParam = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const applyFilters = (nextFilters: ReportFilters) => {
    const normalizedFilters = { ...nextFilters, page: nextFilters.page ?? 1 };
    setFilters(normalizedFilters);
    updateFilters(normalizedFilters);
    syncPageParam(normalizedFilters.page);
  };

  useEffect(() => {
    const pageParam = searchParams.get('page');

    if (!pageParam) {
      syncPageParam(1);
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const pageParam = Number(searchParams.get('page'));

    if (currentPage > 0 && currentPage !== pageParam) {
      syncPageParam(currentPage);
    }
  }, [currentPage, pathname, router, searchParams]);

  const handleDelete = async () => {
    if (!deleteDialog.reportId) return;

    try {
      await softDelete(deleteDialog.reportId);
      toast.success('Report moved to trash');
      setDeleteDialog({ open: false, reportId: null });
    } catch {
      toast.error('Failed to move report to trash');
    }
  };

  const canCreateEdit = user?.role === 'admin' || user?.role === 'editor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Manage market research reports ({total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canCreateEdit && (
            <Button variant="outline" size="sm" onClick={() => router.push('/reports/trash')}>
              <Trash2 className="mr-2 h-4 w-4" />
              View Trash
            </Button>
          )}
          {canCreateEdit && (
            <Button asChild>
              <Link href="/reports/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Report
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <ReportFiltersComponent
        filters={filters}
        onFiltersChange={newFilters => {
          applyFilters(newFilters);
        }}
      />

      {/* Reports List */}
      <ReportList
        reports={reports}
        isLoading={isLoading}
        viewMode="active"
        onSoftDelete={
          canCreateEdit ? id => setDeleteDialog({ open: true, reportId: id }) : undefined
        }
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={page => applyFilters({ ...filters, page })}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={open => setDeleteDialog({ open, reportId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Report to Trash</DialogTitle>
            <DialogDescription>
              This report will be moved to trash. You can restore it later from the trash page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, reportId: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
