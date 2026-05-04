'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BlogForm } from '@/components/blogs/blog-form';
import { useBlog } from '@/hooks/use-blog';
import { useAuth } from '@/contexts/auth-context';

export default function CreateBlogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { saveBlog, isSaving } = useBlog();

  useEffect(() => {
    // Redirect non-authorized users
    if (user && user.role !== 'admin' && user.role !== 'editor') {
      router.push('/blog');
    }
  }, [user, router]);

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Blog Post</h1>
        <p className="text-muted-foreground mt-2">Write and publish a new blog article</p>
      </div>

      <BlogForm
        onSubmit={async data => {
          await saveBlog(null, data);
        }}
        isSaving={isSaving}
      />
    </div>
  );
}
