import { apiClient } from './client';
import { fetchAuthors } from './authors';
import { fetchCategories, type Category } from './categories';
import type {
  StatisticsResponse,
  StatisticFilters,
  StatisticResponse,
  Statistic,
  ApiStatistic,
  CreateStatisticRequest,
  UpdateStatisticRequest,
  StatisticTag,
  StatisticFormData,
} from '@/lib/types/statistics';
import type { ReportAuthor } from '@/lib/types/reports';
import { WORDS_PER_MINUTE } from '@/lib/config/statistics';

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
 * Transform API statistic to frontend Statistic format
 */
async function transformApiStatisticToStatistic(apiStatistic: ApiStatistic): Promise<Statistic> {
  const categories = await getCategories();

  // Use author from API response directly, or fallback to fetching from cache
  let author: ReportAuthor;
  if (apiStatistic.author) {
    author = apiStatistic.author;
  } else {
    // Fallback to cache if author is not in API response (backward compatibility)
    const authors = await getAuthors();
    author = authors.find(a => a.id === apiStatistic.authorId) || {
      id: apiStatistic.authorId,
      name: 'Unknown Author',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Prefer populated category from API, fallback to cache
  let categoryName: string;
  if (apiStatistic.category) {
    categoryName = apiStatistic.category.name;
  } else {
    const category = categories.find(c => c.id === apiStatistic.categoryId);
    categoryName = category?.name || `Category ${apiStatistic.categoryId}`;
  }

  // Handle reviewedBy if needed
  let reviewedByUserRef: { id: string; email: string; name?: string } | undefined;
  if (apiStatistic.reviewedBy) {
    const authors = await getAuthors();
    const reviewedByAuthor = authors.find(a => a.id === apiStatistic.reviewedBy);
    reviewedByUserRef = reviewedByAuthor
      ? {
          id: String(reviewedByAuthor.id),
          email: '',
          name: reviewedByAuthor.name,
        }
      : undefined;
  }

  return {
    id: String(apiStatistic.id),
    title: apiStatistic.title,
    slug: apiStatistic.slug,
    excerpt: apiStatistic.excerpt,
    content: apiStatistic.content,
    categoryId: apiStatistic.categoryId,
    categoryName: categoryName,
    tags: apiStatistic.tags,
    author,
    authorId: apiStatistic.authorId,
    status: apiStatistic.status,
    publishDate: apiStatistic.publishDate,
    readingTime: calculateReadingTime(apiStatistic.content),
    viewCount: 0, // Not provided by API, set to 0
    location: apiStatistic.location,
    metadata: apiStatistic.metadata || { keywords: [] },
    createdAt: apiStatistic.createdAt,
    updatedAt: apiStatistic.updatedAt,
    reviewedBy: reviewedByUserRef,
    reviewedAt: apiStatistic.reviewedAt,
  };
}

// Statistic CRUD operations

/**
 * Fetches all statistics with optional filtering
 */
export async function fetchStatistics(filters?: StatisticFilters): Promise<StatisticsResponse> {
  const response = await apiClient.get<{
    blogs: ApiStatistic[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>('/v1/blogs', {
    params: filters as Record<string, unknown>,
  });

  const statistics = await Promise.all(
    response.blogs.map(apiStatistic => transformApiStatisticToStatistic(apiStatistic))
  );

  return {
    statistics,
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
}

// Legacy alias
export const fetchBlogs = async (filters?: StatisticFilters) => {
  const result = await fetchStatistics(filters);
  return {
    blogs: result.statistics,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

/**
 * Fetches a single statistic by ID
 */
export async function fetchStatisticById(id: string | number): Promise<StatisticResponse> {
  const response = await apiClient.get<{ blog: ApiStatistic }>(`/v1/blogs/${id}`);
  const statistic = await transformApiStatisticToStatistic(response.blog);

  return { statistic };
}

// Legacy alias
export const fetchBlogById = async (id: string | number) => {
  const result = await fetchStatisticById(id);
  return { blog: result.statistic };
};

/**
 * Creates a new statistic
 */
export async function createStatistic(data: CreateStatisticRequest): Promise<StatisticResponse> {
  const response = await apiClient.post<{ blog: ApiStatistic }>('/v1/blogs', data);
  const statistic = await transformApiStatisticToStatistic(response.blog);

  return { statistic };
}

// Legacy alias
export const createBlog = async (data: CreateStatisticRequest) => {
  const result = await createStatistic(data);
  return { blog: result.statistic };
};

/**
 * Updates an existing statistic
 */
export async function updateStatistic(
  id: string | number,
  data: UpdateStatisticRequest
): Promise<StatisticResponse> {
  const response = await apiClient.put<{ blog: ApiStatistic }>(`/v1/blogs/${id}`, data);
  const statistic = await transformApiStatisticToStatistic(response.blog);

  return { statistic };
}

// Legacy alias
export const updateBlog = async (id: string | number, data: UpdateStatisticRequest) => {
  const result = await updateStatistic(id, data);
  return { blog: result.statistic };
};

/**
 * Deletes a statistic
 */
export async function deleteStatistic(id: string | number): Promise<void> {
  await apiClient.delete(`/v1/blogs/${id}`);
}

// Legacy alias
export const deleteBlog = deleteStatistic;

// Workflow operations

/**
 * Submit statistic for review
 */
export async function submitForReview(id: string | number): Promise<StatisticResponse> {
  const response = await apiClient.patch<{ blog: ApiStatistic }>(`/v1/blogs/${id}/submit-review`);
  const statistic = await transformApiStatisticToStatistic(response.blog);

  return { statistic };
}

/**
 * Publish a statistic
 */
export async function publishStatistic(id: string | number): Promise<StatisticResponse> {
  const response = await apiClient.patch<{ blog: ApiStatistic }>(`/v1/blogs/${id}/publish`);
  const statistic = await transformApiStatisticToStatistic(response.blog);

  return { statistic };
}

// Legacy alias
export const publishBlog = publishStatistic;

/**
 * Unpublish a statistic
 */
export async function unpublishStatistic(id: string | number): Promise<StatisticResponse> {
  const response = await apiClient.patch<{ blog: ApiStatistic }>(`/v1/blogs/${id}/unpublish`);
  const statistic = await transformApiStatisticToStatistic(response.blog);

  return { statistic };
}

// Legacy alias
export const unpublishBlog = unpublishStatistic;

/**
 * Soft delete a statistic (move to trash)
 */
export async function softDeleteStatistic(id: string | number): Promise<void> {
  await apiClient.patch(`/v1/blogs/${id}/soft-delete`);
}

// Legacy alias
export const softDeleteBlog = softDeleteStatistic;

/**
 * Restore a soft deleted statistic
 */
export async function restoreStatistic(id: string | number): Promise<void> {
  await apiClient.patch(`/v1/blogs/${id}/restore`);
}

// Legacy alias
export const restoreBlog = restoreStatistic;

/**
 * Schedule a statistic to be published at a specific date/time
 */
export async function schedulePublish(
  id: string | number,
  publishDate: Date
): Promise<StatisticResponse> {
  const response = await apiClient.patch<{ blog: ApiStatistic }>(`/v1/blogs/${id}/schedule`, {
    publishDate: publishDate.toISOString(),
  });
  const statistic = await transformApiStatisticToStatistic(response.blog);
  return { statistic };
}

/**
 * Cancel scheduled publishing for a statistic
 */
export async function cancelScheduledPublish(id: string | number): Promise<StatisticResponse> {
  const response = await apiClient.patch<{ blog: ApiStatistic }>(`/v1/blogs/${id}/cancel-schedule`);
  const statistic = await transformApiStatisticToStatistic(response.blog);
  return { statistic };
}

/**
 * Fetches all trashed statistics with optional filtering
 */
export async function fetchTrashedStatistics(
  filters?: StatisticFilters
): Promise<StatisticsResponse> {
  const response = await apiClient.get<{
    blogs: ApiStatistic[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>('/v1/blogs', {
    params: { ...filters, deleted: 'true' } as Record<string, unknown>,
  });

  const statistics = await Promise.all(
    response.blogs.map(apiStatistic => transformApiStatisticToStatistic(apiStatistic))
  );

  return {
    statistics,
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
}

// Legacy alias
export const fetchTrashedBlogs = async (filters?: StatisticFilters) => {
  const result = await fetchTrashedStatistics(filters);
  return {
    blogs: result.statistics,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

// Helper exports for form handling

/**
 * Transform form data to create request
 */
export function formDataToCreateRequest(formData: StatisticFormData): CreateStatisticRequest {
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
export function formDataToUpdateRequest(
  formData: Partial<StatisticFormData>
): UpdateStatisticRequest {
  const request: UpdateStatisticRequest = {};

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
export function clearStatisticCache(): void {
  authorsCache = [];
  categoriesCache = [];
}

// Legacy alias
export const clearBlogCache = clearStatisticCache;

// Tag operations

/**
 * Fetches all available tags
 */
export async function fetchTags(): Promise<{ tags: StatisticTag[] }> {
  try {
    const response = await apiClient.get<{ tags: StatisticTag[] }>('/v1/blog-tags');
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
export async function createTag(name: string): Promise<{ tag: StatisticTag }> {
  const response = await apiClient.post<{ tag: StatisticTag }>('/v1/blog-tags', { name });
  return { tag: response.tag };
}
