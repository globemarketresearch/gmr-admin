'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import type { OrderFilters, OrderStatus } from '@/lib/types/api-types';

const STATUS_OPTIONS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'processing', label: 'Processing' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

interface OrdersFiltersProps {
  filters: OrderFilters;
  onFilterChange: (filters: OrderFilters) => void;
}

export function OrdersFilters({ filters, onFilterChange }: OrdersFiltersProps) {
  const activeStatus = filters.status || '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          {activeStatus
            ? STATUS_OPTIONS.find(s => s.value === activeStatus)?.label
            : 'Filter by Status'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Order Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUS_OPTIONS.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() =>
              onFilterChange({ ...filters, status: option.value as OrderStatus | '', page: 1 })
            }
            className={activeStatus === option.value ? 'font-semibold' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
