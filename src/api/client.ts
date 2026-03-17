import type { ShortenRequest, ShortenResponse, PreviewResponse, ApiError } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiClient {
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      let apiError: ApiError;
      try {
        apiError = await res.json();
      } catch {
        apiError = { error: 'unknown', message: `HTTP ${res.status}` };
      }
      throw apiError;
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  async shortenUrl(longUrl: string, expiredAt?: string): Promise<ShortenResponse> {
    const body: ShortenRequest = { long_url: longUrl };
    if (expiredAt) body.expired_at = expiredAt;

    return this.request<ShortenResponse>('/api/v1/url/shorten', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async previewUrl(shortUrl: string): Promise<PreviewResponse> {
    return this.request<PreviewResponse>(`/api/v1/url/${shortUrl}/preview`);
  }

  async deleteUrl(shortUrl: string): Promise<void> {
    return this.request<void>(`/api/v1/url/${shortUrl}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
