'use client';

import { useState, useEffect, useRef } from 'react';
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
import { MultiSelectAuthorDropdown } from './multi-select-author-dropdown';
import { ReportImagesManager } from './report-images-manager';
import { GEOGRAPHIES, REPORT_FORMATS } from '@/lib/config/reports';
import { fetchCategories, type Category } from '@/lib/api/categories';
import type { ReportFormData, Report } from '@/lib/types/reports';
import { reportFormSchema as importedReportFormSchema } from '@/lib/validation/report-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Eye, Plus, Trash2, HelpCircle, User, Image as ImageIcon, Copy } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CharacterCounter } from '@/components/seo/character-counter';
import { SEO_LIMITS } from '@/lib/config/seo';
import { measureTextWidth, SERP_FONTS } from '@/lib/utils/text-measurement';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import { generateSlug } from '@/lib/utils/slug';

interface ReportFormProps {
  report?: Report;
  onSubmit: (data: ReportFormData) => Promise<void>;
  onPreview?: () => void;
  isSaving: boolean;
}

export function ReportForm({ report, onSubmit, onPreview, isSaving }: ReportFormProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const faqInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    resolver: zodResolver(importedReportFormSchema),
    defaultValues: report
      ? {
          title: report.title,
          slug: report.slug,
          summary: report.summary,
          category_id: report.categoryId || 0,
          geography: report.geography,
          publishDate: report.publishDate ? report.publishDate.split('T')[0] : '',
          price: report.price,
          discountedPrice: report.discountedPrice,
          status: report.status,
          pageCount: report.pageCount,
          formats: report.formats || [],
          marketMetrics: report.marketMetrics || {},
          authorIds: report.authorIds || [],
          sections: report.sections,
          faqs: report.faqs || [],
          metadata: report.metadata,
        }
      : {
          title: '',
          slug: '',
          summary: '',
          category_id: 0,
          geography: ['Global'],
          publishDate: new Date().toISOString().split('T')[0],
          price: 3490,
          discountedPrice: 3090,
          status: 'draft',
          pageCount: undefined,
          formats: [],
          marketMetrics: {
            currentRevenue: '',
            currentYear: new Date().getFullYear(),
            forecastRevenue: '',
            forecastYear: new Date().getFullYear() + 7,
            cagr: '',
            cagrStartYear: new Date().getFullYear(),
            cagrEndYear: 2035,
          },
          authorIds: [],
          sections: {
            marketDetails: '',
            tableOfContents: { chapters: [] },
          },
          faqs: [],
          metadata: {
            metaTitle: '',
            metaDescription: '',
            keywords: [],
            canonicalUrl: '',
            ogTitle: '',
            ogDescription: '',
            ogImage: '',
            ogType: 'article',
            twitterCard: 'summary_large_image',
            schemaJson: '',
            robotsDirective: 'index, follow',
          },
        },
  });

  const handleSubmit = (data: ReportFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                  <FormLabel className="flex items-center gap-1">
                    Report Title
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Global Healthcare Market Analysis 2024"
                      {...field}
                      onChange={e => {
                        field.onChange(e);
                        // Auto-generate slug from title if slug is empty
                        const currentSlug = form.getValues('slug');
                        if (!currentSlug || !report) {
                          const slug = generateSlug(e.target.value);
                          form.setValue('slug', slug);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>Minimum 10 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    URL Slug
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="e.g., global-healthcare-market-analysis-2024"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (field.value) {
                          navigator.clipboard.writeText(
                            `${config.preview.domain}/reports/${field.value}`
                          );
                          toast.success('URL copied to clipboard');
                        }
                      }}
                      disabled={!field.value}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    Unique URL identifier (lowercase letters, numbers, and hyphens only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Summary
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief overview of the report (minimum 50 characters)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0} / 50 minimum characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="geography"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Geography
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="grid grid-cols-2 space-y-2">
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
                    <FormDescription>Select at least one geography</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="publishDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pageCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="145"
                        {...field}
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="formats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Formats</FormLabel>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {REPORT_FORMATS.map(format => (
                        <div key={format} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(format)}
                            onCheckedChange={checked => {
                              const updated = checked
                                ? [...(field.value || []), format]
                                : field.value?.filter(f => f !== format) || [];
                              field.onChange(updated);
                            }}
                          />
                          <label className="text-sm">{format}</label>
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
                        placeholder="3490"
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
                name="discountedPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discounted Price (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="3090"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Market Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Market Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="marketMetrics.currentRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Market Revenue</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $87.4 billion" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketMetrics.currentYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2024"
                        {...field}
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="marketMetrics.forecastRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forecasted Revenue</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $286.2 billion" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketMetrics.forecastYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forecast Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2032"
                        {...field}
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="marketMetrics.cagr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CAGR (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 16.8%" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketMetrics.cagrStartYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CAGR Start Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2025"
                        {...field}
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketMetrics.cagrEndYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CAGR End Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2032"
                        {...field}
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Research Team / Authors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Research Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="authorIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authors</FormLabel>
                  <FormDescription>Select authors who contributed to this report</FormDescription>
                  <FormControl>
                    <MultiSelectAuthorDropdown
                      value={field.value || []}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Charts & Images - Only show when editing (reportId exists) */}
        {report?.id && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Charts & Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Create custom charts or upload images for your report. Charts can be generated
                  from data, and custom images can be manually uploaded.
                </p>
              </div>
              <ReportImagesManager reportId={report.id} disabled={isSaving} />
            </CardContent>
          </Card>
        )}

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

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="faqs"
              render={({ field }) => (
                <FormItem>
                  <FormDescription>
                    Add questions and answers to help users understand this report better
                  </FormDescription>
                  <div className="space-y-4">
                    {field.value?.map((faq, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              FAQ #{index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = field.value?.filter((_, i) => i !== index);
                                field.onChange(updated);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <Input
                                ref={el => {
                                  faqInputRefs.current[index] = el;
                                }}
                                placeholder="Enter your question... *"
                                value={faq.question}
                                onChange={e => {
                                  const updated = [...(field.value || [])];
                                  updated[index] = { ...updated[index], question: e.target.value };
                                  field.onChange(updated);
                                }}
                                className={
                                  faq.question && faq.question.length < 5
                                    ? 'border-destructive'
                                    : ''
                                }
                              />
                              {faq.question && faq.question.length < 5 && (
                                <p className="text-xs text-destructive mt-1">
                                  Question must be at least 5 characters
                                </p>
                              )}
                            </div>
                            <div>
                              <Textarea
                                placeholder="Enter the answer... *"
                                rows={3}
                                value={faq.answer}
                                onChange={e => {
                                  const updated = [...(field.value || [])];
                                  updated[index] = { ...updated[index], answer: e.target.value };
                                  field.onChange(updated);
                                }}
                                className={
                                  faq.answer && faq.answer.length < 10 ? 'border-destructive' : ''
                                }
                              />
                              {faq.answer && faq.answer.length < 10 && (
                                <p className="text-xs text-destructive mt-1">
                                  Answer must be at least 10 characters
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const updated = [...(field.value || []), { question: '', answer: '' }];
                      field.onChange(updated);
                      const newIndex = updated.length - 1;
                      setTimeout(() => {
                        faqInputRefs.current[newIndex]?.focus();
                      }, 0);
                    }}
                    className="w-full mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add FAQ
                  </Button>
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
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic SEO</h3>
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
                      />
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="SEO description (120-160 characters)"
                        {...field}
                        rows={3}
                      />
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

              <FormField
                control={form.control}
                name="metadata.canonicalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canonical URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/reports/..." {...field} />
                    </FormControl>
                    <FormDescription>Preferred URL for this page</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.robotsDirective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Robots Directive</FormLabel>
                    <FormControl>
                      <Input placeholder="index, follow" {...field} />
                    </FormControl>
                    <FormDescription>e.g., `index, follow` or `noindex, nofollow`</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Open Graph (Facebook, LinkedIn)</h3>
              <FormField
                control={form.control}
                name="metadata.ogTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OG Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Social media title" {...field} />
                    </FormControl>
                    <FormDescription>Leave empty to use meta title</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.ogDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OG Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Social media description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.ogImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OG Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/images/..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Image shown when shared on social media (1200x630px recommended)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.ogType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OG Type</FormLabel>
                    <FormControl>
                      <Input placeholder="article" {...field} />
                    </FormControl>
                    <FormDescription>e.g., `article`, `website`</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Twitter Card</h3>
              <FormField
                control={form.control}
                name="metadata.twitterCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Card Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select card type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="summary_large_image">
                          Summary with Large Image
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Schema.org JSON-LD</h3>
              <FormField
                control={form.control}
                name="metadata.schemaJson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schema JSON-LD</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"@context": "https://schema.org", "@type": "Report", ...}'
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Structured data in JSON-LD format (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
