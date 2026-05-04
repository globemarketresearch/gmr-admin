// SEO Best Practices Constants and Configuration

export const SEO_LIMITS = {
  metaTitle: {
    min: 30,
    max: 60,
    optimal: { min: 50, max: 60 },
    pixelWidth: { max: 580 },
  },
  metaDescription: {
    min: 120,
    max: 160,
    optimal: { min: 150, max: 160 },
    pixelWidth: { max: 920 },
  },
  ogTitle: {
    max: 95, // OpenGraph titles can be longer
  },
  ogDescription: {
    max: 200,
  },
  keywords: {
    min: 3,
    max: 10,
    maxLength: 30, // per keyword
  },
  canonicalUrl: {
    required: true, // for published content
  },
} as const;

// Schema.org Templates
interface SchemaTemplateData {
  title: string;
  description: string;
  author?: string;
  organization?: string;
  publishDate?: string;
  category?: string;
}

export const SCHEMA_TEMPLATES = {
  article: (data: SchemaTemplateData) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    author: {
      '@type': 'Person',
      name: data.author || 'Unknown',
    },
    datePublished: data.publishDate || new Date().toISOString(),
  }),

  newsArticle: (data: SchemaTemplateData) => ({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: data.title,
    description: data.description,
    author: {
      '@type': 'Person',
      name: data.author || 'Unknown',
    },
    datePublished: data.publishDate || new Date().toISOString(),
  }),

  report: (data: SchemaTemplateData) => ({
    '@context': 'https://schema.org',
    '@type': 'Report',
    name: data.title,
    description: data.description,
    author: {
      '@type': 'Organization',
      name: data.organization || 'Healthcare Market Research',
    },
    datePublished: data.publishDate || new Date().toISOString(),
    about: data.category,
  }),
} as const;

// Robots directive options
export const ROBOTS_DIRECTIVES = [
  'index,follow',
  'noindex,follow',
  'index,nofollow',
  'noindex,nofollow',
] as const;

export type RobotsDirective = (typeof ROBOTS_DIRECTIVES)[number];

// OpenGraph types
export const OG_TYPES = {
  blog: 'article',
  report: 'article',
} as const;

// Twitter Card types
export const TWITTER_CARD_TYPES = ['summary', 'summary_large_image'] as const;

export type TwitterCardType = (typeof TWITTER_CARD_TYPES)[number];

// SEO validation severity levels
export type SEOValidationSeverity = 'info' | 'warning' | 'error';

// Default OpenGraph image dimensions
export const OG_IMAGE = {
  recommendedWidth: 1200,
  recommendedHeight: 630,
  aspectRatio: 1.91,
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  formats: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Schema.org template types
export type SchemaTemplateType = keyof typeof SCHEMA_TEMPLATES;
