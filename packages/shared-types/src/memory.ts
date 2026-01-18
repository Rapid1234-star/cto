/**
 * Memory system type definitions
 */

export type MemoryType = 'short_term' | 'medium_term' | 'long_term';

export interface MemorySummary {
  id: string;
  user_id: string;
  memory_type: MemoryType;
  time_range: string;
  summary_content: string;
  created_at: string;
  compressed_at: string | null;
}

export interface ChatSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  summary: string | null;
  key_topics: string[];
}

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  embedding_id: string | null;
  created_at: string;
}

export interface ShortTermMemory {
  session_id: string;
  messages: ChatMessage[];
  context: string;
  key_points: string[];
}

export interface MediumTermMemory {
  time_range: string;
  active_goals: string[];
  recent_topics: string[];
  skill_progress: Record<string, number>;
  patterns_observed: string[];
}

export interface LongTermMemory {
  user_identity: {
    core_interests: string[];
    persistent_goals: string[];
    communication_preferences: Record<string, unknown>;
  };
  skill_map: Record<string, number>;
  growth_trajectory: {
    topic: string;
    progress: string;
  }[];
}

export interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface MemoryQueryRequest {
  query: string;
  memory_types?: MemoryType[];
  limit?: number;
  time_range?: {
    start: string;
    end: string;
  };
}

export interface MemoryQueryResponse {
  results: VectorSearchResult[];
  summary: string;
}

export interface CreateSessionRequest {
  initial_message?: string;
}

export interface EndSessionRequest {
  session_id: string;
  summary?: string;
}
