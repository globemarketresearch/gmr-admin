'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatisticsFiltersComponent } from '@/components/statistics/statistics-filters';
import { StatisticsList } from '@/components/statistics/statistics-list';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useStatistics } from '@/hooks/use-statistics';
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
import { fetchAuthors } from '@/lib/api/authors';
import type { ReportAuthor } from '@/lib/types/reports';
import type { StatisticFilters } from '@/lib/types/statistics';

export default function StatisticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialPage = Number(searchParams.get('page')) > 0 ? Number(searchParams.get('page')) : 1;
  const [filters, setFilters] = useState<StatisticFilters>({ page: initialPage });
  const [authors, setAuthors] = useState<ReportAuthor[]>([]);
  const {
    statistics,
    total,
    totalPages,
    currentPage,
    isLoading,
    refetch,
    setFilters: updateFilters,
    softDelete,
  } = useStatistics(filters);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    statisticId: string | null;
  }>({
    open: false,
    statisticId: null,
  });

  const syncPageParam = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const applyFilters = (nextFilters: StatisticFilters) => {
    const normalizedFilters = { ...nextFilters, page: nextFilters.page ?? 1 };
    setFilters(normalizedFilters);
    updateFilters(normalizedFilters);
    syncPageParam(normalizedFilters.page);
  };

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
    if (!deleteDialog.statisticId) return;

    try {
      await softDelete(deleteDialog.statisticId);
      toast.success('Statistic moved to trash successfully');
      setDeleteDialog({ open: false, statisticId: null });
    } catch {
      toast.error('Failed to move statistic to trash');
    }
  };

  const canCreateEdit = user?.role === 'admin' || user?.role === 'editor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistics Posts</h1>
          <p className="text-muted-foreground mt-2">Manage statistics content ({total} total)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canCreateEdit && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/statistics/trash">
                <Trash2 className="mr-2 h-4 w-4" />
                View Trash
              </Link>
            </Button>
          )}
          {canCreateEdit && (
            <Button asChild>
              <Link href="/statistics/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <StatisticsFiltersComponent
        filters={filters}
        onFiltersChange={newFilters => {
          applyFilters(newFilters);
        }}
        authors={authors}
      />

      {/* Statistics List */}
      <StatisticsList
        statistics={statistics}
        isLoading={isLoading}
        onSoftDelete={
          canCreateEdit ? id => setDeleteDialog({ open: true, statisticId: id }) : undefined
        }
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (currentPage > 1) applyFilters({ ...filters, page: currentPage - 1 });
                }}
                aria-disabled={currentPage <= 1}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={e => {
                    e.preventDefault();
                    if (page !== currentPage) applyFilters({ ...filters, page });
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (currentPage < totalPages) applyFilters({ ...filters, page: currentPage + 1 });
                }}
                aria-disabled={currentPage >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={open => setDeleteDialog({ open, statisticId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Statistic to Trash</DialogTitle>
            <DialogDescription>
              Are you sure you want to move this statistic post to trash? You can restore it later
              from the trash.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, statisticId: null })}
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
