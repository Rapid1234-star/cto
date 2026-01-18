/**
 * Database schema type definitions
 * These mirror the database tables for type-safe queries
 */

export interface DbUser {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  plan_tier: 'free' | 'premium';
  last_session: Date | null;
}

export interface DbUserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  communication_style: Record<string, unknown>;
  learning_preferences: Record<string, unknown>;
  timezone: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DbGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: 'learning' | 'project' | 'skill' | 'habit';
  priority: number;
  status: 'active' | 'paused' | 'completed' | 'archived';
  created_at: Date;
  target_date: Date | null;
  completed_at: Date | null;
  metadata: Record<string, unknown>;
}

export interface DbFocusArea {
  id: string;
  user_id: string;
  title: string;
  priority_order: number;
  created_at: Date;
}

export interface DbSkillLevel {
  id: string;
  user_id: string;
  topic: string;
  level: number;
  last_updated: Date;
  notes: string | null;
}

export interface DbConfusionPattern {
  id: string;
  user_id: string;
  topic: string;
  pattern_description: string;
  frequency: number;
  suggested_approach: string | null;
  created_at: Date;
  last_observed: Date;
}

export interface DbSession {
  id: string;
  user_id: string;
  started_at: Date;
  ended_at: Date | null;
  summary: string | null;
  key_topics: string[];
}

export interface DbMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  embedding_id: string | null;
  created_at: Date;
}

export interface DbMemorySummary {
  id: string;
  user_id: string;
  memory_type: 'short_term' | 'medium_term' | 'long_term';
  time_range: string;
  summary_content: string;
  created_at: Date;
  compressed_at: Date | null;
}

export interface DbDecision {
  id: string;
  user_id: string;
  decision: string;
  context: string | null;
  outcome: string | null;
  date: Date;
}

export interface DbPersonalityNote {
  id: string;
  user_id: string;
  note: string;
  category: string;
  created_at: Date;
}
