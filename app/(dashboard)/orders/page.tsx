'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, RefreshCw } from 'lucide-react';
import { useOrders } from '@/hooks/use-orders';
import { OrdersList } from '@/components/orders/orders-list';
import { OrdersStats } from '@/components/orders/orders-stats';
import { OrdersFilters } from '@/components/orders/orders-filters';
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';
import { StatsCardsSkeleton } from '@/components/ui/skeletons/stats-cards-skeleton';

export default function OrdersPage() {
  const { orders, stats, total, isLoading, currentPage, totalPages, setFilters, filters, refetch } =
    useOrders();

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage report purchases and fulfill orders</p>
        </div>
        <Button variant="outline" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <StatsCardsSkeleton count={4} columns={4} />
      ) : (
        <div className="fade-in">
          <OrdersStats stats={stats} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {total} total order{total !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, email, company, report..."
                  value={filters.search || ''}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <OrdersFilters filters={filters} onFilterChange={setFilters} />
            </div>

            {isLoading ? (
              <TableSkeleton rows={8} columns={7} showHeader={true} showActions={true} />
            ) : (
              <div className="fade-in">
                <OrdersList orders={orders} />

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
