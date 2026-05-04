'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { TiptapEditor } from '@/components/reports/tiptap-editor';
import { AuthorSelector } from '@/components/blogs/author-selector';
import { fetchCategories, type Category } from '@/lib/api/categories';
import {
  PRESS_RELEASE_TITLE_MAX_LENGTH,
  PRESS_RELEASE_EXCERPT_MAX_LENGTH,
} from '@/lib/config/press-releases';
import type {
  PressReleaseFormData,
  PressRelease,
  InternalLinkEntry,
} from '@/lib/types/press-releases';
import { pressReleaseFormSchema } from '@/lib/validation/press-release-schema';
import { Save, Eye, Wand2, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CharacterCounter } from '@/components/seo/character-counter';
import { SEO_LIMITS } from '@/lib/config/seo';
import { measureTextWidth, SERP_FONTS } from '@/lib/utils/text-measurement';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import { generateSlug } from '@/lib/utils/slug';
import { InternalLinkPanel } from '@/components/editor/internal-link-panel';
import type { TiptapEditorLike } from '@/hooks/use-internal-link-keywords';

interface PressReleaseFormProps {
  pressRelease?: PressRelease;
  onSubmit: (data: PressReleaseFormData) => Promise<void>;
  onPreview?: () => void;
  isSaving: boolean;
  formId?: string;
}

export function PressReleaseForm({
  pressRelease,
  onSubmit,
  onPreview,
  isSaving,
  formId,
}: PressReleaseFormProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [contentEditor, setContentEditor] = useState<TiptapEditorLike | null>(null);
  const [internalLinks, setInternalLinks] = useState<InternalLinkEntry[]>(
    pressRelease?.internalLinks ?? []
  );

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await fetchCategories({ limit: 100 });
      setCategories(response.categories.filter(cat => cat.isActive));
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const form = useForm<PressReleaseFormData>({
    resolver: zodResolver(pressReleaseFormSchema),
    defaultValues: pressRelease
      ? {
          title: pressRelease.title,
          slug: pressRelease.slug,
          excerpt: pressRelease.excerpt,
          content: pressRelease.content,
          categoryId: pressRelease.categoryId || 0,
          tags: pressRelease.tags || '',
          authorId: pressRelease.authorId,
          status: pressRelease.status,
          publishDate: pressRelease.publishDate,
          location: pressRelease.location || '',
          reportUrl: pressRelease.reportUrl || '',
          metadata: {
            metaTitle: pressRelease.metadata?.metaTitle || '',
            metaDescription: pressRelease.metadata?.metaDescription || '',
            keywords: pressRelease.metadata?.keywords || [],
          },
        }
      : {
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          categoryId: 0,
          tags: '',
          authorId: 0,
          status: 'draft',
          publishDate: new Date().toISOString(),
          location: 'Austin, TX, USA',
          reportUrl: '',
          metadata: {
            metaTitle: '',
            metaDescription: '',
            keywords: [],
          },
        },
  });

  const fillSampleData = () => {
    const sampleData: Partial<PressReleaseFormData> = {
      title: 'Leading Healthcare Technology Company Launches AI-Powered Platform',
      slug: 'healthcare-company-launches-ai-powered-platform',
      excerpt:
        'Global healthcare innovator announces groundbreaking artificial intelligence platform designed to streamline clinical workflows and improve patient outcomes. The new solution integrates advanced machine learning capabilities with existing healthcare systems.',
      content:
        '<p><strong>San Francisco, CA</strong> - A pioneering healthcare technology company today announced the launch of its revolutionary AI-powered clinical decision support platform, marking a significant milestone in the digital transformation of healthcare delivery.</p><h2>Revolutionary Technology</h2><p>The new platform leverages cutting-edge artificial intelligence and machine learning algorithms to analyze patient data in real-time, providing healthcare professionals with actionable insights and evidence-based recommendations. Early adopters have reported a 40% reduction in diagnostic errors and a 35% improvement in treatment efficacy.</p><h2>Key Features</h2><ul><li>Real-time clinical decision support powered by advanced AI algorithms</li><li>Seamless integration with existing Electronic Health Record (EHR) systems</li><li>Predictive analytics for early disease detection and prevention</li><li>Natural language processing for automated documentation</li><li>HIPAA-compliant security and data privacy measures</li></ul><h2>Market Impact</h2><p>This launch positions the company at the forefront of the rapidly growing healthcare AI market, which is projected to reach $45.2 billion by 2026. Industry analysts predict that AI-powered clinical tools will become standard practice in healthcare institutions worldwide within the next five years.</p><h2>About the Company</h2><p>Founded in 2015, the company has established itself as a leader in healthcare innovation, serving over 500 healthcare institutions globally. The organization is committed to leveraging technology to improve patient care, reduce costs, and enhance clinical outcomes.</p><p>For more information, visit our website or contact our media relations team.</p>',
      categoryId: categories.length > 0 ? categories[0].id : 0,
      tags: 'AI in healthcare, clinical decision support, healthcare technology, digital health',
      location: 'San Francisco, CA',
      reportUrl: 'https://example.com/reports/healthcare-ai-platform',
      metadata: {
        metaTitle: 'Healthcare Tech Company Launches AI Clinical Platform | Press Release',
        metaDescription:
          'Major healthcare technology company announces revolutionary AI-powered clinical decision support platform to transform patient care and improve outcomes.',
        keywords: [
          'healthcare AI',
          'clinical decision support',
          'digital health',
          'medical technology',
          'healthcare innovation',
        ],
      },
    };

    // Fill the form with sample data
    Object.entries(sampleData).forEach(([key, value]) => {
      form.setValue(key as keyof PressReleaseFormData, value);
    });
  };

  const handleFormSubmit = async (data: PressReleaseFormData) => {
    await onSubmit({ ...data, internalLinks });
  };

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Basic Information</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={fillSampleData}>
                <Wand2 className="h-4 w-4 mr-2" />
                Fill Sample Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Press Release Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a compelling title for your press release..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/{PRESS_RELEASE_TITLE_MAX_LENGTH} characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="url-friendly-slug-for-press-release" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const title = form.getValues('title');
                        if (title) {
                          const slug = generateSlug(title);
                          form.setValue('slug', slug);
                          toast.success('Slug generated from title');
                        }
                      }}
                      disabled={!form.watch('title')}
                      title="Generate from title"
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (field.value) {
                          navigator.clipboard.writeText(
                            `${config.preview.domain}/press-release/${field.value}`
                          );
                          toast.success('URL copied to clipboard');
                        }
                      }}
                      disabled={!field.value}
                      title="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    URL-friendly identifier (lowercase, hyphens only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a brief summary that appears in press release listings..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/{PRESS_RELEASE_EXCERPT_MAX_LENGTH} characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Category
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={value => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                    disabled={isLoadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingCategories ? 'Loading categories...' : 'Select category'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select the press release category</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter tags (comma-separated, e.g., AI in healthcare, digital health)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter comma-separated tags to help readers discover your content
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <AuthorSelector
                      value={String(field.value)}
                      onChange={value => field.onChange(Number(value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location (e.g., New York, USA)" {...field} />
                  </FormControl>
                  <FormDescription>Optional location field for the press release</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reportUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Report URL
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/reports/report-slug" {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to the related report. The &quot;Read Report&quot; button on the press
                    release page will navigate here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Press Release Content */}
        <Card>
          <CardHeader>
            <CardTitle>Press Release Content</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TiptapEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Start writing your press release..."
                      onEditorReady={ed => setContentEditor(ed as TiptapEditorLike | null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <InternalLinkPanel
          editor={contentEditor}
          onContentChange={html => form.setValue('content', html, { shouldDirty: true })}
          onLinksChange={setInternalLinks}
          initialLinks={pressRelease?.internalLinks ?? []}
        />

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
                  <div className="flex justify-between items-center">
                    <FormLabel>Meta Title</FormLabel>
                    <CharacterCounter
                      current={field.value?.length || 0}
                      max={SEO_LIMITS.metaTitle.max}
                      optimal={SEO_LIMITS.metaTitle.optimal}
                      pixelWidth={{
                        current: measureTextWidth(field.value || '', SERP_FONTS.title),
                        max: SEO_LIMITS.metaTitle.pixelWidth.max,
                      }}
                      variant="inline"
                    />
                  </div>
                  <FormControl>
                    <Input placeholder="SEO-friendly title (optional)" {...field} />
                  </FormControl>
                  <FormDescription>Leave empty to use press release title</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.metaDescription"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Meta Description</FormLabel>
                    <CharacterCounter
                      current={field.value?.length || 0}
                      max={SEO_LIMITS.metaDescription.max}
                      optimal={SEO_LIMITS.metaDescription.optimal}
                      pixelWidth={{
                        current: measureTextWidth(field.value || '', SERP_FONTS.description),
                        max: SEO_LIMITS.metaDescription.pixelWidth.max,
                      }}
                      variant="inline"
                    />
                  </div>
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

        {/* Actions */}
        {(onPreview || !formId) && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div>
                  {onPreview && (
                    <Button type="button" variant="outline" onClick={onPreview}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  )}
                </div>
                {!formId && (
                  <Button type="submit" disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Press Release'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}
