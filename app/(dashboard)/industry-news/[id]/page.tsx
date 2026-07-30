'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IndustryNewsForm } from '@/components/industry-news/industry-news-form';
import { WorkflowStatus } from '@/components/shared/workflow-status';
import { ScheduledPublishCard } from '@/components/shared/scheduled-publish-card';
import {
  INDUSTRY_NEWS_STATUS_CONFIG,
  INDUSTRY_NEWS_WORKFLOW_TRANSITIONS,
} from '@/lib/config/industry-news';
import { useIndustryNews } from '@/hooks/use-industry-news';
import { useAuth } from '@/contexts/auth-context';
import { FormSkeleton } from '@/components/ui/skeletons/form-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EditIndustryNewsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    industryNews,
    isLoading,
    error,
    fetchIndustryNewsItem,
    saveIndustryNews,
    isSaving,
    submitIndustryNewsForReview,
    publishIndustryNewsPost,
    unpublishIndustryNewsPost,
    scheduleIndustryNewsPublish,
    cancelIndustryNewsSchedule,
  } = useIndustryNews();
  const industryNewsId = params.id as string;

  useEffect(() => {
    if (industryNewsId) {
      fetchIndustryNewsItem(parseInt(industryNewsId, 10));
    }
  }, [industryNewsId, fetchIndustryNewsItem]);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'editor') {
      router.push('/industry-news');
    }
  }, [user, router]);

  const handleStatusChange = async (newStatus: 'draft' | 'review' | 'published') => {
    const id = parseInt(industryNewsId, 10);
    if (newStatus === 'review') {
      await submitIndustryNewsForReview(id);
    } else if (newStatus === 'published') {
      await publishIndustryNewsPost(id);
    } else if (newStatus === 'draft') {
      await unpublishIndustryNewsPost(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FormSkeleton sections={1} fieldsPerSection={6} showTabs={false} />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !industryNews) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-lg">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-semibold mb-2">Failed to load industry news</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => fetchIndustryNewsItem(parseInt(industryNewsId, 10))}>Retry</Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold">Edit Industry News</h1>
        <p className="text-muted-foreground mt-2">{industryNews.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IndustryNewsForm
            industryNews={industryNews}
            onSubmit={async data => {
              await saveIndustryNews(parseInt(industryNewsId, 10), data);
            }}
            onPreview={() => router.push(`/industry-news/${industryNewsId}/preview`)}
            isSaving={isSaving}
            formId="industry-news-edit-form"
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Button
                type="submit"
                form="industry-news-edit-form"
                disabled={isSaving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Industry News'}
              </Button>
            </CardContent>
          </Card>
          <WorkflowStatus
            currentStatus={industryNews.status}
            onStatusChange={handleStatusChange}
            isSaving={isSaving}
            isAdmin={isAdmin}
            statusConfig={INDUSTRY_NEWS_STATUS_CONFIG}
            workflowTransitions={INDUSTRY_NEWS_WORKFLOW_TRANSITIONS}
          />
          <ScheduledPublishCard
            currentScheduledDate={
              industryNews.scheduledPublishEnabled ? industryNews.publishDate : undefined
            }
            currentStatus={industryNews.status}
            onSchedule={async date => {
              await scheduleIndustryNewsPublish(industryNewsId, date);
            }}
            onCancelSchedule={async () => {
              await cancelIndustryNewsSchedule(industryNewsId);
            }}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
