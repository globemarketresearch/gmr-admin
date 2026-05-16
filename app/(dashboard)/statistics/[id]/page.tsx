'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StatisticsForm } from '@/components/statistics/statistics-form';
import { VersionHistory } from '@/components/shared/version-history';
import { WorkflowStatus } from '@/components/shared/workflow-status';
import { ScheduledPublishCard } from '@/components/shared/scheduled-publish-card';
import { STATISTIC_STATUS_CONFIG, WORKFLOW_TRANSITIONS } from '@/lib/config/statistics';
import { useStatistic } from '@/hooks/use-statistic';
import { useAuth } from '@/contexts/auth-context';
import { FormSkeleton } from '@/components/ui/skeletons/form-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EditStatisticPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    statistic,
    isLoading,
    error,
    fetchStatistic,
    saveStatistic,
    isSaving,
    submitStatisticForReview,
    publishStatisticPost,
    unpublishStatisticPost,
    scheduleStatisticPublish,
    cancelStatisticSchedule,
  } = useStatistic();
  const statisticId = params.id as string;

  useEffect(() => {
    if (statisticId) {
      fetchStatistic(statisticId);
    }
  }, [statisticId, fetchStatistic]);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'editor') {
      router.push('/statistics');
    }
  }, [user, router]);

  const handleStatusChange = async (newStatus: 'draft' | 'review' | 'published') => {
    if (newStatus === 'review') {
      await submitStatisticForReview(statisticId);
    } else if (newStatus === 'published') {
      await publishStatisticPost(statisticId);
    } else if (newStatus === 'draft') {
      await unpublishStatisticPost(statisticId);
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

  if (error || !statistic) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-lg">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-semibold mb-2">Failed to load statistic post</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => fetchStatistic(statisticId)}>Retry</Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold">Edit Statistic Post</h1>
        <p className="text-muted-foreground mt-2">{statistic.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StatisticsForm
            statistic={statistic}
            onSubmit={async data => {
              await saveStatistic(statisticId, data);
            }}
            onPreview={() => router.push(`/statistics/${statisticId}/preview`)}
            isSaving={isSaving}
            formId="statistic-edit-form"
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Button
                type="submit"
                form="statistic-edit-form"
                disabled={isSaving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Statistic Post'}
              </Button>
            </CardContent>
          </Card>
          <WorkflowStatus
            currentStatus={statistic.status}
            onStatusChange={handleStatusChange}
            isSaving={isSaving}
            isAdmin={isAdmin}
            statusConfig={STATISTIC_STATUS_CONFIG}
            workflowTransitions={WORKFLOW_TRANSITIONS}
          />
          <ScheduledPublishCard
            currentScheduledDate={
              statistic.scheduledPublishEnabled ? statistic.publishDate : undefined
            }
            currentStatus={statistic.status}
            onSchedule={async date => {
              await scheduleStatisticPublish(statisticId, date);
            }}
            onCancelSchedule={async () => {
              await cancelStatisticSchedule(statisticId);
            }}
            isSaving={isSaving}
          />
          <VersionHistory versions={statistic.versions || []} contentType="statistic post" />
        </div>
      </div>
    </div>
  );
}
