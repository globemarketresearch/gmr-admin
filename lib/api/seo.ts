import { apiClient } from './client';
import type { SitemapResponse, RobotsTxtResponse, SEOStatsResponse } from '@/lib/types/seo';

// API Functions
export async function getSitemap(): Promise<SitemapResponse> {
  return apiClient.get<SitemapResponse>('/seo/sitemap');
}

export async function regenerateSitemap(): Promise<SitemapResponse> {
  return apiClient.post<SitemapResponse>('/seo/regenerate-sitemap', {});
}

export async function getRobotsTxt(): Promise<RobotsTxtResponse> {
  return apiClient.get<RobotsTxtResponse>('/seo/robots-txt');
}

export async function updateRobotsTxt(content: string): Promise<RobotsTxtResponse> {
  return apiClient.put<RobotsTxtResponse>('/seo/robots-txt', { content });
}

export async function getSEOStats(): Promise<SEOStatsResponse> {
  return apiClient.get<SEOStatsResponse>('/seo/stats');
}
