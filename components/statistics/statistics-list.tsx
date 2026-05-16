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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Statistic, StatisticStatus } from '@/lib/types/statistics';
import { formatDate } from '@/lib/utils/date';
import { Edit, Eye, Trash2, Clock, ExternalLink, RotateCcw } from 'lucide-react';
import { STATISTIC_STATUS_CONFIG } from '@/lib/config/statistics';
import { config } from '@/lib/config';

interface StatisticsListProps {
  statistics: Statistic[];
  isLoading: boolean;
  viewMode?: 'active' | 'trash';
  onDelete?: (id: string) => void;
  onSoftDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onHardDelete?: (id: string) => void;
}

function getStatusBadgeVariant(
  status: StatisticStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'published':
      return 'default';
    case 'review':
      return 'outline';
    case 'draft':
    default:
      return 'secondary';
  }
}

function getAuthorInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function StatisticsList({
  statistics,
  isLoading,
  viewMode = 'active',
  onDelete,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: StatisticsListProps) {
  if (isLoading) {
    return <TableSkeleton rows={5} columns={6} showHeader={true} showActions={true} />;
  }

  if (statistics.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No statistic posts found</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Read Time</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statistics.map(statistic => (
            <TableRow
              key={statistic.id}
              className={viewMode === 'trash' ? 'opacity-70' : ''}
            >
              <TableCell className="font-medium max-w-xs">
                <div className="truncate">{statistic.title}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getAuthorInitials(statistic.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate max-w-[100px]">{statistic.author.name}</span>
                </div>
              </TableCell>
              <TableCell>{statistic.categoryName || 'Uncategorized'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {statistic.location || '-'}
              </TableCell>
              <TableCell>
                {statistic.status === 'draft' &&
                statistic.scheduledPublishEnabled &&
                statistic.publishDate &&
                new Date(statistic.publishDate) > new Date() ? (
                  <Badge variant="outline">Scheduled</Badge>
                ) : (
                  <Badge variant={getStatusBadgeVariant(statistic.status)}>
                    {STATISTIC_STATUS_CONFIG[statistic.status].label}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {statistic.readingTime} min
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(statistic.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {viewMode === 'active' && (
                    <>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/statistics/${statistic.id}/preview`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {config.preview.domain && (
                        <Button variant="ghost" size="sm" asChild title="Preview on public site">
                          <Link
                            href={`${config.preview.domain}/statistics/${statistic.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/statistics/${statistic.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      {(onSoftDelete || onDelete) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onSoftDelete
                              ? onSoftDelete(statistic.id)
                              : onDelete?.(statistic.id)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </>
                  )}
                  {viewMode === 'trash' && (
                    <>
                      {onRestore && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRestore(statistic.id)}
                          title="Restore"
                        >
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {onHardDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onHardDelete(statistic.id)}
                          title="Permanent Delete"
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
