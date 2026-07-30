'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IndustryNewsFiltersComponent } from '@/components/industry-news/industry-news-filters';
import { IndustryNewsList } from '@/components/industry-news/industry-news-list';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useIndustryNewsList } from '@/hooks/use-industry-news-list';
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
import type { IndustryNewsFilters } from '@/lib/types/industry-news';

export default function IndustryNewsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialPage = Number(searchParams.get('page')) > 0 ? Number(searchParams.get('page')) : 1;
  const [filters, setFilters] = useState<IndustryNewsFilters>({ page: initialPage });
  const [authors, setAuthors] = useState<ReportAuthor[]>([]);
  const {
    industryNewsItems,
    total,
    totalPages,
    currentPage,
    isLoading,
    refetch,
    setFilters: updateFilters,
    softDelete,
  } = useIndustryNewsList(filters);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    industryNewsId: number | null;
  }>({
    open: false,
    industryNewsId: null,
  });

  const syncPageParam = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const applyFilters = (nextFilters: IndustryNewsFilters) => {
    const normalizedFilters = { ...nextFilters, page: nextFilters.page ?? 1 };
    setFilters(normalizedFilters);
    updateFilters(normalizedFilters);
    syncPageParam(normalizedFilters.page);
  };

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
    if (!deleteDialog.industryNewsId) return;

    try {
      await softDelete(deleteDialog.industryNewsId);
      toast.success('Industry news moved to trash successfully');
      setDeleteDialog({ open: false, industryNewsId: null });
    } catch {
      toast.error('Failed to move industry news to trash');
    }
  };

  const canCreateEdit = user?.role === 'admin' || user?.role === 'editor';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Industry News</h1>
          <p className="text-muted-foreground mt-2">Manage industry news ({total} total)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canCreateEdit && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/industry-news/trash">
                <Trash2 className="mr-2 h-4 w-4" />
                View Trash
              </Link>
            </Button>
          )}
          {canCreateEdit && (
            <Button asChild>
              <Link href="/industry-news/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Industry News
              </Link>
            </Button>
          )}
        </div>
      </div>

      <IndustryNewsFiltersComponent
        filters={filters}
        onFiltersChange={newFilters => {
          applyFilters(newFilters);
        }}
        authors={authors}
      />

      <IndustryNewsList
        industryNewsItems={industryNewsItems}
        isLoading={isLoading}
        onSoftDelete={
          canCreateEdit ? id => setDeleteDialog({ open: true, industryNewsId: id }) : undefined
        }
      />

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

      <Dialog
        open={deleteDialog.open}
        onOpenChange={open => setDeleteDialog({ open, industryNewsId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Industry News to Trash</DialogTitle>
            <DialogDescription>
              Are you sure you want to move this article to trash? You can restore it later from the
              trash.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, industryNewsId: null })}
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
