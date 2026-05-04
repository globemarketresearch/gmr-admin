'use client';

import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';
import type { Report } from '@/lib/types/reports';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/format';
import { Edit, Eye, Trash2, ExternalLink, RotateCcw } from 'lucide-react';
import { config } from '@/lib/config';
import { useAuth } from '@/contexts/auth-context';

interface ReportListProps {
  reports: Report[];
  isLoading: boolean;
  viewMode?: 'active' | 'trash';
  onDelete?: (id: string) => void;
  onSoftDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onHardDelete?: (id: string) => void;
}

export function ReportList({
  reports,
  isLoading,
  viewMode = 'active',
  onDelete,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: ReportListProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return <TableSkeleton rows={5} columns={5} showHeader={true} showActions={true} />;
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No reports found</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map(report => (
            <TableRow key={report.id} className={viewMode === 'trash' ? 'opacity-70' : ''}>
              <TableCell className="text-xs text-muted-foreground font-mono">{report.id}</TableCell>
              <TableCell className="font-medium max-w-xs truncate">{report.title}</TableCell>
              <TableCell>{report.category}</TableCell>
              <TableCell>
                {report.status === 'draft' &&
                report.scheduled_publish_enabled &&
                report.publishDate &&
                new Date(report.publishDate) > new Date() ? (
                  <Badge variant="outline">Scheduled</Badge>
                ) : (
                  <Badge variant={report.status === 'published' ? 'default' : 'secondary'}>
                    {report.status}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatCurrency(report.price)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(report.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {viewMode === 'active' ? (
                    // Active view - show preview, edit, delete (soft)
                    <>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/reports/${report.id}/preview`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {config.preview.domain && (
                        <Button variant="ghost" size="sm" asChild title="Preview on public site">
                          <Link
                            href={`${config.preview.domain}/reports/${report.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/reports/${report.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      {(onDelete || onSoftDelete) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (onSoftDelete || onDelete)?.(report.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </>
                  ) : (
                    // Trash view - show restore and permanent delete
                    <>
                      {onRestore && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRestore(report.id)}
                          title="Restore report"
                        >
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {isAdmin && onHardDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onHardDelete(report.id)}
                          title="Delete permanently"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
