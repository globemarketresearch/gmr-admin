'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PressReleaseForm } from '@/components/press-releases/press-release-form';
import { usePressRelease } from '@/hooks/use-press-release';
import { useAuth } from '@/contexts/auth-context';

export default function CreatePressReleasePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { savePressRelease, isSaving } = usePressRelease();

  useEffect(() => {
    // Redirect non-authorized users
    if (user && user.role !== 'admin' && user.role !== 'editor') {
      router.push('/press-releases');
    }
  }, [user, router]);

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Press Release</h1>
        <p className="text-muted-foreground mt-2">Write and publish a new press release</p>
      </div>

      <PressReleaseForm
        onSubmit={async data => {
          await savePressRelease(null, data);
        }}
        isSaving={isSaving}
      />
    </div>
  );
}
