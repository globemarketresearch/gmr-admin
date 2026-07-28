/**
 * Industry News Images API
 * Handles image uploads, retrieval, and management for industry news articles
 */

import { apiClient } from './client';
import type { ApiResponse } from '@/lib/types/reports';
import type { ReportImage, ReportImageMetadataUpdate } from '@/lib/types/reports';

interface ApiIndustryNewsImage {
  id: number;
  industry_news_id: number;
  image_url: string;
  title?: string;
  is_active: boolean;
  uploaded_by?: number;
  created_at: string;
  updated_at: string;
}

interface IndustryNewsImageApiResponse extends ApiResponse<ApiIndustryNewsImage> {
  data: ApiIndustryNewsImage;
}

interface IndustryNewsImagesApiResponse extends ApiResponse<ApiIndustryNewsImage[]> {
  data: ApiIndustryNewsImage[];
}

function transformIndustryNewsImage(apiImage: ApiIndustryNewsImage): ReportImage {
  return {
    id: apiImage.id,
    reportId: apiImage.industry_news_id,
    imageUrl: apiImage.image_url,
    title: apiImage.title,
    isActive: apiImage.is_active,
    createdAt: apiImage.created_at,
    updatedAt: apiImage.updated_at,
  };
}

export async function fetchIndustryNewsImages(
  industryNewsId: number | string,
  active?: boolean
): Promise<ReportImage[]> {
  const params: Record<string, unknown> = {};
  if (active !== undefined) {
    params.active = active;
  }

  const response = await apiClient.get<IndustryNewsImagesApiResponse>(
    `/v1/industry-news/${industryNewsId}/images`,
    { params }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch industry news images');
  }

  return (response.data || []).map(transformIndustryNewsImage);
}

export async function uploadIndustryNewsImage(
  industryNewsId: number | string,
  file: File,
  title?: string
): Promise<ReportImage> {
  const formData = new FormData();
  formData.append('image', file);
  if (title) {
    formData.append('title', title);
  }

  const response = await apiClient.upload<IndustryNewsImageApiResponse>(
    `/v1/industry-news/${industryNewsId}/images`,
    formData
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to upload image');
  }

  return transformIndustryNewsImage(response.data);
}

export async function updateIndustryNewsImageMetadata(
  imageId: number | string,
  metadata: ReportImageMetadataUpdate
): Promise<ReportImage> {
  const apiMetadata: Record<string, unknown> = {};
  if (metadata.title !== undefined) {
    apiMetadata.title = metadata.title;
  }
  if (metadata.isActive !== undefined) {
    apiMetadata.is_active = metadata.isActive;
  }

  const response = await apiClient.patch<IndustryNewsImageApiResponse>(
    `/v1/industry-news/images/${imageId}`,
    apiMetadata
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update image metadata');
  }

  return transformIndustryNewsImage(response.data);
}

export async function deleteIndustryNewsImage(imageId: number | string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/v1/industry-news/images/${imageId}`
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete image');
  }
}
