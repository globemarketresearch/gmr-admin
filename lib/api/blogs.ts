import { apiClient } from './client';
import { fetchAuthors } from './authors';
import { fetchCategories, type Category } from './categories';
import type {
  BlogsResponse,
  BlogFilters,
  BlogResponse,
  Blog,
  ApiBlog,
  CreateBlogRequest,
  UpdateBlogRequest,
  BlogTag,
  BlogFormData,
} from '@/lib/types/blogs';
import type { ReportAuthor } from '@/lib/types/reports';
import { WORDS_PER_MINUTE } from '@/lib/config/blogs';

// Cache for authors and categories to avoid multiple API calls
let authorsCache: ReportAuthor[] = [];
let categoriesCache: Category[] = [];

/**
 * Calculate reading time based on word count
 */
function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}

/**
 * Get or load authors cache
 */
async function getAuthors(): Promise<ReportAuthor[]> {
  if (authorsCache.length === 0) {
    try {
      const response = await fetchAuthors();
      authorsCache = response.data || [];
    } catch (error) {
      console.error('Failed to fetch authors:', error);
    }
  }
  return authorsCache;
}

/**
 * Get or load categories cache
 */
async function getCategories(): Promise<Category[]> {
  if (categoriesCache.length === 0) {
    try {
      const response = await fetchCategories({ limit: 100 });
      categoriesCache = response.categories || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback to empty array if endpoint doesn't exist
      categoriesCache = [];
    }
  }
  return categoriesCache;
}

/**
 * Transform API blog to frontend Blog format
 */
async function transformApiBlogToBlog(apiBlog: ApiBlog): Promise<Blog> {
  const categories = await getCategories();

  // Use author from API response directly, or fallback to fetching from cache
  let author: ReportAuthor;
  if (apiBlog.author) {
    author = apiBlog.author;
  } else {
    // Fallback to cache if author is not in API response (backward compatibility)
    const authors = await getAuthors();
    author = authors.find(a => a.id === apiBlog.authorId) || {
      id: apiBlog.authorId,
      name: 'Unknown Author',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Prefer populated category from API, fallback to cache
  let categoryName: string;
  if (apiBlog.category) {
    categoryName = apiBlog.category.name;
  } else {
    const category = categories.find(c => c.id === apiBlog.categoryId);
    categoryName = category?.name || `Category ${apiBlog.categoryId}`;
  }

  // Handle reviewedBy if needed
  let reviewedByUserRef: { id: string; email: string; name?: string } | undefined;
  if (apiBlog.reviewedBy) {
    const authors = await getAuthors();
    const reviewedByAuthor = authors.find(a => a.id === apiBlog.reviewedBy);
    reviewedByUserRef = reviewedByAuthor
      ? {
          id: String(reviewedByAuthor.id),
          email: '',
          name: reviewedByAuthor.name,
        }
      : undefined;
  }

  return {
    id: String(apiBlog.id),
    title: apiBlog.title,
    slug: apiBlog.slug,
    excerpt: apiBlog.excerpt,
    content: apiBlog.content,
    categoryId: apiBlog.categoryId,
    categoryName: categoryName,
    tags: apiBlog.tags,
    author,
    authorId: apiBlog.authorId,
    status: apiBlog.status,
    publishDate: apiBlog.publishDate,
    readingTime: calculateReadingTime(apiBlog.content),
    viewCount: 0, // Not provided by API, set to 0
    location: apiBlog.location,
    metadata: apiBlog.metadata || { keywords: [] },
    createdAt: apiBlog.createdAt,
    updatedAt: apiBlog.updatedAt,
    reviewedBy: reviewedByUserRef,
    reviewedAt: apiBlog.reviewedAt,
  };
}

// Blog CRUD operations

/**
 * Fetches all blogs with optional filtering
 */
export async function fetchBlogs(filters?: BlogFilters): Promise<BlogsResponse> {
  const response = await apiClient.get<{
    blogs: ApiBlog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>('/v1/blogs', {
    params: filters as Record<string, unknown>,
  });

  const blogs = await Promise.all(response.blogs.map(apiBlog => transformApiBlogToBlog(apiBlog)));

  return {
    blogs,
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
}

/**
 * Fetches a single blog by ID
 */
export async function fetchBlogById(id: string | number): Promise<BlogResponse> {
  const response = await apiClient.get<{ blog: ApiBlog }>(`/v1/blogs/${id}`);
  const blog = await transformApiBlogToBlog(response.blog);

  return { blog };
}

/**
 * Creates a new blog
 */
export async function createBlog(data: CreateBlogRequest): Promise<BlogResponse> {
  const response = await apiClient.post<{ blog: ApiBlog }>('/v1/blogs', data);
  const blog = await transformApiBlogToBlog(response.blog);

  return { blog };
}

/**
 * Updates an existing blog
 */
export async function updateBlog(
  id: string | number,
  data: UpdateBlogRequest
): Promise<BlogResponse> {
  const response = await apiClient.put<{ blog: ApiBlog }>(`/v1/blogs/${id}`, data);
  const blog = await transformApiBlogToBlog(response.blog);

  return { blog };
}

/**
 * Deletes a blog
 */
export async function deleteBlog(id: string | number): Promise<void> {
  await apiClient.delete(`/v1/blogs/${id}`);
}

// Workflow operations

/**
 * Submit blog for review
 */
export async function submitForReview(id: string | number): Promise<BlogResponse> {
  const response = await apiClient.patch<{ blog: ApiBlog }>(`/v1/blogs/${id}/submit-review`);
  const blog = await transformApiBlogToBlog(response.blog);

  return { blog };
}

/**
 * Publish a blog
 */
export async function publishBlog(id: string | number): Promise<BlogResponse> {
  const response = await apiClient.patch<{ blog: ApiBlog }>(`/v1/blogs/${id}/publish`);
  const blog = await transformApiBlogToBlog(response.blog);

  return { blog };
}

/**
 * Unpublish a blog
 */
export async function unpublishBlog(id: string | number): Promise<BlogResponse> {
  const response = await apiClient.patch<{ blog: ApiBlog }>(`/v1/blogs/${id}/unpublish`);
  const blog = await transformApiBlogToBlog(response.blog);

  return { blog };
}

/**
 * Soft delete a blog (move to trash)
 */
export async function softDeleteBlog(id: string | number): Promise<void> {
  await apiClient.patch(`/v1/blogs/${id}/soft-delete`);
}

/**
 * Restore a soft deleted blog
 */
export async function restoreBlog(id: string | number): Promise<void> {
  await apiClient.patch(`/v1/blogs/${id}/restore`);
}

/**
 * Schedule a blog to be published at a specific date/time
 */
export async function schedulePublish(
  id: string | number,
  publishDate: Date
): Promise<BlogResponse> {
  const response = await apiClient.patch<{ blog: ApiBlog }>(`/v1/blogs/${id}/schedule`, {
    publishDate: publishDate.toISOString(),
  });
  const blog = await transformApiBlogToBlog(response.blog);
  return { blog };
}

/**
 * Cancel scheduled publishing for a blog
 */
export async function cancelScheduledPublish(id: string | number): Promise<BlogResponse> {
  const response = await apiClient.patch<{ blog: ApiBlog }>(`/v1/blogs/${id}/cancel-schedule`);
  const blog = await transformApiBlogToBlog(response.blog);
  return { blog };
}

/**
 * Fetches all trashed blogs with optional filtering
 */
export async function fetchTrashedBlogs(filters?: BlogFilters): Promise<BlogsResponse> {
  const response = await apiClient.get<{
    blogs: ApiBlog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>('/v1/blogs', {
    params: { ...filters, deleted: 'true' } as Record<string, unknown>,
  });

  const blogs = await Promise.all(response.blogs.map(apiBlog => transformApiBlogToBlog(apiBlog)));

  return {
    blogs,
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
}

// Helper exports for form handling

/**
 * Transform form data to create request
 */
export function formDataToCreateRequest(formData: BlogFormData): CreateBlogRequest {
  return {
    title: formData.title,
    slug: formData.slug,
    excerpt: formData.excerpt,
    content: formData.content,
    categoryId: formData.categoryId,
    tags: formData.tags,
    authorId:
      typeof formData.authorId === 'string' ? parseInt(formData.authorId, 10) : formData.authorId,
    status: formData.status,
    publishDate: formData.publishDate,
    location: formData.location,
    metadata: formData.metadata,
  };
}

/**
 * Transform form data to update request
 */
export function formDataToUpdateRequest(formData: Partial<BlogFormData>): UpdateBlogRequest {
  const request: UpdateBlogRequest = {};

  if (formData.title !== undefined) request.title = formData.title;
  if (formData.slug !== undefined) request.slug = formData.slug;
  if (formData.excerpt !== undefined) request.excerpt = formData.excerpt;
  if (formData.content !== undefined) request.content = formData.content;
  if (formData.categoryId !== undefined) request.categoryId = formData.categoryId;
  if (formData.tags !== undefined) request.tags = formData.tags;
  if (formData.authorId !== undefined) {
    request.authorId =
      typeof formData.authorId === 'string' ? parseInt(formData.authorId, 10) : formData.authorId;
  }
  if (formData.status !== undefined) request.status = formData.status;
  if (formData.publishDate !== undefined) request.publishDate = formData.publishDate;
  if (formData.location !== undefined) request.location = formData.location;
  if (formData.metadata !== undefined) request.metadata = formData.metadata;
  if (formData.internalLinks !== undefined) request.internalLinks = formData.internalLinks;

  return request;
}

/**
 * Clear authors and categories cache
 */
export function clearBlogCache(): void {
  authorsCache = [];
  categoriesCache = [];
}

// Tag operations

/**
 * Fetches all available tags
 */
export async function fetchTags(): Promise<{ tags: BlogTag[] }> {
  try {
    const response = await apiClient.get<{ tags: BlogTag[] }>('/v1/blog-tags');
    return { tags: response.tags || [] };
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    // Fallback to empty array if endpoint doesn't exist
    return { tags: [] };
  }
}

/**
 * Creates a new tag
 */
export async function createTag(name: string): Promise<{ tag: BlogTag }> {
  const response = await apiClient.post<{ tag: BlogTag }>('/v1/blog-tags', { name });
  return { tag: response.tag };
}
