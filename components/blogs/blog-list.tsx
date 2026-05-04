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
import type { Blog, BlogStatus } from '@/lib/types/blogs';
import { formatDate } from '@/lib/utils/date';
import { Edit, Eye, Trash2, Clock, ExternalLink, RotateCcw } from 'lucide-react';
import { BLOG_STATUS_CONFIG } from '@/lib/config/blogs';
import { config } from '@/lib/config';

interface BlogListProps {
  blogs: Blog[];
  isLoading: boolean;
  viewMode?: 'active' | 'trash';
  onDelete?: (id: string) => void;
  onSoftDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onHardDelete?: (id: string) => void;
}

function getStatusBadgeVariant(
  status: BlogStatus
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

export function BlogList({
  blogs,
  isLoading,
  viewMode = 'active',
  onDelete,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: BlogListProps) {
  if (isLoading) {
    return <TableSkeleton rows={5} columns={6} showHeader={true} showActions={true} />;
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No blog posts found</p>
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
          {blogs.map(blog => (
            <TableRow key={blog.id} className={viewMode === 'trash' ? 'opacity-70' : ''}>
              <TableCell className="font-medium max-w-xs">
                <div className="truncate">{blog.title}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getAuthorInitials(blog.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate max-w-[100px]">{blog.author.name}</span>
                </div>
              </TableCell>
              <TableCell>{blog.categoryName || 'Uncategorized'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {blog.location || '-'}
              </TableCell>
              <TableCell>
                {blog.status === 'draft' &&
                blog.scheduledPublishEnabled &&
                blog.publishDate &&
                new Date(blog.publishDate) > new Date() ? (
                  <Badge variant="outline">Scheduled</Badge>
                ) : (
                  <Badge variant={getStatusBadgeVariant(blog.status)}>
                    {BLOG_STATUS_CONFIG[blog.status].label}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {blog.readingTime} min
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(blog.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {viewMode === 'active' && (
                    <>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/blog/${blog.id}/preview`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {config.preview.domain && (
                        <Button variant="ghost" size="sm" asChild title="Preview on public site">
                          <Link
                            href={`${config.preview.domain}/blog/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/blog/${blog.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      {(onSoftDelete || onDelete) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onSoftDelete ? onSoftDelete(blog.id) : onDelete?.(blog.id)
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
                          onClick={() => onRestore(blog.id)}
                          title="Restore"
                        >
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {onHardDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onHardDelete(blog.id)}
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
