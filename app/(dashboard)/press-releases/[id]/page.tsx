'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PressReleaseForm } from '@/components/press-releases/press-release-form';
import { WorkflowStatus } from '@/components/shared/workflow-status';
import { ScheduledPublishCard } from '@/components/shared/scheduled-publish-card';
import {
  PRESS_RELEASE_STATUS_CONFIG,
  PRESS_RELEASE_WORKFLOW_TRANSITIONS,
} from '@/lib/config/press-releases';
import { usePressRelease } from '@/hooks/use-press-release';
import { useAuth } from '@/contexts/auth-context';
import { FormSkeleton } from '@/components/ui/skeletons/form-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EditPressReleasePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    pressRelease,
    isLoading,
    error,
    fetchPressRelease,
    savePressRelease,
    isSaving,
    submitPressReleaseForReview,
    publishPressReleasePost,
    unpublishPressReleasePost,
    schedulePressReleasePublish,
    cancelPressReleaseSchedule,
  } = usePressRelease();
  const pressReleaseId = params.id as string;

  useEffect(() => {
    if (pressReleaseId) {
      fetchPressRelease(parseInt(pressReleaseId, 10));
    }
  }, [pressReleaseId, fetchPressRelease]);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'editor') {
      router.push('/press-releases');
    }
  }, [user, router]);

  const handleStatusChange = async (newStatus: 'draft' | 'review' | 'published') => {
    const id = parseInt(pressReleaseId, 10);
    if (newStatus === 'review') {
      await submitPressReleaseForReview(id);
    } else if (newStatus === 'published') {
      await publishPressReleasePost(id);
    } else if (newStatus === 'draft') {
      await unpublishPressReleasePost(id);
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

  if (error || !pressRelease) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-lg">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-semibold mb-2">Failed to load press release</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => fetchPressRelease(parseInt(pressReleaseId, 10))}>Retry</Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold">Edit Press Release</h1>
        <p className="text-muted-foreground mt-2">{pressRelease.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PressReleaseForm
            pressRelease={pressRelease}
            onSubmit={async data => {
              await savePressRelease(parseInt(pressReleaseId, 10), data);
            }}
            onPreview={() => router.push(`/press-releases/${pressReleaseId}/preview`)}
            isSaving={isSaving}
            formId="press-release-edit-form"
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Button
                type="submit"
                form="press-release-edit-form"
                disabled={isSaving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Press Release'}
              </Button>
            </CardContent>
          </Card>
          <WorkflowStatus
            currentStatus={pressRelease.status}
            onStatusChange={handleStatusChange}
            isSaving={isSaving}
            isAdmin={isAdmin}
            statusConfig={PRESS_RELEASE_STATUS_CONFIG}
            workflowTransitions={PRESS_RELEASE_WORKFLOW_TRANSITIONS}
          />
          <ScheduledPublishCard
            currentScheduledDate={
              pressRelease.scheduledPublishEnabled ? pressRelease.publishDate : undefined
            }
            currentStatus={pressRelease.status}
            onSchedule={async date => {
              await schedulePressReleasePublish(pressReleaseId, date);
            }}
            onCancelSchedule={async () => {
              await cancelPressReleaseSchedule(pressReleaseId);
            }}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
