'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IndustryNewsForm } from '@/components/industry-news/industry-news-form';
import { useIndustryNews } from '@/hooks/use-industry-news';
import { useAuth } from '@/contexts/auth-context';

export default function CreateIndustryNewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { saveIndustryNews, isSaving } = useIndustryNews();

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'editor') {
      router.push('/industry-news');
    }
  }, [user, router]);

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Industry News</h1>
        <p className="text-muted-foreground mt-2">Write and publish a new industry news article</p>
      </div>

      <IndustryNewsForm
        onSubmit={async data => {
          await saveIndustryNews(null, data);
        }}
        isSaving={isSaving}
      />
    </div>
  );
}
