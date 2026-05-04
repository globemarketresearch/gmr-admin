'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useBlog } from '@/hooks/use-blog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Edit, Clock, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils/date';
import { BLOG_STATUS_CONFIG } from '@/lib/config/blogs';

function getAuthorInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function PreviewBlogPage() {
  const params = useParams();
  const { blog, isLoading, error, fetchBlog } = useBlog();
  const blogId = params.id as string;

  useEffect(() => {
    if (blogId) {
      fetchBlog(blogId);
    }
  }, [blogId, fetchBlog]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error loading blog post</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/blog/${blogId}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Post
          </Link>
        </Button>
      </div>

      {/* Blog Preview */}
      <Card>
        <CardHeader className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={
                blog.status === 'published'
                  ? 'default'
                  : blog.status === 'review'
                    ? 'outline'
                    : 'secondary'
              }
            >
              {BLOG_STATUS_CONFIG[blog.status].label}
            </Badge>
            <Badge variant="outline">{blog.categoryName}</Badge>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold">{blog.title}</h1>

          {/* Excerpt */}
          <p className="text-lg text-muted-foreground">{blog.excerpt}</p>

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {/* Author */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getAuthorInitials(blog.author.name)}</AvatarFallback>
              </Avatar>
              <span>{blog.author.name}</span>
            </div>

            <span>•</span>

            {/* Date */}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatRelativeTime(blog.publishDate)}</span>
            </div>

            <span>•</span>

            {/* Reading time */}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{blog.readingTime} min read</span>
            </div>

            {blog.status === 'published' && (
              <>
                <span>•</span>
                {/* View count */}
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{blog.viewCount} views</span>
                </div>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {blog.tags &&
              blog.tags.split(',').map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  {tag.trim()}
                </Badge>
              ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Content */}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Author bio */}
          {blog.author.bio && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{getAuthorInitials(blog.author.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{blog.author.name}</p>
                  <p className="text-sm text-muted-foreground">{blog.author.bio}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO Preview */}
      <Card>
        <CardContent className="space-y-4">
          {blog.metadata.keywords && blog.metadata.keywords.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {blog.metadata.keywords.map((keyword, i) => (
                  <Badge key={i} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
