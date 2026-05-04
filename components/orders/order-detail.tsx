'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import type { ApiOrder, OrderStatus } from '@/lib/types/api-types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pending Payment',
  payment_received: 'Payment Received',
  processing: 'Processing',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: 'bg-gray-100 text-gray-700',
  payment_received: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-red-100 text-red-800',
};

interface OrderDetailProps {
  order: ApiOrder;
  onStatusUpdate: (id: number, status: OrderStatus, notes?: string) => Promise<boolean>;
}

export function OrderDetail({ order, onStatusUpdate }: OrderDetailProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onStatusUpdate(order.id, selectedStatus, adminNotes);
    setIsSaving(false);
  };

  const isDirty = selectedStatus !== order.status || adminNotes !== (order.admin_notes || '');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <p className="text-muted-foreground text-sm">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <Badge className={`ml-auto ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Customer + Report */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Name</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{order.customer_email}</p>
              </div>
              {order.customer_company && (
                <div>
                  <p className="text-muted-foreground mb-1">Company</p>
                  <p className="font-medium">{order.customer_company}</p>
                </div>
              )}
              {order.customer_phone && (
                <div>
                  <p className="text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
              )}
              {order.customer_country && (
                <div>
                  <p className="text-muted-foreground mb-1">Country</p>
                  <p className="font-medium">{order.customer_country}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <p className="text-muted-foreground mb-1">Title</p>
                <p className="font-medium">{order.report_title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground mb-1">Amount</p>
                  <p className="font-bold text-lg">
                    {order.currency} {order.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Report ID</p>
                  <p className="font-medium">#{order.report_id}</p>
                </div>
              </div>
              {order.paypal_order_id && (
                <div>
                  <p className="text-muted-foreground mb-1">PayPal Order ID</p>
                  <p className="font-mono text-xs">{order.paypal_order_id}</p>
                </div>
              )}
              {order.paypal_capture_id && (
                <div>
                  <p className="text-muted-foreground mb-1">PayPal Capture ID</p>
                  <p className="font-mono text-xs">{order.paypal_capture_id}</p>
                </div>
              )}
              {order.fulfilled_at && (
                <div>
                  <p className="text-muted-foreground mb-1">Fulfilled At</p>
                  <p className="font-medium">{new Date(order.fulfilled_at).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Status management */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Status
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={val => setSelectedStatus(val as OrderStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Admin Notes
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this order..."
                  rows={4}
                  className="resize-none text-sm"
                />
              </div>

              <Button onClick={handleSave} disabled={!isDirty || isSaving} className="w-full">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
