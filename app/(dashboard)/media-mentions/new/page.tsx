'use client';

import { useRouter } from 'next/navigation';
import { MediaMentionForm } from '@/components/media-mentions/media-mention-form';
import { useMediaMention } from '@/hooks/use-media-mention';
import type { MediaMentionFormData } from '@/lib/types/media-mentions';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewMediaMentionPage() {
  const router = useRouter();
  const { isSaving, handleCreate } = useMediaMention();

  const handleSubmit = async (data: MediaMentionFormData) => {
    const mediaMention = await handleCreate(data);
    if (mediaMention) {
      router.push('/media-mentions');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/media-mentions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Media Mentions
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Media Mention</h1>
        <p className="text-muted-foreground">Add a new publication citation</p>
      </div>

      <MediaMentionForm onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
}
