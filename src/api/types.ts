export interface ShortenRequest {
  long_url: string;
  expired_at?: string;
}

export interface ShortenResponse {
  short_url: string;
}

export interface PreviewResponse {
  long_url: string;
  short_url: string;
}

export interface ApiError {
  error: string;
  message: string;
}
