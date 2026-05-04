'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye } from 'lucide-react';
import type { ApiOrder, OrderStatus } from '@/lib/types/api-types';

const STATUS_BADGE: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending_payment: { label: 'Pending Payment', variant: 'secondary' },
  payment_received: { label: 'Payment Received', variant: 'default' },
  processing: { label: 'Processing', variant: 'outline' },
  delivered: { label: 'Delivered', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'destructive' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_BADGE[status] || { label: status, variant: 'secondary' };

  const colorClass =
    status === 'payment_received'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : status === 'processing'
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
        : status === 'delivered'
          ? 'bg-green-100 text-green-800 border-green-200'
          : status === 'cancelled' || status === 'refunded'
            ? 'bg-red-100 text-red-800 border-red-200'
            : 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <Badge variant={config.variant} className={`text-xs ${colorClass}`}>
      {config.label}
    </Badge>
  );
}

interface OrdersListProps {
  orders: ApiOrder[];
}

export function OrdersList({ orders }: OrdersListProps) {
  if (orders.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No orders found</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Report</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-sm text-muted-foreground">#{order.id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                  {order.customer_company && (
                    <p className="text-xs text-muted-foreground">{order.customer_company}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm line-clamp-2 max-w-[200px]">{order.report_title}</p>
              </TableCell>
              <TableCell className="text-right font-medium">
                {order.currency} {order.amount.toFixed(2)}
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
