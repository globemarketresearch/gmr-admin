// Import statistic categories for reuse (same categories table as PR/Statistics)
import { STATISTIC_CATEGORIES } from './statistics';

export { STATISTIC_CATEGORIES as INDUSTRY_NEWS_CATEGORIES };

// Popular tags for quick selection
export const POPULAR_INDUSTRY_NEWS_TAGS = [
  'healthcare',
  'market research',
  'pharmaceuticals',
  'medical devices',
  'biotechnology',
  'digital health',
  'AI in healthcare',
  'telemedicine',
  'clinical trials',
  'FDA',
  'innovation',
  'startups',
] as const;

// Industry News status labels with descriptions
export const INDUSTRY_NEWS_STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    description: 'Not visible to public. Only you can see this.',
    color: 'secondary',
  },
  review: {
    label: 'In Review',
    description: 'Submitted for review. Awaiting approval.',
    color: 'warning',
  },
  published: {
    label: 'Published',
    description: 'Visible to public on the website.',
    color: 'success',
  },
} as const;

// Workflow transitions
export const INDUSTRY_NEWS_WORKFLOW_TRANSITIONS = {
  draft: ['review', 'published'],
  review: ['draft', 'published'],
  published: ['draft'],
} as const;

// Reading time calculation
export const INDUSTRY_NEWS_WORDS_PER_MINUTE = 200;

// Pagination defaults
export const INDUSTRY_NEWS_PER_PAGE = 10;
export const MAX_INDUSTRY_NEWS_PER_PAGE = 50;

// Excerpt length limits (from API spec)
export const INDUSTRY_NEWS_EXCERPT_MIN_LENGTH = 50;
export const INDUSTRY_NEWS_EXCERPT_MAX_LENGTH = 500;

// Title length limits (from API spec)
export const INDUSTRY_NEWS_TITLE_MIN_LENGTH = 10;
export const INDUSTRY_NEWS_TITLE_MAX_LENGTH = 200;

// Content length limits (from API spec)
export const INDUSTRY_NEWS_CONTENT_MIN_LENGTH = 100;

// Default author name pre-selected for new Industry News articles
export const INDUSTRY_NEWS_DEFAULT_AUTHOR_NAME = 'Globe Market Research';
