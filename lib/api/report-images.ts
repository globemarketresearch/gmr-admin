/**
 * Report Images API
 * Handles image uploads, retrieval, and management for reports
 */

import { apiClient } from './client';
import type { ApiResponse } from '@/lib/types/reports';
import type {
  ReportImage,
  ReportImageMetadataUpdate,
} from '@/lib/types/reports';

// API Response structure (snake_case from backend)
interface ApiReportImage {
  id: number;
  report_id: number;
  cloudflare_image_id?: string;
  image_url: string;
  title?: string;
  is_active: boolean;
  uploaded_by?: number;
  created_at: string;
  updated_at: string;
}

// API Response for single image
interface ReportImageApiResponse extends ApiResponse<ApiReportImage> {
  data: ApiReportImage;
}

// API Response for list of images
interface ReportImagesApiResponse extends ApiResponse<ApiReportImage[]> {
  data: ApiReportImage[];
}

/**
 * Transform API response from snake_case to camelCase
 */
function transformReportImage(apiImage: ApiReportImage): ReportImage {
  return {
    id: apiImage.id,
    reportId: apiImage.report_id,
    imageUrl: apiImage.image_url,
    title: apiImage.title,
    isActive: apiImage.is_active,
    createdAt: apiImage.created_at,
    updatedAt: apiImage.updated_at,
  };
}

/**
 * Fetch all images for a report
 * @param reportId - The report ID
 * @param active - Optional filter by active status
 * @returns Promise with array of report images
 */
export async function fetchReportImages(
  reportId: number | string,
  active?: boolean
): Promise<ReportImage[]> {
  const params: Record<string, unknown> = {};
  if (active !== undefined) {
    params.active = active;
  }

  const response = await apiClient.get<ReportImagesApiResponse>(
    `/v1/reports/${reportId}/images`,
    { params }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch report images');
  }

  return (response.data || []).map(transformReportImage);
}

/**
 * Upload an image for a report
 * @param reportId - The report ID
 * @param file - The image file to upload
 * @param title - Optional title for the image
 * @returns Promise with uploaded image details
 */
export async function uploadReportImage(
  reportId: number | string,
  file: File,
  title?: string
): Promise<ReportImage> {
  const formData = new FormData();
  formData.append('image', file);
  if (title) {
    formData.append('title', title);
  }

  const response = await apiClient.upload<ReportImageApiResponse>(
    `/v1/reports/${reportId}/images`,
    formData
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to upload image');
  }

  return transformReportImage(response.data);
}

/**
 * Get a single report image by ID
 * @param imageId - The image ID
 * @returns Promise with image details
 */
export async function fetchReportImage(imageId: number | string): Promise<ReportImage> {
  const response = await apiClient.get<ReportImageApiResponse>(`/v1/reports/images/${imageId}`);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch image');
  }

  return transformReportImage(response.data);
}

/**
 * Update image metadata (title, is_active)
 * @param imageId - The image ID
 * @param metadata - Metadata to update (camelCase will be converted to snake_case)
 * @returns Promise with updated image details
 */
export async function updateReportImageMetadata(
  imageId: number | string,
  metadata: ReportImageMetadataUpdate
): Promise<ReportImage> {
  // Transform camelCase to snake_case for API
  const apiMetadata: Record<string, unknown> = {};
  if (metadata.title !== undefined) {
    apiMetadata.title = metadata.title;
  }
  if (metadata.isActive !== undefined) {
    apiMetadata.is_active = metadata.isActive;
  }

  const response = await apiClient.patch<ReportImageApiResponse>(
    `/v1/reports/images/${imageId}`,
    apiMetadata
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update image metadata');
  }

  return transformReportImage(response.data);
}

/**
 * Delete a report image (soft delete - sets is_active=false)
 * @param imageId - The image ID
 * @returns Promise that resolves when deleted
 */
export async function deleteReportImage(imageId: number | string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/v1/reports/images/${imageId}`
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete image');
  }
}
