'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { MediaMention, MediaMentionFormData } from '@/lib/types/media-mentions';
import { ImageUpload } from './image-upload';
import { ReportSelector } from './report-selector';

const mediaMentionFormSchema = z
  .object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    link: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    imageUrl: z.string().optional(),
    displayOrder: z.number().optional(),
    reportId: z.number().nullable().optional(),
    reportLinkText: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasReport = data.reportId !== undefined && data.reportId !== null;
    const hasLinkText = !!data.reportLinkText;

    if (hasReport && !hasLinkText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Report link text is required when a report is selected',
        path: ['reportLinkText'],
      });
    }
    if (hasLinkText && !hasReport) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a report to go with this link text',
        path: ['reportId'],
      });
    }
  });

interface MediaMentionFormProps {
  mediaMention?: MediaMention;
  onSubmit: (data: MediaMentionFormData) => Promise<void>;
  isSaving: boolean;
}

export function MediaMentionForm({ mediaMention, onSubmit, isSaving }: MediaMentionFormProps) {
  const form = useForm<MediaMentionFormData>({
    resolver: zodResolver(mediaMentionFormSchema),
    defaultValues: mediaMention
      ? {
          title: mediaMention.title,
          link: mediaMention.link || '',
          imageUrl: mediaMention.imageUrl || '',
          displayOrder: mediaMention.displayOrder ?? 0,
          reportId: mediaMention.reportId,
          reportLinkText: mediaMention.reportLinkText || '',
        }
      : {
          title: '',
          link: '',
          imageUrl: '',
          displayOrder: 0,
          reportId: undefined,
          reportLinkText: '',
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Media Mention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publication Logo</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSaving}
                      mediaMentionId={mediaMention?.id}
                    />
                  </FormControl>
                  <FormDescription>
                    {mediaMention?.id
                      ? 'Upload the publication logo (JPEG, PNG, WebP, or GIF, max 10MB)'
                      : 'Save this media mention first to upload a logo'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publication / Citation Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Forbes, Bloomberg, TechCrunch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/article" type="url" {...field} />
                  </FormControl>
                  <FormDescription>External URL of the citing article (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      value={field.value ?? 0}
                      onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormDescription>Lower numbers appear first (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reportId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Report</FormLabel>
                  <FormControl>
                    <ReportSelector
                      value={field.value}
                      initialLabel={mediaMention?.reportTitle}
                      onChange={report => {
                        field.onChange(report ? report.id : null);
                        form.setValue('reportLinkText', report ? report.title : '', {
                          shouldValidate: true,
                        });
                      }}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional — link this mention to one of your published reports
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reportLinkText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Link Text</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Global VFX Market" {...field} />
                  </FormControl>
                  <FormDescription>
                    Auto-filled from the report title when you select one above — edit for a custom
                    caption
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Media Mention'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
