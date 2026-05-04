'use client';

import { useRouter } from 'next/navigation';
import { AuthorForm } from '@/components/authors/author-form';
import { useAuthor } from '@/hooks/use-author';
import type { AuthorFormData } from '@/lib/types/reports';
import { FormSkeleton } from '@/components/ui/skeletons/form-skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { use } from 'react';

export default function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { author, isLoading, isSaving, error, handleUpdate } = useAuthor(id);

  const handleSubmit = async (data: AuthorFormData) => {
    const updatedAuthor = await handleUpdate(id, data);
    if (updatedAuthor) {
      router.push('/authors');
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
        <FormSkeleton sections={1} fieldsPerSection={5} showTabs={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-destructive">Error loading author: {error}</p>
        <Button variant="outline" onClick={() => router.push('/authors')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Authors
        </Button>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="text-center py-8 space-y-4">
        <p>Author not found</p>
        <Button variant="outline" onClick={() => router.push('/authors')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Authors
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/authors')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Authors
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Author</h1>
        <p className="text-muted-foreground">Update {author.name}&apos;s information</p>
      </div>

      <AuthorForm author={author} onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
}
