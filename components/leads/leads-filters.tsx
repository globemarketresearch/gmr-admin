'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { FormSubmissionFilters, FormCategory, FormStatus } from '@/lib/types/api-types';

export type EmailDomainFilter = 'all' | 'gmail' | 'non-gmail';

interface LeadsFiltersProps {
  filters: FormSubmissionFilters;
  onFilterChange: (filters: FormSubmissionFilters) => void;
  emailDomain: EmailDomainFilter;
  onEmailDomainChange: (value: EmailDomainFilter) => void;
}

export function LeadsFilters({
  filters,
  onFilterChange,
  emailDomain,
  onEmailDomainChange,
}: LeadsFiltersProps) {
  const handleCategoryChange = (value: string) => {
    if (value === 'all') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { category, ...rest } = filters;
      onFilterChange(rest);
    } else {
      onFilterChange({ ...filters, category: value as FormCategory });
    }
  };

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status, ...rest } = filters;
      onFilterChange(rest);
    } else {
      onFilterChange({ ...filters, status: value as FormStatus });
    }
  };

  const clearFilters = () => {
    onFilterChange({ page: 1, limit: 20, sortOrder: 'desc' });
    onEmailDomainChange('all');
  };

  const activeFilterCount = [filters.category, filters.status, emailDomain !== 'all' ? emailDomain : undefined].filter(Boolean).length;

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Category:</label>
        <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="contact">Contact Form</SelectItem>
            <SelectItem value="request-sample">Request Sample</SelectItem>
            <SelectItem value="request-customization">Request Customization</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Status:</label>
        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Email:</label>
        <Select value={emailDomain} onValueChange={v => onEmailDomainChange(v as EmailDomainFilter)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            <SelectItem value="gmail">Gmail only</SelectItem>
            <SelectItem value="non-gmail">Non-Gmail only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear Filters
          <Badge variant="secondary" className="ml-2">
            {activeFilterCount}
          </Badge>
        </Button>
      )}
    </div>
  );
}
