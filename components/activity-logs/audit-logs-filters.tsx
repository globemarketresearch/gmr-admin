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
import { Input } from '@/components/ui/input';
import { Filter, X } from 'lucide-react';
import type {
  AuditLogFilters,
  AuditLogAction,
  AuditLogEntityType,
  AuditLogStatus,
} from '@/lib/types/api-types';

const ACTION_OPTIONS: { value: AuditLogAction | ''; label: string; group?: string }[] = [
  { value: '', label: 'All Actions' },
  { value: 'auth.login', label: 'Login', group: 'Auth' },
  { value: 'auth.login_failed', label: 'Login Failed', group: 'Auth' },
  { value: 'auth.logout', label: 'Logout', group: 'Auth' },
  { value: 'auth.token_refresh', label: 'Token Refresh', group: 'Auth' },
  { value: 'user.create', label: 'User Created', group: 'User' },
  { value: 'user.update', label: 'User Updated', group: 'User' },
  { value: 'user.delete', label: 'User Deleted', group: 'User' },
  { value: 'user.role_change', label: 'Role Changed', group: 'User' },
  { value: 'report.create', label: 'Report Created', group: 'Report' },
  { value: 'report.update', label: 'Report Updated', group: 'Report' },
  { value: 'report.delete', label: 'Report Deleted', group: 'Report' },
  { value: 'report.publish', label: 'Report Published', group: 'Report' },
  { value: 'category.create', label: 'Category Created', group: 'Category' },
  { value: 'category.update', label: 'Category Updated', group: 'Category' },
  { value: 'category.delete', label: 'Category Deleted', group: 'Category' },
  { value: 'author.create', label: 'Author Created', group: 'Author' },
  { value: 'author.update', label: 'Author Updated', group: 'Author' },
  { value: 'author.delete', label: 'Author Deleted', group: 'Author' },
  { value: 'blog.create', label: 'Blog Created', group: 'Blog' },
  { value: 'blog.update', label: 'Blog Updated', group: 'Blog' },
  { value: 'blog.delete', label: 'Blog Deleted', group: 'Blog' },
  { value: 'blog.publish', label: 'Blog Published', group: 'Blog' },
  { value: 'press_release.create', label: 'PR Created', group: 'Press Release' },
  { value: 'press_release.update', label: 'PR Updated', group: 'Press Release' },
  { value: 'press_release.delete', label: 'PR Deleted', group: 'Press Release' },
  { value: 'press_release.publish', label: 'PR Published', group: 'Press Release' },
];

const ENTITY_OPTIONS: { value: AuditLogEntityType | ''; label: string }[] = [
  { value: '', label: 'All Entities' },
  { value: 'user', label: 'User' },
  { value: 'report', label: 'Report' },
  { value: 'category', label: 'Category' },
  { value: 'author', label: 'Author' },
  { value: 'blog', label: 'Blog' },
  { value: 'press_release', label: 'Press Release' },
];

const STATUS_OPTIONS: { value: AuditLogStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'success', label: 'Success' },
  { value: 'failure', label: 'Failed' },
];

interface AuditLogsFiltersProps {
  filters: AuditLogFilters;
  onFilterChange: (filters: AuditLogFilters) => void;
}

export function AuditLogsFilters({ filters, onFilterChange }: AuditLogsFiltersProps) {
  const activeAction = filters.action || '';
  const activeEntity = filters.entity_type || '';
  const activeStatus = filters.status || '';

  const hasActiveFilters =
    activeAction || activeEntity || activeStatus || filters.start_date || filters.end_date;

  const handleClear = () => {
    onFilterChange({
      page: 1,
      limit: filters.limit,
    });
  };

  // Render grouped action items
  const renderActionItems = () => {
    const items: React.ReactNode[] = [];
    let lastGroup = '';

    ACTION_OPTIONS.forEach(option => {
      if (option.group && option.group !== lastGroup) {
        if (lastGroup) items.push(<DropdownMenuSeparator key={`sep-${option.group}`} />);
        items.push(
          <DropdownMenuLabel key={`label-${option.group}`} className="text-xs">
            {option.group}
          </DropdownMenuLabel>
        );
        lastGroup = option.group;
      }
      items.push(
        <DropdownMenuItem
          key={option.value || 'all'}
          onClick={() => onFilterChange({ ...filters, action: option.value, page: 1 })}
          className={activeAction === option.value ? 'font-semibold' : ''}
        >
          {option.label}
        </DropdownMenuItem>
      );
    });

    return items;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Action Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            {activeAction ? ACTION_OPTIONS.find(o => o.value === activeAction)?.label : 'Action'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 max-h-72 overflow-y-auto">
          {renderActionItems()}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Entity Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {activeEntity ? ENTITY_OPTIONS.find(o => o.value === activeEntity)?.label : 'Entity'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Entity Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ENTITY_OPTIONS.map(option => (
            <DropdownMenuItem
              key={option.value || 'all'}
              onClick={() =>
                onFilterChange({
                  ...filters,
                  entity_type: option.value as AuditLogEntityType | '',
                  page: 1,
                })
              }
              className={activeEntity === option.value ? 'font-semibold' : ''}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {activeStatus ? STATUS_OPTIONS.find(o => o.value === activeStatus)?.label : 'Status'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {STATUS_OPTIONS.map(option => (
            <DropdownMenuItem
              key={option.value || 'all'}
              onClick={() =>
                onFilterChange({ ...filters, status: option.value as AuditLogStatus | '', page: 1 })
              }
              className={activeStatus === option.value ? 'font-semibold' : ''}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Range */}
      <Input
        type="date"
        className="w-36 h-9 text-sm"
        placeholder="From"
        value={filters.start_date?.split('T')[0] || ''}
        onChange={e =>
          onFilterChange({
            ...filters,
            start_date: e.target.value ? `${e.target.value}T00:00:00Z` : '',
            page: 1,
          })
        }
      />
      <Input
        type="date"
        className="w-36 h-9 text-sm"
        placeholder="To"
        value={filters.end_date?.split('T')[0] || ''}
        onChange={e =>
          onFilterChange({
            ...filters,
            end_date: e.target.value ? `${e.target.value}T23:59:59Z` : '',
            page: 1,
          })
        }
      />

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
