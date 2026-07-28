import { apiClient } from './client';
import type {
  IndustryNewsesResponse,
  IndustryNewsFilters,
  IndustryNewsResponse,
  IndustryNewsFormData,
  CreateIndustryNewsData,
  UpdateIndustryNewsData,
  ApiIndustryNews,
  IndustryNews,
} from '@/lib/types/industry-news';

function transformFormDataToApi(
  data: IndustryNewsFormData
): CreateIndustryNewsData | UpdateIndustryNewsData {
  return {
    ...data,
  };
}

async function transformApiIndustryNewsToIndustryNews(
  apiIndustryNews: ApiIndustryNews
): Promise<IndustryNews> {
  return {
    ...apiIndustryNews,
  };
}

export async function fetchIndustryNewsList(
  filters?: IndustryNewsFilters
): Promise<IndustryNewsesResponse> {
  return apiClient.get<IndustryNewsesResponse>('/v1/industry-news', {
    params: filters as Record<string, unknown>,
  });
}

export async function fetchIndustryNewsById(id: number): Promise<IndustryNewsResponse> {
  return apiClient.get<IndustryNewsResponse>(`/v1/industry-news/${id}`);
}

export async function createIndustryNews(
  data: IndustryNewsFormData
): Promise<IndustryNewsResponse> {
  const apiData = transformFormDataToApi(data) as CreateIndustryNewsData;
  return apiClient.post<IndustryNewsResponse>('/v1/industry-news', apiData);
}

export async function updateIndustryNews(
  id: number,
  data: Partial<IndustryNewsFormData>
): Promise<IndustryNewsResponse> {
  const apiData: UpdateIndustryNewsData = {
    ...data,
  };
  return apiClient.put<IndustryNewsResponse>(`/v1/industry-news/${id}`, apiData);
}

export async function deleteIndustryNews(id: number): Promise<void> {
  return apiClient.delete(`/v1/industry-news/${id}`);
}

export async function submitForReview(id: number): Promise<IndustryNewsResponse> {
  return apiClient.patch<IndustryNewsResponse>(`/v1/industry-news/${id}/submit-review`);
}

export async function publishIndustryNews(id: number): Promise<IndustryNewsResponse> {
  return apiClient.patch<IndustryNewsResponse>(`/v1/industry-news/${id}/publish`);
}

export async function unpublishIndustryNews(id: number): Promise<IndustryNewsResponse> {
  return apiClient.patch<IndustryNewsResponse>(`/v1/industry-news/${id}/unpublish`);
}

export async function softDeleteIndustryNews(id: number): Promise<void> {
  return apiClient.patch(`/v1/industry-news/${id}/soft-delete`);
}

export async function restoreIndustryNews(id: number): Promise<void> {
  return apiClient.patch(`/v1/industry-news/${id}/restore`);
}

export async function schedulePublish(
  id: string | number,
  publishDate: Date
): Promise<IndustryNewsResponse> {
  const response = await apiClient.patch<{ industryNews: ApiIndustryNews }>(
    `/v1/industry-news/${id}/schedule`,
    { publishDate: publishDate.toISOString() }
  );
  const industryNews = await transformApiIndustryNewsToIndustryNews(response.industryNews);
  return { industryNews };
}

export async function cancelScheduledPublish(id: string | number): Promise<IndustryNewsResponse> {
  const response = await apiClient.patch<{ industryNews: ApiIndustryNews }>(
    `/v1/industry-news/${id}/cancel-schedule`
  );
  const industryNews = await transformApiIndustryNewsToIndustryNews(response.industryNews);
  return { industryNews };
}

export async function fetchTrashedIndustryNews(
  filters?: IndustryNewsFilters
): Promise<IndustryNewsesResponse> {
  return apiClient.get<IndustryNewsesResponse>('/v1/industry-news', {
    params: { ...filters, deleted: 'true' } as Record<string, unknown>,
  });
}
