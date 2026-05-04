'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import { AuditLogsList } from '@/components/activity-logs/audit-logs-list';
import { AuditLogsFilters } from '@/components/activity-logs/audit-logs-filters';
import { AuditLogDetail } from '@/components/activity-logs/audit-log-detail';
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';

const TABS = [
  { value: 'all', label: 'All', prefix: '' },
  { value: 'auth', label: 'Auth', prefix: 'auth.' },
  { value: 'users', label: 'Users', prefix: 'user.' },
  { value: 'reports', label: 'Reports', prefix: 'report.' },
  { value: 'content', label: 'Content', prefix: 'blog.,press_release.,category.,author.' },
] as const;

export default function ActivityLogsPage() {
  const {
    logs,
    total,
    isLoading,
    currentPage,
    totalPages,
    setFilters,
    filters,
    refetch,
    selectedLog,
    selectLog,
  } = useAuditLogs();

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleTabChange = (value: string) => {
    const tab = TABS.find(t => t.value === value);
    setFilters({
      page: 1,
      limit: filters.limit,
      action_prefix: tab?.prefix || '',
    });
  };

  const activeTab = TABS.find(t => t.prefix === (filters.action_prefix || ''))?.value || 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">View audit trail and system activity</p>
        </div>
        <Button variant="outline" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          {TABS.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{TABS.find(t => t.value === activeTab)?.label || 'All'} Activity</CardTitle>
          <CardDescription>
            {total} total log{total !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AuditLogsFilters filters={filters} onFilterChange={setFilters} />

            {isLoading ? (
              <TableSkeleton rows={10} columns={7} showHeader={true} showActions={true} />
            ) : (
              <div className="fade-in">
                <AuditLogsList logs={logs} onSelect={selectLog} />

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

      <AuditLogDetail
        log={selectedLog}
        open={selectedLog !== null}
        onClose={() => selectLog(null)}
      />
    </div>
  );
}
