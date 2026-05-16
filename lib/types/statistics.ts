// Re-use UserReference from reports
import type { UserReference, ReportAuthor, InternalLinkEntry } from './reports';
export type { InternalLinkEntry };

// Statistic status enum with workflow states
export type StatisticStatus = 'draft' | 'review' | 'published';

// Statistic tag
export interface StatisticTag {
  id: string;
  name: string;
  slug: string;
}

// Statistic author (extends UserReference with author-specific fields)
export interface StatisticAuthor extends UserReference {
  bio?: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
  };
}

// SEO metadata for statistic posts (API format)
export interface StatisticMetadata {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// Version history item
export interface StatisticVersion {
  id: string;
  versionNumber: number;
  summary: string;
  createdAt: string;
  author: UserReference;
  content: string;
  title: string;
  excerpt: string;
}

// API Statistic interface (matches backend schema)
export interface ApiStatistic {
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
  status: StatisticStatus;
  publishDate: string;
  scheduledPublishEnabled?: boolean;
  location?: string;
  metadata: StatisticMetadata;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: number;
  reviewedAt?: string;
  deletedAt?: string;
}

// Frontend Statistic interface (for UI components)
export interface Statistic {
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
  status: StatisticStatus;
  publishDate: string;
  scheduledPublishEnabled?: boolean;
  readingTime: number; // in minutes, calculated on frontend
  viewCount: number; // calculated or from cache
  location?: string;
  metadata: StatisticMetadata;
  internalLinks?: InternalLinkEntry[];
  versions?: StatisticVersion[];
  createdAt: string;
  updatedAt: string;
  reviewedBy?: UserReference;
  reviewedAt?: string;
  deletedAt?: string;
}

// List filters
export interface StatisticFilters {
  status?: StatisticStatus;
  categoryId?: number; // Filter by category ID
  tags?: string; // comma-separated
  authorId?: number;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// API response types
export interface StatisticsResponse {
  statistics: Statistic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatisticResponse {
  statistic: Statistic;
}

// API request types
export interface CreateStatisticRequest {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number; // Category ID (required)
  tags?: string; // comma-separated
  authorId: number;
  status: StatisticStatus;
  publishDate: string;
  location?: string;
  metadata?: StatisticMetadata;
}

export interface UpdateStatisticRequest {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  categoryId?: number; // Category ID
  tags?: string; // comma-separated
  authorId?: number;
  status?: StatisticStatus;
  publishDate?: string;
  location?: string;
  metadata?: StatisticMetadata;
  internalLinks?: InternalLinkEntry[];
}

// Form data (for create/update)
export interface StatisticFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number; // Category ID (required)
  tags: string; // Comma-separated tags
  authorId: string; // String for form compatibility
  status: StatisticStatus;
  publishDate: string;
  location: string;
  metadata: StatisticMetadata;
  internalLinks?: InternalLinkEntry[];
}

// Category type
export interface StatisticCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

// Author list response
export interface StatisticAuthorsResponse {
  authors: StatisticAuthor[];
  total: number;
}

// Tag list response
export interface StatisticTagsResponse {
  tags: StatisticTag[];
  total: number;
}

// Category list response
export interface StatisticCategoriesResponse {
  categories: StatisticCategory[];
  total: number;
}

// Legacy type aliases for backward compatibility
export type BlogStatus = StatisticStatus;
export type BlogTag = StatisticTag;
export type BlogAuthor = StatisticAuthor;
export type BlogMetadata = StatisticMetadata;
export type BlogVersion = StatisticVersion;
export type ApiBlog = ApiStatistic;
export type Blog = Statistic;
export type BlogFilters = StatisticFilters;
export type BlogsResponse = StatisticsResponse;
export type BlogResponse = StatisticResponse;
export type CreateBlogRequest = CreateStatisticRequest;
export type UpdateBlogRequest = UpdateStatisticRequest;
export type BlogFormData = StatisticFormData;
export type BlogCategory = StatisticCategory;
export type BlogAuthorsResponse = StatisticAuthorsResponse;
export type BlogTagsResponse = StatisticTagsResponse;
export type BlogCategoriesResponse = StatisticCategoriesResponse;
