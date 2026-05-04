'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BlogForm } from '@/components/blogs/blog-form';
import { VersionHistory } from '@/components/shared/version-history';
import { WorkflowStatus } from '@/components/shared/workflow-status';
import { ScheduledPublishCard } from '@/components/shared/scheduled-publish-card';
import { BLOG_STATUS_CONFIG, WORKFLOW_TRANSITIONS } from '@/lib/config/blogs';
import { useBlog } from '@/hooks/use-blog';
import { useAuth } from '@/contexts/auth-context';
import { FormSkeleton } from '@/components/ui/skeletons/form-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    blog,
    isLoading,
    error,
    fetchBlog,
    saveBlog,
    isSaving,
    submitBlogForReview,
    publishBlogPost,
    unpublishBlogPost,
    scheduleBlogPublish,
    cancelBlogSchedule,
  } = useBlog();
  const blogId = params.id as string;

  useEffect(() => {
    if (blogId) {
      fetchBlog(blogId);
    }
  }, [blogId, fetchBlog]);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'editor') {
      router.push('/blog');
    }
  }, [user, router]);

  const handleStatusChange = async (newStatus: 'draft' | 'review' | 'published') => {
    if (newStatus === 'review') {
      await submitBlogForReview(blogId);
    } else if (newStatus === 'published') {
      await publishBlogPost(blogId);
    } else if (newStatus === 'draft') {
      await unpublishBlogPost(blogId);
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

  if (error || !blog) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-lg">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-semibold mb-2">Failed to load blog post</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => fetchBlog(blogId)}>Retry</Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
        <p className="text-muted-foreground mt-2">{blog.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BlogForm
            blog={blog}
            onSubmit={async data => {
              await saveBlog(blogId, data);
            }}
            onPreview={() => router.push(`/blog/${blogId}/preview`)}
            isSaving={isSaving}
            formId="blog-edit-form"
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Button type="submit" form="blog-edit-form" disabled={isSaving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Blog Post'}
              </Button>
            </CardContent>
          </Card>
          <WorkflowStatus
            currentStatus={blog.status}
            onStatusChange={handleStatusChange}
            isSaving={isSaving}
            isAdmin={isAdmin}
            statusConfig={BLOG_STATUS_CONFIG}
            workflowTransitions={WORKFLOW_TRANSITIONS}
          />
          <ScheduledPublishCard
            currentScheduledDate={blog.scheduledPublishEnabled ? blog.publishDate : undefined}
            currentStatus={blog.status}
            onSchedule={async date => {
              await scheduleBlogPublish(blogId, date);
            }}
            onCancelSchedule={async () => {
              await cancelBlogSchedule(blogId);
            }}
            isSaving={isSaving}
          />
          <VersionHistory versions={blog.versions || []} contentType="blog post" />
        </div>
      </div>
    </div>
  );
}
