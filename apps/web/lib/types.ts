/**
 * Frontend-specific types
 * Re-exports shared types and adds UI-specific types
 */

export * from 'shared-types';

export interface AuthState {
  user: {
    id: string;
    email: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}
