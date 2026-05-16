'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatisticsForm } from '@/components/statistics/statistics-form';
import { useStatistic } from '@/hooks/use-statistic';
import { useAuth } from '@/contexts/auth-context';

export default function CreateStatisticPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { saveStatistic, isSaving } = useStatistic();

  useEffect(() => {
    // Redirect non-authorized users
    if (user && user.role !== 'admin' && user.role !== 'editor') {
      router.push('/statistics');
    }
  }, [user, router]);

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Statistic Post</h1>
        <p className="text-muted-foreground mt-2">Write and publish a new statistic article</p>
      </div>

      <StatisticsForm
        onSubmit={async data => {
          await saveStatistic(null, data);
        }}
        isSaving={isSaving}
      />
    </div>
  );
}
