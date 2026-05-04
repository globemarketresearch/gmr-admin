/**
 * Reports API Wrapper
 * Provides backward compatibility with existing components
 * while using the new swagger-aligned API
 */

import type {
  ReportsResponse,
  ReportFilters,
  ReportResponse,
  ReportFormData,
  Report,
  ReportFormat,
  TableOfContentsStructure,
  KeyPlayer,
} from '@/lib/types/reports';
import * as reportsApi from './reports.api';
import type { ApiReport, ApiReportFilters } from '@/lib/types/api-types';
import { apiClient } from './client';

// ============ Helper Functions ============

/**
 * Converts a date string from "YYYY-MM-DD" format to RFC3339 format expected by the backend
 * @param dateString Date string in "YYYY-MM-DD" format
 * @returns Date string in RFC3339 format "YYYY-MM-DDTHH:MM:SSZ" or undefined if input is invalid
 */
function convertDateToRFC3339(dateString: string | undefined): string | undefined {
  if (!dateString) return undefined;

  // If already in RFC3339 format, return as is
  if (dateString.includes('T')) return dateString;

  // Convert "YYYY-MM-DD" to "YYYY-MM-DDT00:00:00Z"
  return `${dateString}T00:00:00Z`;
}

/**
 * Converts TOC structure to JSON string for backend storage
 * @param toc Table of Contents structure
 * @returns JSON string
 */
function convertTOCToJson(toc?: TableOfContentsStructure): string {
  if (!toc || !toc.chapters || toc.chapters.length === 0) {
    return JSON.stringify({ chapters: [] });
  }
  return JSON.stringify(toc);
}

/**
 * Converts JSON string TOC from backend to structured format
 * @param json JSON string from backend
 * @returns Structured TOC object
 */
function convertTOCFromJson(json: string | undefined): TableOfContentsStructure {
  if (!json) return { chapters: [] };

  try {
    const parsed = JSON.parse(json);
    // Validate that it has the expected structure
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.chapters)) {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse TOC JSON:', error);
  }

  // Return empty structure if parsing fails
  return { chapters: [] };
}

/**
 * Converts key players array to JSON string for backend storage
 * @param players Array of key players
 * @returns JSON string
 */
function convertKeyPlayersToJson(players: KeyPlayer[] | undefined): string {
  if (!players || players.length === 0) return JSON.stringify([]);
  return JSON.stringify(players);
}

/**
 * Converts JSON string key players from backend to array
 * @param json JSON string from backend
 * @returns Array of key players
 */
function convertKeyPlayersFromJson(json: string | undefined): KeyPlayer[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    console.error('Failed to parse key players JSON:', error);
  }
  return [];
}

// ============ Helper: Convert API types to Legacy types ============
function convertApiReportToLegacy(apiReport: ApiReport): Report {
  return {
    id: String(apiReport.id),
    title: apiReport.title,
    slug: apiReport.slug,
    summary: apiReport.summary || '',
    description: apiReport.description,
    category: apiReport.category_name || String(apiReport.category_id || ''),
    categoryId: apiReport.category_id,
    geography: apiReport.geography || [],
    publishDate: apiReport.publish_date,
    scheduled_publish_enabled: apiReport.scheduled_publish_enabled,
    price: apiReport.price || 0,
    discountedPrice: apiReport.discounted_price || 0,
    currency: apiReport.currency,
    status: apiReport.status,
    pageCount: apiReport.page_count,
    formats: apiReport.formats as ReportFormat[],
    marketMetrics: apiReport.market_metrics,
    authorIds: apiReport.author_ids?.map(String),
    sections: {
      marketDetails: apiReport.sections?.marketDetails || '',
      tableOfContents: convertTOCFromJson(apiReport.sections?.tableOfContents),
      keyPlayers: convertKeyPlayersFromJson(apiReport.sections?.keyPlayers),
    },
    faqs: apiReport.faqs,
    metadata: {
      ...(apiReport.metadata || {}),
      // Merge legacy SEO fields if metadata object doesn't have them
      metaTitle: apiReport.metadata?.metaTitle || apiReport.meta_title,
      metaDescription: apiReport.metadata?.metaDescription || apiReport.meta_description,
      keywords:
        apiReport.metadata?.keywords ||
        (apiReport.meta_keywords
          ? apiReport.meta_keywords
              .split(',')
              .map(k => k.trim())
              .filter(k => k)
          : []),
    },
    thumbnailUrl: apiReport.thumbnail_url,
    isFeatured: apiReport.is_featured,
    internalNotes: apiReport.internal_notes,
    internalLinks: apiReport.internal_links,
    createdAt: apiReport.created_at,
    updatedAt: apiReport.updated_at,
    deletedAt: apiReport.deleted_at,
    author: { id: '', email: '', name: '' },
  };
}

function convertLegacyFiltersToApi(filters?: ReportFilters): ApiReportFilters {
  if (!filters) return {};

  return {
    page: filters.page,
    limit: filters.limit,
    status: filters.status,
    category: filters.category,
    geography: filters.geography,
    search: filters.search,
  };
}

// ============ Public API Functions (Legacy Compatible) ============

export async function fetchReports(filters?: ReportFilters): Promise<ReportsResponse> {
  const apiFilters = convertLegacyFiltersToApi(filters);
  const response = await reportsApi.fetchReports(apiFilters);

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch reports');
  }

  // Handle null data as empty array
  const reports = response.data ? response.data.map(convertApiReportToLegacy) : [];

  return {
    reports,
    total: response.meta?.total || 0,
    page: response.meta?.page || 1,
    limit: response.meta?.limit || 10,
    totalPages: response.meta?.total_pages || 0,
  };
}

export async function fetchReportBySlug(slug: string): Promise<ReportResponse> {
  const response = await reportsApi.fetchReportBySlug(slug);

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch report');
  }

  if (!response.data) {
    throw new Error('Report not found');
  }

  return {
    report: convertApiReportToLegacy(response.data),
  };
}

export async function fetchReportById(id: number): Promise<ReportResponse> {
  const response = await reportsApi.fetchReportById(id);

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch report');
  }

  if (!response.data) {
    throw new Error('Report not found');
  }

  return {
    report: convertApiReportToLegacy(response.data),
  };
}

export async function createReport(data: ReportFormData): Promise<ReportResponse> {
  // Convert form data to API format
  const apiData: Partial<ApiReport> = {
    // Mandatory fields
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    category_id: Number(data.category_id),
    geography: data.geography,
    sections: {
      marketDetails: data.sections.marketDetails,
      tableOfContents: convertTOCToJson(data.sections.tableOfContents),
      keyPlayers: convertKeyPlayersToJson(data.sections.keyPlayers),
    },

    // Optional fields
    description: data.description,
    thumbnail_url: data.thumbnailUrl,
    publish_date: convertDateToRFC3339(data.publishDate),
    price: data.price,
    discounted_price: data.discountedPrice,
    currency: data.currency,
    status: data.status,
    page_count: data.pageCount,
    formats: data.formats,
    market_metrics: data.marketMetrics,
    author_ids: data.authorIds?.map(Number),
    faqs: data.faqs,
    metadata: data.metadata,
    is_featured: data.isFeatured,
    internal_notes: data.internalNotes,
    internal_links: data.internalLinks,

    // Legacy SEO fields (mapped from metadata object)
    meta_title: data.metadata?.metaTitle,
    meta_description: data.metadata?.metaDescription,
    meta_keywords: data.metadata?.keywords?.join(', '),
  };

  const response = await reportsApi.createReport(apiData);

  if (!response.success) {
    throw new Error(response.error || 'Failed to create report');
  }

  if (!response.data) {
    throw new Error('No report data returned from server');
  }

  return {
    report: convertApiReportToLegacy(response.data),
  };
}

export async function updateReport(
  id: string,
  data: Partial<ReportFormData>
): Promise<ReportResponse> {
  // Convert form data to API format
  const apiData: Partial<ApiReport> = {};

  // Only include fields that are present in the update data
  if (data.title) apiData.title = data.title;
  if (data.slug) apiData.slug = data.slug;
  if (data.summary) apiData.summary = data.summary;
  if (data.description !== undefined) apiData.description = data.description;
  if (data.category_id) apiData.category_id = Number(data.category_id);
  if (data.geography) apiData.geography = data.geography;
  if (data.publishDate !== undefined) apiData.publish_date = convertDateToRFC3339(data.publishDate);
  if (data.price !== undefined) apiData.price = data.price;
  if (data.discountedPrice !== undefined) apiData.discounted_price = data.discountedPrice;
  if (data.currency !== undefined) apiData.currency = data.currency;
  if (data.status) apiData.status = data.status;
  if (data.pageCount !== undefined) apiData.page_count = data.pageCount;
  if (data.formats) apiData.formats = data.formats;
  if (data.marketMetrics) apiData.market_metrics = data.marketMetrics;
  if (data.authorIds) apiData.author_ids = data.authorIds.map(Number);
  if (data.sections) {
    apiData.sections = {
      marketDetails: data.sections.marketDetails,
      tableOfContents: convertTOCToJson(data.sections.tableOfContents),
      keyPlayers: convertKeyPlayersToJson(data.sections.keyPlayers),
    };
  }
  if (data.faqs) apiData.faqs = data.faqs;
  if (data.metadata) {
    apiData.metadata = data.metadata;
    // Also set legacy SEO fields
    apiData.meta_title = data.metadata.metaTitle;
    apiData.meta_description = data.metadata.metaDescription;
    apiData.meta_keywords = data.metadata.keywords?.join(', ');
  }
  if (data.thumbnailUrl !== undefined) apiData.thumbnail_url = data.thumbnailUrl;
  if (data.isFeatured !== undefined) apiData.is_featured = data.isFeatured;
  if (data.internalNotes !== undefined) apiData.internal_notes = data.internalNotes;
  if (data.internalLinks !== undefined) apiData.internal_links = data.internalLinks;

  const response = await reportsApi.updateReport(Number(id), apiData);

  if (!response.success) {
    throw new Error(response.error || 'Failed to update report');
  }

  if (!response.data) {
    throw new Error('No report data returned from server');
  }

  return {
    report: convertApiReportToLegacy(response.data),
  };
}

export async function deleteReport(id: string): Promise<void> {
  const response = await reportsApi.deleteReport(Number(id));

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete report');
  }
}

export async function softDeleteReport(id: string): Promise<void> {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    throw new Error('Invalid report ID');
  }

  const response = await reportsApi.softDeleteReport(numericId);
  if (!response.success) {
    throw new Error(response.error || 'Failed to move report to trash');
  }
}

export async function restoreReport(id: string): Promise<void> {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    throw new Error('Invalid report ID');
  }

  const response = await reportsApi.restoreReport(numericId);
  if (!response.success) {
    throw new Error(response.error || 'Failed to restore report');
  }
}

export async function fetchTrashedReports(filters?: ReportFilters): Promise<ReportsResponse> {
  const apiFilters = convertLegacyFiltersToApi(filters);
  const response = await reportsApi.fetchTrashedReports(apiFilters);

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch trashed reports');
  }

  // Handle null data as empty array
  const reports = response.data ? response.data.map(convertApiReportToLegacy) : [];

  return {
    reports,
    total: response.meta?.total || 0,
    page: response.meta?.page || 1,
    limit: response.meta?.limit || 10,
    totalPages: response.meta?.total_pages || 0,
  };
}

/**
 * Schedule a report to be published at a specific date/time
 */
export async function schedulePublish(
  id: string | number,
  publishDate: Date
): Promise<{ report: Report }> {
  const response = await apiClient.patch<{ report: ApiReport }>(
    `/v1/reports/${id}/schedule`,
    { publishDate: publishDate.toISOString() },
    { requiresAuth: true }
  );
  const report = convertApiReportToLegacy(response.report);
  return { report };
}

/**
 * Cancel scheduled publishing for a report
 */
export async function cancelScheduledPublish(id: string | number): Promise<{ report: Report }> {
  const response = await apiClient.patch<{ report: ApiReport }>(
    `/v1/reports/${id}/cancel-schedule`,
    {},
    { requiresAuth: true }
  );
  const report = convertApiReportToLegacy(response.report);
  return { report };
}

/**
 * Fetch lightweight report data for internal link suggestions
 */
export async function fetchLinkSuggestions(): Promise<reportsApi.LinkSuggestionItem[]> {
  const response = await reportsApi.fetchLinkSuggestions();
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch link suggestions');
  }
  return response.data;
}
