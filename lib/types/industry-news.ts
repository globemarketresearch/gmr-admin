// Re-use UserReference and ReportAuthor from reports
import type { UserReference, ReportAuthor, InternalLinkEntry } from './reports';
export type { InternalLinkEntry };

// Industry News status enum with workflow states
export type IndustryNewsStatus = 'draft' | 'review' | 'published';

// SEO metadata for industry news (matches API spec)
export interface IndustryNewsMetadata {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// Version history item
export interface IndustryNewsVersion {
  id: string;
  versionNumber: number;
  summary: string;
  createdAt: string;
  author: UserReference;
  content: string;
  title: string;
  excerpt: string;
}

// API Industry News interface (matches backend response)
export interface ApiIndustryNews {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML from rich text editor
  authorId: number;
  author?: ReportAuthor; // Author details populated from API
  categoryId: number; // Single category ID from API
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
  tags: string; // Comma-separated tags from API
  status: IndustryNewsStatus;
  publishDate: string;
  scheduledPublishEnabled?: boolean;
  location?: string;
  metadata: IndustryNewsMetadata;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: number;
  reviewedAt?: string;
  deletedAt?: string;
}

// Main Industry News interface (matches API response)
export interface IndustryNews {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML from rich text editor
  authorId: number;
  author?: ReportAuthor; // Author details populated from API
  categoryId: number; // Single category ID from API
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
  tags: string; // Comma-separated tags from API
  status: IndustryNewsStatus;
  publishDate: string;
  scheduledPublishEnabled?: boolean;
  location?: string;
  metadata: IndustryNewsMetadata;
  internalLinks?: InternalLinkEntry[];
  createdAt: string;
  updatedAt: string;
  reviewedBy?: number;
  reviewedAt?: string;
  deletedAt?: string;
}

// List filters (matches API query parameters)
export interface IndustryNewsFilters {
  status?: IndustryNewsStatus;
  categoryId?: number;
  tags?: string;
  authorId?: number;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// API response types
export interface IndustryNewsesResponse {
  industryNews: IndustryNews[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IndustryNewsResponse {
  industryNews: IndustryNews;
}

// Form data for create (matches API CreateIndustryNewsRequest)
export interface CreateIndustryNewsData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number;
  tags: string;
  authorId: number;
  status: IndustryNewsStatus;
  publishDate: string;
  scheduledPublishEnabled?: boolean;
  location?: string;
  metadata?: IndustryNewsMetadata;
}

// Form data for update (matches API UpdateIndustryNewsRequest)
export interface UpdateIndustryNewsData {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  categoryId?: number;
  tags?: string;
  authorId?: number;
  status?: IndustryNewsStatus;
  publishDate?: string;
  scheduledPublishEnabled?: boolean;
  location?: string;
  metadata?: IndustryNewsMetadata;
  internalLinks?: InternalLinkEntry[];
}

// UI Form data (what the form uses before sending to API)
export interface IndustryNewsFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number;
  tags?: string;
  authorId: number;
  status: IndustryNewsStatus;
  publishDate: string;
  scheduledPublishEnabled?: boolean;
  location?: string;
  metadata?: IndustryNewsMetadata;
  internalLinks?: InternalLinkEntry[];
}
