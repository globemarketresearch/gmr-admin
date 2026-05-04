import { z } from 'zod';
import {
  PRESS_RELEASE_TITLE_MIN_LENGTH,
  PRESS_RELEASE_TITLE_MAX_LENGTH,
  PRESS_RELEASE_EXCERPT_MIN_LENGTH,
  PRESS_RELEASE_EXCERPT_MAX_LENGTH,
  PRESS_RELEASE_CONTENT_MIN_LENGTH,
} from '@/lib/config/press-releases';

// Press Release form validation schema (matches API requirements)
export const pressReleaseFormSchema = z.object({
  title: z
    .string()
    .min(
      PRESS_RELEASE_TITLE_MIN_LENGTH,
      `Title must be at least ${PRESS_RELEASE_TITLE_MIN_LENGTH} characters`
    )
    .max(
      PRESS_RELEASE_TITLE_MAX_LENGTH,
      `Title must be at most ${PRESS_RELEASE_TITLE_MAX_LENGTH} characters`
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
      PRESS_RELEASE_EXCERPT_MIN_LENGTH,
      `Excerpt must be at least ${PRESS_RELEASE_EXCERPT_MIN_LENGTH} characters`
    )
    .max(
      PRESS_RELEASE_EXCERPT_MAX_LENGTH,
      `Excerpt must be at most ${PRESS_RELEASE_EXCERPT_MAX_LENGTH} characters`
    ),
  content: z
    .string()
    .min(
      PRESS_RELEASE_CONTENT_MIN_LENGTH,
      `Content must be at least ${PRESS_RELEASE_CONTENT_MIN_LENGTH} characters`
    ),
  categoryId: z.number().positive('Category is required'),
  tags: z.string().default(''), // Comma-separated tags; default to empty string for consistent form data
  authorId: z.number().positive('Author is required'),
  status: z.enum(['draft', 'review', 'published']),
  publishDate: z.string(),
  location: z.string().optional(),
  reportUrl: z.string().url('Report URL is required and must be a valid URL'),
  metadata: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional().default([]),
    })
    .default(() => ({ metaTitle: '', metaDescription: '', keywords: [] })),
});
