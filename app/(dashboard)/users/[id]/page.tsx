'use client';

import { useRouter } from 'next/navigation';
import { UserFormTabs } from '@/components/users/user-form-tabs';
import { useUser } from '@/hooks/use-user';
import type { UpdateUserRequest } from '@/lib/types/api-types';
import { FormSkeleton } from '@/components/ui/skeletons/form-skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { use } from 'react';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { user, isLoading, isSaving, error, handleUpdate } = useUser(id);

  const handleSubmit = async (data: UpdateUserRequest) => {
    const updatedUser = await handleUpdate(id, data);
    if (updatedUser) {
      router.push('/users');
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
        <FormSkeleton sections={1} fieldsPerSection={4} showTabs={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-destructive">Error loading user: {error}</p>
        <Button variant="outline" onClick={() => router.push('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8 space-y-4">
        <p>User not found</p>
        <Button variant="outline" onClick={() => router.push('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground">Update {user.name}&apos;s information</p>
      </div>

      <UserFormTabs user={user} onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
}
