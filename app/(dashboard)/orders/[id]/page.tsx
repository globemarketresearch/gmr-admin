'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchOrderById, updateOrderStatus } from '@/lib/api/orders';
import { OrderDetail } from '@/components/orders/order-detail';
import type { ApiOrder, OrderStatus } from '@/lib/types/api-types';
import { toast } from 'sonner';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await fetchOrderById(id);
        setOrder(response.data);
      } catch (err) {
        console.error('Failed to load order:', err);
        toast.error('Failed to load order');
        router.push('/orders');
      } finally {
        setIsLoading(false);
      }
    };
    loadOrder();
  }, [id, router]);

  const handleStatusUpdate = async (
    orderId: number,
    status: OrderStatus,
    adminNotes?: string
  ): Promise<boolean> => {
    try {
      await updateOrderStatus(orderId, { status, admin_notes: adminNotes });
      toast.success('Order status updated successfully');
      // Reload the order
      const response = await fetchOrderById(id);
      setOrder(response.data);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(msg);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) return null;

  return <OrderDetail order={order} onStatusUpdate={handleStatusUpdate} />;
}
