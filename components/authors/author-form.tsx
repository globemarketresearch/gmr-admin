'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import type { ReportAuthor, AuthorFormData } from '@/lib/types/reports';
import { ImageUpload } from './image-upload';

const authorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().optional(),
  bio: z.string().optional(),
  imageUrl: z.string().optional(),
  linkedinUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

interface AuthorFormProps {
  author?: ReportAuthor;
  onSubmit: (data: AuthorFormData) => Promise<void>;
  isSaving: boolean;
}

export function AuthorForm({ author, onSubmit, isSaving }: AuthorFormProps) {
  const form = useForm<AuthorFormData>({
    resolver: zodResolver(authorFormSchema),
    defaultValues: author
      ? {
          name: author.name,
          role: author.role || '',
          bio: author.bio || '',
          imageUrl: author.imageUrl || '',
          linkedinUrl: author.linkedinUrl || '',
        }
      : {
          name: '',
          role: '',
          bio: '',
          imageUrl: '',
          linkedinUrl: '',
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Author Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSaving}
                      fallbackText={form.watch('name')?.substring(0, 2).toUpperCase() || 'AU'}
                      authorId={author?.id}
                      metadata={{
                        type: 'author-avatar',
                        authorName: form.watch('name') || 'unknown',
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {author?.id
                      ? 'Upload an author profile image (JPEG, PNG, WebP, or GIF, max 10MB)'
                      : 'Save the author first to upload an image'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dr. Michael Chen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lead Analyst, Principal Consultant" {...field} />
                  </FormControl>
                  <FormDescription>Job title or role in research team</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed background and experience..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Full biography (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Profile</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.linkedin.com/in/username"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>LinkedIn profile URL (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Author'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
