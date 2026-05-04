'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import type { OrderStats } from '@/lib/types/api-types';

interface OrdersStatsProps {
  stats: OrderStats | null;
}

export function OrdersStats({ stats }: OrdersStatsProps) {
  if (!stats) return null;

  const paymentReceived = stats.by_status?.payment_received || 0;
  const processing = stats.by_status?.processing || 0;
  const delivered = stats.by_status?.delivered || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">{stats.recent_count} in last 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.total_revenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            ${stats.recent_revenue.toFixed(2)} in last 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payment Received</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{paymentReceived}</div>
          <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{delivered}</div>
          <p className="text-xs text-muted-foreground">{processing} in processing</p>
        </CardContent>
      </Card>
    </div>
  );
}
