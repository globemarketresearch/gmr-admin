import type { ApiResponse, ApiMeta } from './reports';

export interface MediaMention {
  id: number;
  title: string;
  link?: string;
  imageUrl?: string;
  displayOrder: number;
  reportId?: number | null;
  reportLinkText?: string;
  reportSlug?: string;
  reportTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaMentionFormData {
  title: string;
  link?: string;
  imageUrl?: string;
  displayOrder?: number;
  reportId?: number | null;
  reportLinkText?: string;
}

export interface MediaMentionsResponse extends ApiResponse<MediaMention[]> {
  data: MediaMention[];
  meta: ApiMeta;
}

export interface MediaMentionResponse extends ApiResponse<MediaMention> {
  data: MediaMention;
}
