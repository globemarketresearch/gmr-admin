import { apiClient } from './client';
import type {
  MediaMentionFormData,
  MediaMentionsResponse,
  MediaMentionResponse,
} from '@/lib/types/media-mentions';

/**
 * Fetches all media mentions
 */
export async function fetchMediaMentions(): Promise<MediaMentionsResponse> {
  return apiClient.get<MediaMentionsResponse>('/v1/media-mentions');
}

/**
 * Fetches a single media mention by ID
 */
export async function fetchMediaMentionById(id: number | string): Promise<MediaMentionResponse> {
  return apiClient.get<MediaMentionResponse>(`/v1/media-mentions/${id}`);
}

/**
 * Creates a new media mention
 */
export async function createMediaMention(
  data: MediaMentionFormData
): Promise<MediaMentionResponse> {
  return apiClient.post<MediaMentionResponse>('/v1/media-mentions', data);
}

/**
 * Updates an existing media mention
 */
export async function updateMediaMention(
  id: number | string,
  data: Partial<MediaMentionFormData>
): Promise<MediaMentionResponse> {
  return apiClient.put<MediaMentionResponse>(`/v1/media-mentions/${id}`, data);
}

/**
 * Deletes a media mention
 */
export async function deleteMediaMention(id: number | string): Promise<void> {
  return apiClient.delete(`/v1/media-mentions/${id}`);
}

/**
 * Uploads a media mention logo image
 */
export async function uploadMediaMentionImage(
  id: number | string,
  file: File
): Promise<MediaMentionResponse> {
  const formData = new FormData();
  formData.append('image', file);
  return apiClient.upload<MediaMentionResponse>(`/v1/media-mentions/${id}/image`, formData);
}

/**
 * Deletes a media mention logo image
 */
export async function deleteMediaMentionImage(id: number | string): Promise<void> {
  return apiClient.delete(`/v1/media-mentions/${id}/image`);
}
