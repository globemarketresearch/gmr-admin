'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useIndustryNews } from '@/hooks/use-industry-news';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Edit, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils/date';
import { INDUSTRY_NEWS_STATUS_CONFIG } from '@/lib/config/industry-news';

function getAuthorInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function PreviewIndustryNewsPage() {
  const params = useParams();
  const { industryNews, isLoading, error, fetchIndustryNewsItem } = useIndustryNews();
  const industryNewsId = parseInt(params.id as string, 10);

  useEffect(() => {
    if (industryNewsId && !isNaN(industryNewsId)) {
      fetchIndustryNewsItem(industryNewsId);
    }
  }, [industryNewsId, fetchIndustryNewsItem]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !industryNews) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error loading industry news</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/industry-news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Industry News
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/industry-news/${industryNewsId}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Industry News
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                industryNews.status === 'published'
                  ? 'default'
                  : industryNews.status === 'review'
                    ? 'outline'
                    : 'secondary'
              }
            >
              {INDUSTRY_NEWS_STATUS_CONFIG[industryNews.status].label}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold">{industryNews.title}</h1>

          <p className="text-lg text-muted-foreground">{industryNews.excerpt}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {industryNews.author && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getAuthorInitials(industryNews.author.name)}</AvatarFallback>
                </Avatar>
                <span>{industryNews.author.name}</span>
              </div>
            )}

            {industryNews.author && <span>•</span>}

            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatRelativeTime(industryNews.publishDate)}</span>
            </div>

            {industryNews.location && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{industryNews.location}</span>
                </div>
              </>
            )}
          </div>

          {industryNews.tags && (
            <div className="flex flex-wrap gap-2">
              {industryNews.tags.split(',').map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: industryNews.content }}
          />

          {industryNews.author?.bio && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{getAuthorInitials(industryNews.author.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{industryNews.author.name}</p>
                  <p className="text-sm text-muted-foreground">{industryNews.author.bio}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          {industryNews.metadata.keywords && industryNews.metadata.keywords.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {industryNews.metadata.keywords.map((keyword, i) => (
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
