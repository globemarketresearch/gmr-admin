import { config } from '@/lib/config';
import { tokenStorage, isTokenExpired } from '@/lib/auth/token';
import type { ApiResponse as SwaggerApiResponse } from '@/lib/types/api-types';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  params?: Record<string, unknown>;
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.baseUrl = config.api.baseUrl;
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new ApiError(401, 'No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      tokenStorage.clearAll();
      throw new ApiError(401, 'Token refresh failed');
    }

    const json: SwaggerApiResponse<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }> = await response.json();

    if (!json.success || !json.data) {
      tokenStorage.clearAll();
      throw new ApiError(401, json.error || 'Token refresh failed - invalid response');
    }

    tokenStorage.setToken(json.data.access_token);
    if (json.data.refresh_token) {
      tokenStorage.setRefreshToken(json.data.refresh_token);
    }
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    let token = tokenStorage.getToken();

    if (!token) {
      throw new ApiError(401, 'No authentication token');
    }

    if (isTokenExpired(token)) {
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshToken().finally(() => {
          this.refreshPromise = null;
        });
      }
      await this.refreshPromise;
      token = tokenStorage.getToken();
      if (!token) {
        throw new ApiError(401, 'Token refresh failed');
      }
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  private buildQueryString(params?: Record<string, unknown>): string {
    if (!params) return '';
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, params, ...fetchOptions } = options;
    const queryString = this.buildQueryString(params);
    const fullEndpoint = `${endpoint}${queryString}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (requiresAuth) {
      const authHeaders = await this.getAuthHeaders();
      Object.assign(headers, authHeaders);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${fullEndpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || 'Request failed', errorData);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file with FormData (multipart/form-data)
   */
  async upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
    const { requiresAuth = true, params, ...fetchOptions } = options || {};
    const queryString = this.buildQueryString(params);
    const fullEndpoint = `${endpoint}${queryString}`;

    const headers: HeadersInit = {
      // Don't set Content-Type for FormData - browser will set it with boundary
      ...fetchOptions.headers,
    };

    if (requiresAuth) {
      const authHeaders = await this.getAuthHeaders();
      Object.assign(headers, authHeaders);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${fullEndpoint}`, {
        ...fetchOptions,
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || 'Upload failed', errorData);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

export const apiClient = new ApiClient();
