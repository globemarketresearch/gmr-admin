// Blog categories (expand as needed)
export const BLOG_CATEGORIES = [
  'Industry News',
  'Market Analysis',
  'Research Insights',
  'Company Profiles',
  'Technology Trends',
  'Regulatory Updates',
  'Case Studies',
  'How-To Guides',
  'Interviews',
  'Opinion',
] as const;

// Popular tags for quick selection
export const POPULAR_TAGS = [
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

// Blog status labels with descriptions
export const BLOG_STATUS_CONFIG = {
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
export const WORKFLOW_TRANSITIONS = {
  draft: ['review', 'published'], // From draft can go to review or directly publish (admin only)
  review: ['draft', 'published'], // From review can go back to draft or publish
  published: ['draft'], // From published can only go back to draft
} as const;

// Reading time calculation
export const WORDS_PER_MINUTE = 200;

// Pagination defaults
export const BLOGS_PER_PAGE = 10;
export const MAX_BLOGS_PER_PAGE = 50;

// Image requirements
export const FEATURED_IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  recommendedDimensions: {
    width: 1200,
    height: 630,
  },
};

// Excerpt length limits
export const EXCERPT_MIN_LENGTH = 50;
export const EXCERPT_MAX_LENGTH = 300;

// Title length limits
export const TITLE_MIN_LENGTH = 10;
export const TITLE_MAX_LENGTH = 100;

// Content length limits
export const CONTENT_MIN_LENGTH = 200;
