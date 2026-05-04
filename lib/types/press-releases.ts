// Re-use UserReference and ReportAuthor from reports
import type { UserReference, ReportAuthor, InternalLinkEntry } from './reports';
export type { InternalLinkEntry };

// Press Release status enum with workflow states
export type PressReleaseStatus = 'draft' | 'review' | 'published';

// Press Release tag
export interface PressReleaseTag {
  id: string;
  name: string;
  slug: string;
}

// SEO metadata for press releases (matches API spec)
export interface PressReleaseMetadata {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// Version history item
export interface PressReleaseVersion {
  id: string;
  versionNumber: number;
  summary: string;
  createdAt: string;
  author: UserReference;
  content: string;
  title: string;
  excerpt: string;
}

// API Press Release interface (matches backend response)
export interface ApiPressRelease {
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
  status: PressReleaseStatus;
  publishDate: string;
  scheduledPublishEnabled?: boolean;
  location?: string;
  reportUrl?: string;
  metadata: PressReleaseMetadata;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: number;
  reviewedAt?: string;
  deletedAt?: string;
}

// Main Press Release interface (matches API response)
export interface PressRelease {
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
  status: PressReleaseStatus;
  publishDate: string;
  scheduledPublishEnabled?: boolean;
  location?: string;
  reportUrl?: string;
  metadata: PressReleaseMetadata;
  internalLinks?: InternalLinkEntry[];
  createdAt: string;
  updatedAt: string;
  reviewedBy?: number;
  reviewedAt?: string;
  deletedAt?: string;
}

// List filters (matches API query parameters)
export interface PressReleaseFilters {
  status?: PressReleaseStatus;
  categoryId?: number; // Single category ID for filtering
  tags?: string; // Comma-separated tags
  authorId?: number;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// API response types
export interface PressReleasesResponse {
  pressReleases: PressRelease[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PressReleaseResponse {
  pressRelease: PressRelease;
}

// Form data for create (matches API CreatePressReleaseRequest)
export interface CreatePressReleaseData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number; // Single category ID for API
  tags: string; // Comma-separated tag string for API
  authorId: number;
  status: PressReleaseStatus;
  publishDate: string;
  scheduledPublishEnabled?: boolean;
  location?: string;
  reportUrl?: string;
  metadata?: PressReleaseMetadata;
}

// Form data for update (matches API UpdatePressReleaseRequest)
export interface UpdatePressReleaseData {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  categoryId?: number; // Single category ID for API
  tags?: string; // Comma-separated tag string for API
  authorId?: number;
  status?: PressReleaseStatus;
  publishDate?: string;
  scheduledPublishEnabled?: boolean;
  location?: string;
  reportUrl?: string;
  metadata?: PressReleaseMetadata;
  internalLinks?: InternalLinkEntry[];
}

// UI Form data (what the form uses before sending to API)
export interface PressReleaseFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number; // Single category ID
  tags?: string; // Comma-separated tags
  authorId: number;
  status: PressReleaseStatus;
  publishDate: string;
  scheduledPublishEnabled?: boolean;
  location?: string;
  reportUrl: string;
  metadata?: PressReleaseMetadata;
  internalLinks?: InternalLinkEntry[];
}

// Category type
export interface PressReleaseCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

// Tag list response
export interface PressReleaseTagsResponse {
  tags: PressReleaseTag[];
  total: number;
}

// Category list response
export interface PressReleaseCategoriesResponse {
  categories: PressReleaseCategory[];
  total: number;
}
