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
import type { IndustryNews, IndustryNewsStatus } from '@/lib/types/industry-news';
import { formatDate } from '@/lib/utils/date';
import { Edit, Eye, Trash2, ExternalLink, RotateCcw } from 'lucide-react';
import { INDUSTRY_NEWS_STATUS_CONFIG } from '@/lib/config/industry-news';
import { config } from '@/lib/config';

interface IndustryNewsListProps {
  industryNewsItems: IndustryNews[];
  isLoading: boolean;
  viewMode?: 'active' | 'trash';
  onDelete?: (id: number) => void;
  onSoftDelete?: (id: number) => void;
  onRestore?: (id: number) => void;
  onHardDelete?: (id: number) => void;
}

function getStatusBadgeVariant(
  status: IndustryNewsStatus
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

export function IndustryNewsList({
  industryNewsItems,
  isLoading,
  viewMode = 'active',
  onDelete,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: IndustryNewsListProps) {
  if (isLoading) {
    return <TableSkeleton rows={5} columns={6} showHeader={true} showActions={true} />;
  }

  if (industryNewsItems.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No industry news found</p>
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
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {industryNewsItems.map(item => {
            return (
              <TableRow key={item.id} className={viewMode === 'trash' ? 'opacity-70' : ''}>
                <TableCell className="font-medium max-w-xs">
                  <div className="truncate">{item.title}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getAuthorInitials(item.author?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate max-w-[100px]">
                      {item.author?.name || 'Unknown Author'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{item.category?.name || 'Uncategorized'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.location || '-'}
                </TableCell>
                <TableCell>
                  {item.status === 'draft' &&
                  item.scheduledPublishEnabled &&
                  item.publishDate &&
                  new Date(item.publishDate) > new Date() ? (
                    <Badge variant="outline">Scheduled</Badge>
                  ) : (
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {INDUSTRY_NEWS_STATUS_CONFIG[item.status].label}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(item.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {viewMode === 'active' && (
                      <>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/industry-news/${item.id}/preview`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {config.preview.domain && (
                          <Button variant="ghost" size="sm" asChild title="Preview on public site">
                            <Link
                              href={`${config.preview.domain}/industry-news/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/industry-news/${item.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        {(onSoftDelete || onDelete) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onSoftDelete ? onSoftDelete(item.id) : onDelete?.(item.id)
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
                            onClick={() => onRestore(item.id)}
                            title="Restore"
                          >
                            <RotateCcw className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {onHardDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onHardDelete(item.id)}
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
