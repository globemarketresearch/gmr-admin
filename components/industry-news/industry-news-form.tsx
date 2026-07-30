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
import { AuthorSelector } from '@/components/statistics/author-selector';
import { IndustryNewsImagesManager } from './industry-news-images-manager';
import { fetchCategories, type Category } from '@/lib/api/categories';
import { fetchAuthors } from '@/lib/api/authors';
import {
  INDUSTRY_NEWS_TITLE_MAX_LENGTH,
  INDUSTRY_NEWS_EXCERPT_MAX_LENGTH,
  INDUSTRY_NEWS_DEFAULT_AUTHOR_NAME,
} from '@/lib/config/industry-news';
import type {
  IndustryNewsFormData,
  IndustryNews,
  InternalLinkEntry,
} from '@/lib/types/industry-news';
import { industryNewsFormSchema } from '@/lib/validation/industry-news-schema';
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

interface IndustryNewsFormProps {
  industryNews?: IndustryNews;
  onSubmit: (data: IndustryNewsFormData) => Promise<void>;
  onPreview?: () => void;
  isSaving: boolean;
  formId?: string;
}

export function IndustryNewsForm({
  industryNews,
  onSubmit,
  onPreview,
  isSaving,
  formId,
}: IndustryNewsFormProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [contentEditor, setContentEditor] = useState<TiptapEditorLike | null>(null);
  const [internalLinks, setInternalLinks] = useState<InternalLinkEntry[]>(
    industryNews?.internalLinks ?? []
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

  const form = useForm<IndustryNewsFormData>({
    resolver: zodResolver(industryNewsFormSchema),
    defaultValues: industryNews
      ? {
          title: industryNews.title,
          slug: industryNews.slug,
          excerpt: industryNews.excerpt,
          content: industryNews.content,
          categoryId: industryNews.categoryId || 0,
          tags: industryNews.tags || '',
          authorId: industryNews.authorId,
          status: industryNews.status,
          publishDate: industryNews.publishDate,
          location: industryNews.location || '',
          metadata: {
            metaTitle: industryNews.metadata?.metaTitle || '',
            metaDescription: industryNews.metadata?.metaDescription || '',
            keywords: industryNews.metadata?.keywords || [],
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
          location: '',
          metadata: {
            metaTitle: '',
            metaDescription: '',
            keywords: [],
          },
        },
  });

  // Pre-select the "Globe Market Research" default author on create only.
  useEffect(() => {
    if (industryNews) return; // editing an existing article — don't override authorId
    if (form.getValues('authorId')) return; // already set (e.g. by fillSampleData)

    (async () => {
      try {
        const response = await fetchAuthors();
        const defaultAuthor = response.data.find(a => a.name === INDUSTRY_NEWS_DEFAULT_AUTHOR_NAME);
        if (defaultAuthor && !form.getValues('authorId')) {
          form.setValue('authorId', defaultAuthor.id);
        }
      } catch (error) {
        console.error('Failed to load default author:', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industryNews]);

  const fillSampleData = () => {
    const sampleData: Partial<IndustryNewsFormData> = {
      title: 'Healthcare AI Investment Reaches Record High Across Global Markets',
      slug: 'healthcare-ai-investment-reaches-record-high',
      excerpt:
        'Industry analysts report unprecedented capital inflows into healthcare artificial intelligence startups, signaling a fundamental shift in how care delivery is financed and modernized worldwide.',
      content:
        '<p><strong>Global Markets</strong> - Investment in healthcare artificial intelligence has reached a record high this quarter, according to newly released industry data, as venture capital and strategic investors continue to pour funding into companies building clinical decision support, diagnostics, and administrative automation tools.</p><h2>Key Trends</h2><ul><li>Diagnostic AI startups captured the largest share of new funding</li><li>Strategic investment from incumbent health systems is accelerating</li><li>Regulatory clarity in major markets is de-risking later-stage deals</li></ul><h2>Market Outlook</h2><p>Analysts expect the trend to continue as reimbursement pathways mature and more AI-enabled tools receive regulatory clearance across major markets.</p>',
      categoryId: categories.length > 0 ? categories[0].id : 0,
      tags: 'healthcare AI, market trends, digital health, investment',
      location: 'Global',
      metadata: {
        metaTitle: 'Healthcare AI Investment Reaches Record High | Industry News',
        metaDescription:
          'Industry analysts report record capital inflows into healthcare AI, signaling a shift in how care delivery is financed and modernized.',
        keywords: ['healthcare AI', 'digital health investment', 'market trends', 'health tech'],
      },
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      form.setValue(key as keyof IndustryNewsFormData, value);
    });
  };

  const handleFormSubmit = async (data: IndustryNewsFormData) => {
    await onSubmit({ ...data, internalLinks });
  };

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
                  <FormLabel>Industry News Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a compelling title for this article..." {...field} />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/{INDUSTRY_NEWS_TITLE_MAX_LENGTH} characters
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
                      <Input placeholder="url-friendly-slug-for-article" {...field} />
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
                            `${config.preview.domain}/industry-news/${field.value}`
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
                      placeholder="Write a brief summary that appears in industry news listings..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/{INDUSTRY_NEWS_EXCERPT_MAX_LENGTH} characters
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
                  <FormDescription>Select the industry news category</FormDescription>
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
                  <FormDescription>
                    Defaults to &quot;{INDUSTRY_NEWS_DEFAULT_AUTHOR_NAME}&quot; — change to credit a
                    specific author if needed.
                  </FormDescription>
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
                  <FormDescription>Optional location field for the article</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry News Content</CardTitle>
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
                      placeholder="Start writing the article..."
                      onEditorReady={ed => setContentEditor(ed as TiptapEditorLike | null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <IndustryNewsImagesManager industryNewsId={industryNews?.id} />
          </CardContent>
        </Card>

        <InternalLinkPanel
          editor={contentEditor}
          onContentChange={html => form.setValue('content', html, { shouldDirty: true })}
          onLinksChange={setInternalLinks}
          initialLinks={industryNews?.internalLinks ?? []}
        />

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
                  <FormDescription>Leave empty to use the article title</FormDescription>
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
                    {isSaving ? 'Saving...' : 'Save Industry News'}
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
