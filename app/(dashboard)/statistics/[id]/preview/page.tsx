'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useStatistic } from '@/hooks/use-statistic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Edit, Clock, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils/date';
import { STATISTIC_STATUS_CONFIG } from '@/lib/config/statistics';

function getAuthorInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function PreviewStatisticPage() {
  const params = useParams();
  const { statistic, isLoading, error, fetchStatistic } = useStatistic();
  const statisticId = params.id as string;

  useEffect(() => {
    if (statisticId) {
      fetchStatistic(statisticId);
    }
  }, [statisticId, fetchStatistic]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !statistic) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error loading statistic post</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/statistics">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Statistics
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/statistics/${statisticId}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Post
          </Link>
        </Button>
      </div>

      {/* Statistic Preview */}
      <Card>
        <CardHeader className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={
                statistic.status === 'published'
                  ? 'default'
                  : statistic.status === 'review'
                    ? 'outline'
                    : 'secondary'
              }
            >
              {STATISTIC_STATUS_CONFIG[statistic.status].label}
            </Badge>
            <Badge variant="outline">{statistic.categoryName}</Badge>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold">{statistic.title}</h1>

          {/* Excerpt */}
          <p className="text-lg text-muted-foreground">{statistic.excerpt}</p>

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {/* Author */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getAuthorInitials(statistic.author.name)}</AvatarFallback>
              </Avatar>
              <span>{statistic.author.name}</span>
            </div>

            <span>•</span>

            {/* Date */}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatRelativeTime(statistic.publishDate)}</span>
            </div>

            <span>•</span>

            {/* Reading time */}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{statistic.readingTime} min read</span>
            </div>

            {statistic.status === 'published' && (
              <>
                <span>•</span>
                {/* View count */}
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{statistic.viewCount} views</span>
                </div>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {statistic.tags &&
              statistic.tags.split(',').map((tag, idx) => (
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
            dangerouslySetInnerHTML={{ __html: statistic.content }}
          />

          {/* Author bio */}
          {statistic.author.bio && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{getAuthorInitials(statistic.author.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{statistic.author.name}</p>
                  <p className="text-sm text-muted-foreground">{statistic.author.bio}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO Preview */}
      <Card>
        <CardContent className="space-y-4">
          {statistic.metadata.keywords && statistic.metadata.keywords.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {statistic.metadata.keywords.map((keyword, i) => (
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
