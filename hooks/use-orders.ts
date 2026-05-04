'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { ApiOrder, OrderStats, OrderFilters, OrderStatus } from '@/lib/types/api-types';
import { fetchOrders, fetchOrderStats, updateOrderStatus } from '@/lib/api/orders';

interface UseOrdersReturn {
  orders: ApiOrder[];
  stats: OrderStats | null;
  total: number;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  filters: OrderFilters;
  setFilters: (filters: OrderFilters) => void;
  refetch: () => Promise<void>;
  handleStatusUpdate: (id: number, status: OrderStatus, adminNotes?: string) => Promise<boolean>;
}

export function useOrders(initialFilters?: OrderFilters): UseOrdersReturn {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>(
    initialFilters || { page: 1, limit: 20, sortOrder: 'desc' }
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchOrders(filters);

      setOrders(response.data || []);
      setTotal(response.meta?.total || 0);
      setCurrentPage(response.meta?.page || 1);
      setTotalPages(response.meta?.total_pages || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchStatsData = useCallback(async () => {
    try {
      const response = await fetchOrderStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch order stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStatsData();
  }, [fetchData, fetchStatsData]);

  const handleStatusUpdate = useCallback(
    async (id: number, status: OrderStatus, adminNotes?: string): Promise<boolean> => {
      try {
        await updateOrderStatus(id, { status, admin_notes: adminNotes });
        toast.success('Order status updated successfully');
        await fetchData();
        await fetchStatsData();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchData, fetchStatsData]
  );

  return {
    orders,
    stats,
    total,
    isLoading,
    error,
    currentPage,
    totalPages,
    filters,
    setFilters,
    refetch: fetchData,
    handleStatusUpdate,
  };
}
