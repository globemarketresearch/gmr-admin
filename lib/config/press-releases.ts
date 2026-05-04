// Import blog categories for reuse
import { BLOG_CATEGORIES } from './blogs';

// Press Release categories (reusing blog categories)
export { BLOG_CATEGORIES as PRESS_RELEASE_CATEGORIES };

// Popular tags for quick selection
export const POPULAR_PRESS_RELEASE_TAGS = [
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

// Press Release status labels with descriptions
export const PRESS_RELEASE_STATUS_CONFIG = {
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
export const PRESS_RELEASE_WORKFLOW_TRANSITIONS = {
  draft: ['review', 'published'], // From draft can go to review or directly publish (admin only)
  review: ['draft', 'published'], // From review can go back to draft or publish
  published: ['draft'], // From published can only go back to draft
} as const;

// Reading time calculation
export const PRESS_RELEASE_WORDS_PER_MINUTE = 200;

// Pagination defaults
export const PRESS_RELEASES_PER_PAGE = 10;
export const MAX_PRESS_RELEASES_PER_PAGE = 50;

// Image requirements
export const PRESS_RELEASE_FEATURED_IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  recommendedDimensions: {
    width: 1200,
    height: 630,
  },
};

// Excerpt length limits (from API spec)
export const PRESS_RELEASE_EXCERPT_MIN_LENGTH = 50;
export const PRESS_RELEASE_EXCERPT_MAX_LENGTH = 500;

// Title length limits (from API spec)
export const PRESS_RELEASE_TITLE_MIN_LENGTH = 10;
export const PRESS_RELEASE_TITLE_MAX_LENGTH = 200;

// Content length limits (from API spec)
export const PRESS_RELEASE_CONTENT_MIN_LENGTH = 100;
