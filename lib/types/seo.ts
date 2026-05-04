// SEO Management Types

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface SitemapData {
  entries: SitemapEntry[];
  totalUrls: number;
  lastGenerated: string;
}

export interface RobotsTxtData {
  content: string;
  lastModified: string;
}

export interface SEOStats {
  totalIndexedPages: number;
  pagesWithMetaDescription: number;
  pagesWithKeywords: number;
  pagesWithOGImage: number;
  pagesWithSchema: number;
  averageMetaTitleLength: number;
  averageMetaDescriptionLength: number;
}

// API Response types
export interface SitemapResponse {
  sitemap: SitemapData;
  success: boolean;
  message?: string;
}

export interface RobotsTxtResponse {
  robots: RobotsTxtData;
  success: boolean;
  message?: string;
}

export interface SEOStatsResponse {
  stats: SEOStats;
  success: boolean;
}
