import { z } from 'zod';
import {
  INDUSTRY_NEWS_TITLE_MIN_LENGTH,
  INDUSTRY_NEWS_TITLE_MAX_LENGTH,
  INDUSTRY_NEWS_EXCERPT_MIN_LENGTH,
  INDUSTRY_NEWS_EXCERPT_MAX_LENGTH,
  INDUSTRY_NEWS_CONTENT_MIN_LENGTH,
} from '@/lib/config/industry-news';

export const industryNewsFormSchema = z.object({
  title: z
    .string()
    .min(
      INDUSTRY_NEWS_TITLE_MIN_LENGTH,
      `Title must be at least ${INDUSTRY_NEWS_TITLE_MIN_LENGTH} characters`
    )
    .max(
      INDUSTRY_NEWS_TITLE_MAX_LENGTH,
      `Title must be at most ${INDUSTRY_NEWS_TITLE_MAX_LENGTH} characters`
    ),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase letters, numbers, and hyphens only'
    ),
  excerpt: z
    .string()
    .min(
      INDUSTRY_NEWS_EXCERPT_MIN_LENGTH,
      `Excerpt must be at least ${INDUSTRY_NEWS_EXCERPT_MIN_LENGTH} characters`
    )
    .max(
      INDUSTRY_NEWS_EXCERPT_MAX_LENGTH,
      `Excerpt must be at most ${INDUSTRY_NEWS_EXCERPT_MAX_LENGTH} characters`
    ),
  content: z
    .string()
    .min(
      INDUSTRY_NEWS_CONTENT_MIN_LENGTH,
      `Content must be at least ${INDUSTRY_NEWS_CONTENT_MIN_LENGTH} characters`
    ),
  categoryId: z.number().positive('Category is required'),
  tags: z.string().default(''),
  authorId: z.number().positive('Author is required'),
  status: z.enum(['draft', 'review', 'published']),
  publishDate: z.string(),
  location: z.string().optional(),
  metadata: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional().default([]),
    })
    .default(() => ({ metaTitle: '', metaDescription: '', keywords: [] })),
});
