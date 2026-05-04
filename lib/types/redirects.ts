export type RedirectType = 301 | 302 | 307 | 308 | 410 | 451;

export const REDIRECT_TYPE_LABELS: Record<RedirectType, string> = {
  301: '301 Permanent',
  302: '302 Temporary',
  307: '307 Temporary',
  308: '308 Permanent',
  410: '410 Gone',
  451: '451 Unavailable',
};

export const REDIRECT_TYPES: RedirectType[] = [301, 302, 307, 308, 410, 451];

export interface Redirect {
  id: number;
  sourceUrl: string;
  destinationUrl: string | null;
  redirectType: RedirectType;
  isEnabled: boolean;
  hitCount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateRedirectRequest {
  sourceUrl: string;
  destinationUrl?: string | null;
  redirectType: RedirectType;
  notes?: string;
}

export interface UpdateRedirectRequest {
  sourceUrl?: string;
  destinationUrl?: string | null;
  redirectType?: RedirectType;
  isEnabled?: boolean;
  notes?: string;
}

export interface RedirectFilters {
  search?: string;
  enabled?: string; // "true" | "false" | ""
  page?: number;
  limit?: number;
}

export interface RedirectsResponse {
  redirects: Redirect[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RedirectResponse {
  redirect: Redirect;
}
