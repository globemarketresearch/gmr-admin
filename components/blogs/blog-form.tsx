'use client';

import { useState, useEffect } from 'react';
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
import { AuthorSelector } from './author-selector';
import {
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  EXCERPT_MIN_LENGTH,
  EXCERPT_MAX_LENGTH,
  CONTENT_MIN_LENGTH,
} from '@/lib/config/blogs';
import type { BlogFormData, Blog, InternalLinkEntry } from '@/lib/types/blogs';
import { Save, Eye, Wand2, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchCategories, type Category } from '@/lib/api/categories';
import { CharacterCounter } from '@/components/seo/character-counter';
import { SEO_LIMITS } from '@/lib/config/seo';
import { measureTextWidth, SERP_FONTS } from '@/lib/utils/text-measurement';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import { generateSlug } from '@/lib/utils/slug';
import { InternalLinkPanel } from '@/components/editor/internal-link-panel';
import type { TiptapEditorLike } from '@/hooks/use-internal-link-keywords';

// Validation schema
const blogFormSchema = z.object({
  title: z
    .string()
    .min(TITLE_MIN_LENGTH, `Title must be at least ${TITLE_MIN_LENGTH} characters`)
    .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase letters, numbers, and hyphens only'
    ),
  excerpt: z
    .string()
    .min(EXCERPT_MIN_LENGTH, `Excerpt must be at least ${EXCERPT_MIN_LENGTH} characters`)
    .max(EXCERPT_MAX_LENGTH, `Excerpt must be at most ${EXCERPT_MAX_LENGTH} characters`),
  content: z
    .string()
    .min(CONTENT_MIN_LENGTH, `Content must be at least ${CONTENT_MIN_LENGTH} characters`),
  categoryId: z.number().min(1, 'Category is required'),
  tags: z.string().default(''),
  authorId: z.string().min(1, 'Author is required'),
  status: z.enum(['draft', 'review', 'published']),
  publishDate: z.string(),
  location: z.string().default(''),
  metadata: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
});

type BlogFormSchema = z.infer<typeof blogFormSchema>;

interface BlogFormProps {
  blog?: Blog;
  onSubmit: (data: BlogFormData) => Promise<void>;
  onPreview?: () => void;
  isSaving: boolean;
  formId?: string;
}

export function BlogForm({ blog, onSubmit, onPreview, isSaving, formId }: BlogFormProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [contentEditor, setContentEditor] = useState<TiptapEditorLike | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [internalLinks, setInternalLinks] = useState<InternalLinkEntry[]>(
    blog?.internalLinks ?? []
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

  const form = useForm({
    resolver: zodResolver(blogFormSchema),
    defaultValues: blog
      ? {
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          content: blog.content,
          categoryId: blog.categoryId || 0,
          tags: blog.tags || '',
          authorId: String(blog.authorId),
          status: blog.status,
          publishDate: blog.publishDate,
          location: blog.location || '',
          metadata: {
            metaTitle: blog.metadata.metaTitle || '',
            metaDescription: blog.metadata.metaDescription || '',
            keywords: blog.metadata.keywords || [],
          },
        }
      : {
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          categoryId: 0,
          tags: '',
          authorId: '',
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

  const handleFormSubmit = async (data: BlogFormSchema) => {
    await onSubmit({ ...(data as BlogFormData), internalLinks });
  };

  const fillSampleData = () => {
    const sampleData: Partial<BlogFormSchema> = {
      title: 'AI-Powered Diagnostics Revolution in Healthcare Market',
      slug: 'ai-powered-diagnostics-revolution-healthcare-market',
      excerpt:
        'The healthcare diagnostics market is experiencing a transformative shift with artificial intelligence integration. This comprehensive analysis explores the latest trends, market dynamics, and future projections for AI-powered diagnostic solutions.',
      content:
        '<h2>Introduction</h2><p>The integration of artificial intelligence in healthcare diagnostics is revolutionizing the medical industry. Recent studies show a significant increase in accuracy and efficiency of diagnostic procedures powered by AI algorithms.</p><h2>Market Overview</h2><p>The global AI diagnostics market is projected to reach $15.6 billion by 2028, growing at a CAGR of 31.8% from 2023 to 2028. Key factors driving this growth include:</p><ul><li>Increasing demand for early and accurate disease detection</li><li>Growing adoption of precision medicine</li><li>Rising healthcare costs and need for efficiency</li><li>Advances in machine learning and deep learning technologies</li></ul><h2>Key Market Segments</h2><p>The market can be segmented based on application areas including radiology, pathology, cardiology, and oncology. Radiology currently holds the largest market share due to widespread adoption of AI-powered imaging solutions.</p><h2>Conclusion</h2><p>AI-powered diagnostics represent a significant opportunity for healthcare providers and technology companies alike. As the technology matures and regulatory frameworks evolve, we can expect continued growth and innovation in this space.</p>',
      categoryId: categories.length > 0 ? categories[0].id : 1,
      tags: 'AI in healthcare, diagnostics, market research',
      location: 'San Francisco, USA',
      metadata: {
        metaTitle: 'AI-Powered Diagnostics Market Analysis 2024 | Healthcare Innovation',
        metaDescription:
          'Comprehensive analysis of the AI-powered diagnostics market, including trends, growth projections, and key market segments. Explore the future of healthcare diagnostics.',
        keywords: [
          'AI diagnostics',
          'healthcare technology',
          'medical AI',
          'diagnostic imaging',
          'precision medicine',
        ],
      },
    };

    // Fill the form with sample data
    Object.entries(sampleData).forEach(([key, value]) => {
      form.setValue(key as keyof BlogFormSchema, value);
    });
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
                  <FormLabel>Blog Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a compelling title for your blog post..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/{TITLE_MAX_LENGTH} characters
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
                      <Input placeholder="url-friendly-slug-for-blog" {...field} />
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
                            `${config.preview.domain}/blog/${field.value}`
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
                      placeholder="Write a brief summary that appears in blog listings..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/{EXCERPT_MAX_LENGTH} characters
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
                  <FormDescription>Select the category for this blog post</FormDescription>
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
                      placeholder="Enter tags (comma-separated, e.g., AI in healthcare, diagnostics)"
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
                    <AuthorSelector value={field.value} onChange={field.onChange} />
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
                  <FormDescription>Optional location field for the blog post</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Blog Content */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Content</CardTitle>
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
                      placeholder="Start writing your blog post..."
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
          initialLinks={blog?.internalLinks ?? []}
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
                  <FormDescription>Leave empty to use blog title</FormDescription>
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
                    {isSaving ? 'Saving...' : 'Save Blog Post'}
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
