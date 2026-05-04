'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { SectionEditor } from './section-editor';
import { REPORT_CATEGORIES, GEOGRAPHIES } from '@/lib/config/reports';
import type { ReportFormData, Report } from '@/lib/types/reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Eye } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// Validation schema
const reportFormSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  summary: z.string().min(50, 'Summary must be at least 50 characters'),
  category: z.string().min(1, 'Category is required'),
  geography: z.array(z.string()).min(1, 'Select at least one geography'),
  price: z.number().min(0, 'Price must be positive'),
  accessType: z.enum(['free', 'paid']),
  status: z.enum(['draft', 'published']),
  sections: z.object({
    executiveSummary: z.string().min(100, 'Executive summary is required (min 100 chars)'),
    marketOverview: z.string().min(100, 'Market overview is required (min 100 chars)'),
    marketSize: z.string().min(100, 'Market size is required (min 100 chars)'),
    competitive: z.string().min(100, 'Competitive analysis is required (min 100 chars)'),
    keyPlayers: z.string(),
    regional: z.string(),
    trends: z.string(),
    conclusion: z.string().min(50, 'Conclusion is required (min 50 chars)'),
  }),
  metadata: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
});

interface ReportFormProps {
  report?: Report;
  onSubmit: (data: ReportFormData) => Promise<void>;
  onPreview?: () => void;
  isSaving: boolean;
}

export function ReportForm({ report, onSubmit, onPreview, isSaving }: ReportFormProps) {
  const [keywordInput, setKeywordInput] = useState('');

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: report
      ? {
          title: report.title,
          summary: report.summary,
          category: report.category,
          geography: report.geography,
          price: report.price,
          accessType: report.accessType,
          status: report.status,
          sections: report.sections,
          metadata: report.metadata,
        }
      : {
          title: '',
          summary: '',
          category: REPORT_CATEGORIES[0],
          geography: [],
          price: 0,
          accessType: 'free',
          status: 'draft',
          sections: {
            executiveSummary: '',
            marketOverview: '',
            marketSize: '',
            competitive: '',
            keyPlayers: '',
            regional: '',
            trends: '',
            conclusion: '',
          },
          metadata: {
            metaTitle: '',
            metaDescription: '',
            keywords: [],
          },
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Global Healthcare Market Analysis 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief overview of the report (50-200 characters)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REPORT_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="geography"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geography</FormLabel>
                    <div className="space-y-2">
                      {GEOGRAPHIES.map(geo => (
                        <div key={geo} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(geo)}
                            onCheckedChange={checked => {
                              const updated = checked
                                ? [...field.value, geo]
                                : field.value.filter(g => g !== geo);
                              field.onChange(updated);
                            }}
                          />
                          <label className="text-sm">{geo}</label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Report Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Report Content</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="sections"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SectionEditor sections={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SEO Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="metadata.metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input placeholder="SEO-friendly title (optional)" {...field} />
                  </FormControl>
                  <FormDescription>Leave empty to use report title</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="SEO description (120-160 characters)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add keyword"
                      value={keywordInput}
                      onChange={e => setKeywordInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (keywordInput.trim()) {
                            field.onChange([...(field.value || []), keywordInput.trim()]);
                            setKeywordInput('');
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (keywordInput.trim()) {
                          field.onChange([...(field.value || []), keywordInput.trim()]);
                          setKeywordInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((keyword, i) => (
                      <Badge key={i} variant="secondary">
                        {keyword}
                        <button
                          type="button"
                          className="ml-2"
                          onClick={() => {
                            field.onChange(field.value?.filter((_, idx) => idx !== i));
                          }}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Status & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Publish Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Status</FormLabel>
                    <FormDescription>
                      {field.value === 'published'
                        ? 'Report is visible to users'
                        : 'Report is hidden (draft mode)'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 'published'}
                      onCheckedChange={checked => field.onChange(checked ? 'published' : 'draft')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Report'}
                </Button>
                {onPreview && (
                  <Button type="button" variant="outline" onClick={onPreview}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
