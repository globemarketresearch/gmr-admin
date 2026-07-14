'use client';

import { useRouter } from 'next/navigation';
import { MediaMentionForm } from '@/components/media-mentions/media-mention-form';
import { useMediaMention } from '@/hooks/use-media-mention';
import type { MediaMentionFormData } from '@/lib/types/media-mentions';
import { FormSkeleton } from '@/components/ui/skeletons/form-skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { use } from 'react';

export default function EditMediaMentionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { mediaMention, isLoading, isSaving, error, handleUpdate } = useMediaMention(id);

  const handleSubmit = async (data: MediaMentionFormData) => {
    const updated = await handleUpdate(id, data);
    if (updated) {
      router.push('/media-mentions');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-32 bg-accent rounded-md animate-pulse" />
        <div className="space-y-2">
          <div className="h-9 w-48 bg-accent rounded-md animate-pulse" />
          <div className="h-5 w-96 bg-accent rounded-md animate-pulse" />
        </div>
        <FormSkeleton sections={1} fieldsPerSection={4} showTabs={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-destructive">Error loading media mention: {error}</p>
        <Button variant="outline" onClick={() => router.push('/media-mentions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Media Mentions
        </Button>
      </div>
    );
  }

  if (!mediaMention) {
    return (
      <div className="text-center py-8 space-y-4">
        <p>Media mention not found</p>
        <Button variant="outline" onClick={() => router.push('/media-mentions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Media Mentions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/media-mentions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Media Mentions
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Media Mention</h1>
        <p className="text-muted-foreground">Update {mediaMention.title}&apos;s citation</p>
      </div>

      <MediaMentionForm mediaMention={mediaMention} onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
}
