/**
 * Categories API Wrapper
 * Provides a simple interface to fetch categories from the API
 */

import * as categoriesApi from './categories.api';
import type { ApiCategory } from '@/lib/types/api-types';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryResponse {
  category: Category;
}

// ============ Helper: Convert API types to UI types ============
function convertApiCategoryToCategory(apiCategory: ApiCategory): Category {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    slug: apiCategory.slug,
    description: apiCategory.description,
    imageUrl: apiCategory.image_url,
    isActive: apiCategory.is_active,
    createdAt: apiCategory.created_at,
    updatedAt: apiCategory.updated_at,
  };
}

// ============ Public API Functions ============

/**
 * Fetches all active categories
 */
export async function fetchCategories(options?: {
  page?: number;
  limit?: number;
}): Promise<CategoriesResponse> {
  const response = await categoriesApi.fetchCategories(options);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch categories');
  }

  return {
    categories: response.data.map(convertApiCategoryToCategory),
    total: response.meta?.total || 0,
    page: response.meta?.page || 1,
    limit: response.meta?.limit || 20,
    totalPages: response.meta?.total_pages || 0,
  };
}

/**
 * Fetches a single category by slug
 */
export async function fetchCategoryBySlug(slug: string): Promise<CategoryResponse> {
  const response = await categoriesApi.fetchCategoryBySlug(slug);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch category');
  }

  return {
    category: convertApiCategoryToCategory(response.data),
  };
}

/**
 * Uploads or replaces the feature image for a category
 */
export async function uploadCategoryImage(
  id: number,
  file: File
): Promise<CategoryResponse> {
  const response = await categoriesApi.uploadCategoryImage(id, file);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to upload category image');
  }

  return {
    category: convertApiCategoryToCategory(response.data),
  };
}
