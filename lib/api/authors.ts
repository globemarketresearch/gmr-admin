import { apiClient } from './client';
import type { AuthorFormData, AuthorsResponse, AuthorResponse } from '@/lib/types/reports';

/**
 * Fetches all authors
 */
export async function fetchAuthors(): Promise<AuthorsResponse> {
  return apiClient.get<AuthorsResponse>('/v1/authors');
}

/**
 * Fetches a single author by ID
 */
export async function fetchAuthorById(id: number | string): Promise<AuthorResponse> {
  return apiClient.get<AuthorResponse>(`/v1/authors/${id}`);
}

/**
 * Creates a new author
 */
export async function createAuthor(data: AuthorFormData): Promise<AuthorResponse> {
  return apiClient.post<AuthorResponse>('/v1/authors', data);
}

/**
 * Updates an existing author
 */
export async function updateAuthor(
  id: number | string,
  data: Partial<AuthorFormData>
): Promise<AuthorResponse> {
  return apiClient.put<AuthorResponse>(`/v1/authors/${id}`, data);
}

/**
 * Deletes an author
 */
export async function deleteAuthor(id: number | string): Promise<void> {
  return apiClient.delete(`/v1/authors/${id}`);
}

/**
 * Uploads an author profile image
 */
export async function uploadAuthorImage(
  id: number | string,
  file: File
): Promise<AuthorResponse> {
  const formData = new FormData();
  formData.append('image', file);
  return apiClient.upload<AuthorResponse>(`/v1/authors/${id}/image`, formData);
}

/**
 * Deletes an author profile image
 */
export async function deleteAuthorImage(id: number | string): Promise<void> {
  return apiClient.delete(`/v1/authors/${id}/image`);
}
