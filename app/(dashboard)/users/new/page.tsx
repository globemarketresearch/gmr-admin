'use client';

import { useRouter } from 'next/navigation';
import { UserFormTabs } from '@/components/users/user-form-tabs';
import { useUser } from '@/hooks/use-user';
import type { CreateUserRequest } from '@/lib/types/api-types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewUserPage() {
  const router = useRouter();
  const { isSaving, handleCreate } = useUser();

  const handleSubmit = async (data: CreateUserRequest) => {
    const user = await handleCreate(data);
    if (user) {
      router.push('/users');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
        <p className="text-muted-foreground">Create a new user account with role and permissions</p>
      </div>

      <UserFormTabs onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
}
