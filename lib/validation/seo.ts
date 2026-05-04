import { z } from 'zod';
import { SEO_LIMITS, TWITTER_CARD_TYPES } from '@/lib/config/seo';

// URL validation helper
const urlSchema = z.string().url().or(z.literal(''));

// JSON validation helper
const jsonSchema = z.string().refine(
  val => {
    if (!val) return true;
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid JSON format' }
);

// Enhanced metadata schema for Reports
export const reportMetadataSchema = z.object({
  metaTitle: z
    .string()
    .min(
      SEO_LIMITS.metaTitle.min,
      `Meta title should be at least ${SEO_LIMITS.metaTitle.min} characters`
    )
    .max(
      SEO_LIMITS.metaTitle.max,
      `Meta title should not exceed ${SEO_LIMITS.metaTitle.max} characters`
    )
    .optional()
    .or(z.literal('')),

  metaDescription: z
    .string()
    .min(
      SEO_LIMITS.metaDescription.min,
      `Meta description should be at least ${SEO_LIMITS.metaDescription.min} characters`
    )
    .max(
      SEO_LIMITS.metaDescription.max,
      `Meta description should not exceed ${SEO_LIMITS.metaDescription.max} characters`
    )
    .optional()
    .or(z.literal('')),

  keywords: z
    .array(z.string().max(SEO_LIMITS.keywords.maxLength))
    .min(SEO_LIMITS.keywords.min, `Add at least ${SEO_LIMITS.keywords.min} keywords`)
    .max(SEO_LIMITS.keywords.max, `Maximum ${SEO_LIMITS.keywords.max} keywords allowed`)
    .optional(),

  canonicalUrl: urlSchema.optional(),
  ogTitle: z.string().max(SEO_LIMITS.ogTitle.max).optional().or(z.literal('')),
  ogDescription: z.string().max(SEO_LIMITS.ogDescription.max).optional().or(z.literal('')),
  ogImage: urlSchema.optional(),
  ogType: z.string().optional(),
  twitterCard: z.enum(TWITTER_CARD_TYPES).optional(),
  schemaJson: jsonSchema.optional().or(z.literal('')),
  robotsDirective: z.string().optional(),
});

// Enhanced metadata schema for Blogs (same validation rules)
export const blogMetadataSchema = reportMetadataSchema;

// SEO validation function - returns warnings (not errors)
export interface SEOWarning {
  field: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export interface SEOMetadataInput {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  schemaJson?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export function validateSEO(
  metadata: SEOMetadataInput,
  _contentType: 'blog' | 'report'
): SEOWarning[] {
  const warnings: SEOWarning[] = [];

  // Meta Title Checks
  if (metadata.metaTitle) {
    const len = metadata.metaTitle.length;
    if (len < SEO_LIMITS.metaTitle.optimal.min) {
      warnings.push({
        field: 'metaTitle',
        severity: 'warning',
        message: `Meta title is ${len} chars. Optimal range is ${SEO_LIMITS.metaTitle.optimal.min}-${SEO_LIMITS.metaTitle.optimal.max} chars.`,
      });
    }
    if (len > SEO_LIMITS.metaTitle.optimal.max && len <= SEO_LIMITS.metaTitle.max) {
      warnings.push({
        field: 'metaTitle',
        severity: 'info',
        message: `Meta title is ${len} chars. May be truncated in search results.`,
      });
    }
  } else {
    warnings.push({
      field: 'metaTitle',
      severity: 'warning',
      message: 'Meta title is empty. Will use content title as fallback.',
    });
  }

  // Meta Description Checks
  if (metadata.metaDescription) {
    const len = metadata.metaDescription.length;
    if (len < SEO_LIMITS.metaDescription.optimal.min) {
      warnings.push({
        field: 'metaDescription',
        severity: 'warning',
        message: `Meta description is ${len} chars. Optimal range is ${SEO_LIMITS.metaDescription.optimal.min}-${SEO_LIMITS.metaDescription.optimal.max} chars.`,
      });
    }
  } else {
    warnings.push({
      field: 'metaDescription',
      severity: 'error',
      message: 'Meta description is required for good SEO.',
    });
  }

  // Keywords Check
  if (!metadata.keywords || metadata.keywords.length < SEO_LIMITS.keywords.min) {
    warnings.push({
      field: 'keywords',
      severity: 'warning',
      message: `Add at least ${SEO_LIMITS.keywords.min} keywords for better discoverability.`,
    });
  }

  // Canonical URL Check
  if (!metadata.canonicalUrl) {
    warnings.push({
      field: 'canonicalUrl',
      severity: 'info',
      message: 'Canonical URL not set. Will use current URL as canonical.',
    });
  }

  // Schema JSON Check
  if (!metadata.schemaJson) {
    warnings.push({
      field: 'schemaJson',
      severity: 'info',
      message: 'No structured data added. Consider adding Schema.org markup for rich results.',
    });
  }

  // OpenGraph Image Check
  if (!metadata.ogImage) {
    warnings.push({
      field: 'ogImage',
      severity: 'info',
      message: 'No OpenGraph image specified. Social media previews will use default image.',
    });
  }

  return warnings;
}
