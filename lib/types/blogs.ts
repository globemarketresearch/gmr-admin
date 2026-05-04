// Re-use UserReference from reports
import type { UserReference, ReportAuthor, InternalLinkEntry } from './reports';
export type { InternalLinkEntry };

// Blog status enum with workflow states
export type BlogStatus = 'draft' | 'review' | 'published';

// Blog tag
export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

// Blog author (extends UserReference with author-specific fields)
export interface BlogAuthor extends UserReference {
  bio?: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
  };
}

// SEO metadata for blog posts (API format)
export interface BlogMetadata {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// Version history item
export interface BlogVersion {
  id: string;
  versionNumber: number;
  summary: string;
  createdAt: string;
  author: UserReference;
  content: string;
  title: string;
  excerpt: string;
}

// API Blog interface (matches backend schema)
export interface ApiBlog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number; // Category ID (required)
  category?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }; // Category details from API
  tags: string; // comma-separated string
  authorId: number;
  author?: ReportAuthor; // Author details from API
  status: BlogStatus;
  publishDate: string;
  scheduledPublishEnabled?: boolean;
  location?: string;
  metadata: BlogMetadata;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: number;
  reviewedAt?: string;
  deletedAt?: string;
}

// Frontend Blog interface (for UI components)
export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number; // Category ID
  categoryName?: string; // Category name (populated from category lookup)
  tags: string; // Comma-separated tags
  author: ReportAuthor;
  authorId: number;
  status: BlogStatus;
  publishDate: string;
  scheduledPublishEnabled?: boolean;
  readingTime: number; // in minutes, calculated on frontend
  viewCount: number; // calculated or from cache
  location?: string;
  metadata: BlogMetadata;
  internalLinks?: InternalLinkEntry[];
  versions?: BlogVersion[];
  createdAt: string;
  updatedAt: string;
  reviewedBy?: UserReference;
  reviewedAt?: string;
  deletedAt?: string;
}

// List filters
export interface BlogFilters {
  status?: BlogStatus;
  categoryId?: number; // Filter by category ID
  tags?: string; // comma-separated
  authorId?: number;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// API response types
export interface BlogsResponse {
  blogs: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogResponse {
  blog: Blog;
}

// API request types
export interface CreateBlogRequest {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number; // Category ID (required)
  tags?: string; // comma-separated
  authorId: number;
  status: BlogStatus;
  publishDate: string;
  location?: string;
  metadata?: BlogMetadata;
}

export interface UpdateBlogRequest {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  categoryId?: number; // Category ID
  tags?: string; // comma-separated
  authorId?: number;
  status?: BlogStatus;
  publishDate?: string;
  location?: string;
  metadata?: BlogMetadata;
  internalLinks?: InternalLinkEntry[];
}

// Form data (for create/update)
export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number; // Category ID (required)
  tags: string; // Comma-separated tags
  authorId: string; // String for form compatibility
  status: BlogStatus;
  publishDate: string;
  location: string;
  metadata: BlogMetadata;
  internalLinks?: InternalLinkEntry[];
}

// Category type
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

// Author list response
export interface BlogAuthorsResponse {
  authors: BlogAuthor[];
  total: number;
}

// Tag list response
export interface BlogTagsResponse {
  tags: BlogTag[];
  total: number;
}

// Category list response
export interface BlogCategoriesResponse {
  categories: BlogCategory[];
  total: number;
}
