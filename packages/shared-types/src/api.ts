/**
 * API request/response type definitions
 */

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Auth endpoints
export interface MagicLinkRequest {
  email: string;
  redirect_to?: string;
}

export interface MagicLinkResponse {
  message: string;
  email: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

// Chat endpoints
export interface ChatRequest {
  message: string;
  session_id?: string;
  context?: Record<string, unknown>;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  message_id: string;
  metadata?: {
    memory_updates?: string[];
    skill_updates?: Record<string, number>;
    topics_discussed?: string[];
  };
}

export interface ChatStreamChunk {
  type: 'token' | 'metadata' | 'done' | 'error';
  content?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

// User endpoints
export interface GetProfileResponse {
  user: {
    id: string;
    email: string;
    plan_tier: string;
    created_at: string;
  };
  profile: {
    full_name: string | null;
    bio: string | null;
    communication_style: Record<string, unknown>;
    learning_preferences: Record<string, unknown>;
    timezone: string | null;
  };
  stats: {
    total_sessions: number;
    total_messages: number;
    active_goals: number;
    tracked_skills: number;
  };
}

// Error codes
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
