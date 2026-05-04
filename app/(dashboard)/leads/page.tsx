'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Mail, Download, RefreshCw } from 'lucide-react';
import { useLeads } from '@/hooks/use-leads';
import { LeadsList } from '@/components/leads/leads-list';
import { LeadsStats } from '@/components/leads/leads-stats';
import { LeadsFilters } from '@/components/leads/leads-filters';
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';
import { StatsCardsSkeleton } from '@/components/ui/skeletons/stats-cards-skeleton';
import type { ApiFormSubmission } from '@/lib/types/api-types';

export default function LeadsPage() {
  const {
    submissions,
    stats,
    total,
    isLoading,
    currentPage,
    totalPages,
    handleDelete,
    handleStatusUpdate,
    setFilters,
    filters,
    refetch,
  } = useLeads();

  const [filteredSubmissions, setFilteredSubmissions] = useState<ApiFormSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSubmissions(submissions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = submissions.filter(submission => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = submission.data as any;
        return (
          data.fullName?.toLowerCase().includes(query) ||
          data.email?.toLowerCase().includes(query) ||
          data.company?.toLowerCase().includes(query) ||
          data.subject?.toLowerCase().includes(query) ||
          data.reportTitle?.toLowerCase().includes(query)
        );
      });
      setFilteredSubmissions(filtered);
    }
  }, [searchQuery, submissions]);

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage contact form submissions and request samples
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <StatsCardsSkeleton count={5} columns={4} />
      ) : (
        <div className="fade-in">
          <LeadsStats stats={stats} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>
            {total} total submission{total !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, company, subject..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <LeadsFilters filters={filters} onFilterChange={setFilters} />
            </div>

            {isLoading ? (
              <TableSkeleton rows={8} columns={7} showHeader={true} showActions={true} />
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No submissions found matching your search' : 'No submissions yet'}
                </p>
              </div>
            ) : (
              <div className="fade-in">
                <LeadsList
                  submissions={filteredSubmissions}
                  onDelete={handleDelete}
                  onStatusUpdate={handleStatusUpdate}
                />

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
