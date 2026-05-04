/**
 * Report Validation Schema
 *
 * This schema aligns with backend validation requirements.
 *
 * MANDATORY FIELDS (Must be provided):
 * 1. title - Minimum 10 characters
 * 2. slug - Unique identifier (lowercase letters, numbers, hyphens only)
 * 3. category_id - Valid category ID
 * 4. summary - Minimum 50 characters
 * 5. geography - At least one geography (array)
 * 6. sections - Report content sections object (required, but all fields within are optional)
 *
 * OPTIONAL FIELDS (can be blank/null):
 *
 * Basic Info:
 * - description - Text description
 * - thumbnailUrl - Image URL
 *
 * Pricing:
 * - price (defaults to 0)
 * - discountedPrice (defaults to 0, must be <= price if provided)
 * - currency (defaults to 'USD')
 *
 * Report Details:
 * - pageCount (defaults to 0)
 * - formats - Array of format types (e.g., PDF, DOCX)
 *
 * Status & Publishing:
 * - status (defaults to 'draft' if not provided)
 * - isFeatured (defaults to false)
 * - publishDate - Can be null
 *
 * Authors & Relations:
 * - authorIds - Array of user IDs
 *
 * Market Data:
 * - marketMetrics - Object containing market size/forecast data (all fields optional)
 *
 * Content Sections (within the sections object, all fields are optional):
 * - marketDetails, keyPlayers, tableOfContents
 *
 * Additional:
 * - faqs - Array of FAQ objects (question and answer both required if FAQ is added)
 * - metadata - SEO metadata (all optional)
 * - internalNotes - Admin notes
 *
 * AUTO-MANAGED FIELDS (NOT allowed in form data):
 * - id, created_by, updated_by, created_at, updated_at, view_count, download_count
 */

import { z } from 'zod';

// Key Player validation
// Each player's name is required, but marketShare, rank, description are optional
export const keyPlayerSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  marketShare: z.string().optional(),
  description: z.string().optional(),
});

// FAQ validation
export const faqSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  answer: z.string().min(10, 'Answer must be at least 10 characters'),
});

// Table of Contents validation
export const tocSubsectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Subsection title is required'),
  pageNumber: z.string().optional(),
});

export const tocSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Section title is required'),
  pageNumber: z.string().optional(),
  subsections: z.array(tocSubsectionSchema),
});

export const tocChapterSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Chapter title is required'),
  pageNumber: z.string().optional(),
  sections: z.array(tocSectionSchema),
});

export const tableOfContentsSchema = z.object({
  chapters: z.array(tocChapterSchema),
});

// Market Metrics validation (all optional)
export const marketMetricsSchema = z
  .object({
    currentRevenue: z.string().optional(),
    currentYear: z.number().optional(),
    forecastRevenue: z.string().optional(),
    forecastYear: z.number().optional(),
    cagr: z.string().optional(),
    cagrStartYear: z.number().optional(),
    cagrEndYear: z.number().optional(),
  })
  .optional();

// Report Metadata (SEO) validation (all optional)
export const reportMetadataSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url().optional().or(z.literal('')),
  ogType: z.string().optional(),
  twitterCard: z.string().optional(),
  schemaJson: z.string().optional(),
  robotsDirective: z.string().optional(),
});

// Report Sections validation
// The sections object is required, but all fields within it are optional strings
export const reportSectionsSchema = z.object({
  marketDetails: z.string().optional(),
  tableOfContents: tableOfContentsSchema.optional(), // Structured TOC validation
  keyPlayers: z.array(keyPlayerSchema).optional(),
});

// Main Report Form Schema
export const reportFormSchema = z
  .object({
    // ============ MANDATORY FIELDS ============
    title: z.string().min(1, 'Title is required').min(10, 'Title must be at least 10 characters'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be lowercase letters, numbers, and hyphens only'
      ),
    summary: z
      .string()
      .min(1, 'Summary is required')
      .min(50, 'Summary must be at least 50 characters'),
    category_id: z.number().min(1, 'Category is required'),
    geography: z.array(z.string()).min(1, 'At least one geography is required'),
    sections: reportSectionsSchema,

    // ============ OPTIONAL FIELDS ============

    // Basic Info
    description: z.string().optional(),
    thumbnailUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),

    // Pricing (defaults to 0 if not provided)
    price: z.number().min(0, 'Price must be a positive number').optional(),
    discountedPrice: z.number().min(0, 'Discounted price must be a positive number').optional(),
    currency: z.string().optional(),

    // Report Details
    pageCount: z.number().min(0, 'Page count must be a positive number').optional(),
    formats: z.array(z.enum(['PDF', 'Excel', 'Word', 'PowerPoint'])).optional(),

    // Status & Publishing (defaults to "draft")
    status: z.enum(['draft', 'published']).optional(),
    publishDate: z.string().optional(),
    isFeatured: z.boolean().optional(),

    // Authors & Contributors
    authorIds: z.array(z.string()).optional(),

    // Market Data
    marketMetrics: marketMetricsSchema,

    // FAQs & Metadata
    faqs: z.array(faqSchema).optional(),
    metadata: reportMetadataSchema,

    // Admin Notes
    internalNotes: z.string().optional(),

    // Internal links (managed by InternalLinkPanel, not directly editable)
    internalLinks: z
      .array(
        z.object({
          keyword: z.string(),
          targetId: z.number(),
          targetTitle: z.string(),
          targetType: z.enum(['report', 'blog', 'press-release']),
          targetUrl: z.string(),
          linkedCount: z.number(),
        })
      )
      .optional()
      .default([]),
  })
  .refine(
    data => {
      // If both price and discounted price are provided, discounted price should be less than or equal to price
      if (
        data.price !== undefined &&
        data.discountedPrice !== undefined &&
        data.discountedPrice > data.price
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Discounted price cannot be greater than regular price',
      path: ['discountedPrice'],
    }
  );

// Type inference from schema
export type ReportFormSchemaType = z.infer<typeof reportFormSchema>;
