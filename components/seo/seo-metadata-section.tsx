'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
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
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CharacterCounter } from './character-counter';
import { SEOValidationAlert } from './seo-validation-alert';
import { SEOPreviewCard } from './seo-preview-card';
import { SchemaJsonEditor } from './schema-json-editor';
import { validateSEO } from '@/lib/validation/seo';
import { SEO_LIMITS, ROBOTS_DIRECTIVES } from '@/lib/config/seo';
import { measureTextWidth, SERP_FONTS } from '@/lib/utils/text-measurement';
import type { UseFormReturn } from 'react-hook-form';

type SEOFormValues = Record<string, unknown> & {
  metadata?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;

    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;

    twitterCard?: 'summary' | 'summary_large_image' | (string & {});
    robotsDirective?: string;
    schemaJson?: string;
  };
};

interface SEOMetadataSectionProps {
  form: UseFormReturn<SEOFormValues>;
  contentType: 'blog' | 'report';
  currentTitle: string;
  currentDescription: string;
  featuredImage?: string;
}

export function SEOMetadataSection({
  form,
  contentType,
  currentTitle,
  currentDescription,
  featuredImage,
}: SEOMetadataSectionProps) {
  const metadata = form.watch('metadata');
  const [warnings, setWarnings] = useState<
    Array<{ field: string; severity: string; message: string }>
  >([]);
  const [keywordInput, setKeywordInput] = useState('');

  // Validate SEO whenever metadata changes
  useEffect(() => {
    const validationWarnings = validateSEO(metadata || {}, contentType);
    setWarnings(validationWarnings);
  }, [metadata, contentType]);

  // Compute preview values (use meta values or fallback to content values)
  const previewTitle = metadata?.ogTitle || metadata?.metaTitle || currentTitle;
  const previewDescription =
    metadata?.ogDescription || metadata?.metaDescription || currentDescription;
  const previewImage = metadata?.ogImage || featuredImage;

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      const currentKeywords: string[] = metadata?.keywords || [];
      form.setValue('metadata.keywords', [...currentKeywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    const currentKeywords: string[] = metadata?.keywords || [];
    form.setValue(
      'metadata.keywords',
      currentKeywords.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      {/* SEO Validation Warnings */}
      <SEOValidationAlert warnings={warnings} />

      {/* Basic SEO Fields */}
      <div className="space-y-4">
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
              <FormDescription>Leave empty to use {contentType} title</FormDescription>
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
                <Textarea placeholder="SEO description (120-160 characters)" {...field} rows={3} />
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
                      handleAddKeyword();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddKeyword}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value?.map((keyword: string, i: number) => (
                  <Badge key={i} variant="secondary">
                    {keyword}
                    <button type="button" onClick={() => handleRemoveKeyword(i)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <FormDescription>
                Add {SEO_LIMITS.keywords.min}-{SEO_LIMITS.keywords.max} keywords for SEO
              </FormDescription>
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
                <Input placeholder="https://example.com/canonical-url" {...field} />
              </FormControl>
              <FormDescription>
                The canonical URL for this content (prevents duplicate content issues)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      {/* OpenGraph & Twitter Card */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-3">Social Media Preview</h4>
          <SEOPreviewCard
            title={previewTitle}
            description={previewDescription}
            image={previewImage}
            type="both"
          />
        </div>

        <FormField
          control={form.control}
          name="metadata.ogImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OpenGraph Image</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/og-image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Image shown when shared on social media (recommended: 1200x630px)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metadata.twitterCard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter Card Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || 'summary_large_image'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      {/* Advanced SEO */}
      <Accordion type="single" collapsible className="border rounded-lg px-4">
        <AccordionItem value="advanced" className="border-none">
          <AccordionTrigger className="text-sm font-semibold">
            Advanced SEO Settings
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <FormField
              control={form.control}
              name="metadata.robotsDirective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Robots Directive</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'index,follow'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select robots directive" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROBOTS_DIRECTIVES.map(directive => (
                        <SelectItem key={directive} value={directive}>
                          {directive}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Controls how search engines index this page</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.schemaJson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schema.org Structured Data</FormLabel>
                  <FormControl>
                    <SchemaJsonEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      contentType={contentType}
                      contentData={{
                        title: currentTitle,
                        description: currentDescription,
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
