/**
 * User-related type definitions
 */

export type PlanTier = 'free' | 'premium';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  plan_tier: PlanTier;
  last_session: string | null;
}

export interface CommunicationStyle {
  prefers?: string[];
  tone?: 'formal' | 'casual' | 'technical' | 'simple';
  verbosity?: 'concise' | 'detailed' | 'balanced';
  examples_preferred?: boolean;
}

export interface LearningPreferences {
  pace?: 'slow' | 'medium' | 'fast';
  examples_first?: boolean;
  prefer_analogies?: boolean;
  depth_preference?: 'overview' | 'deep-dive' | 'practical';
  learning_style?: string[];
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  communication_style: CommunicationStyle;
  learning_preferences: LearningPreferences;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export type GoalCategory = 'learning' | 'project' | 'skill' | 'habit';
export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  priority: number; // 1-10
  status: GoalStatus;
  created_at: string;
  target_date: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown>;
}

export interface FocusArea {
  id: string;
  user_id: string;
  title: string;
  priority_order: number;
  created_at: string;
}

export interface SkillLevel {
  id: string;
  user_id: string;
  topic: string;
  level: number; // 0-10
  last_updated: string;
  notes: string | null;
}

export interface ConfusionPattern {
  id: string;
  user_id: string;
  topic: string;
  pattern_description: string;
  frequency: number;
  suggested_approach: string | null;
  created_at: string;
  last_observed: string;
}

export interface Decision {
  id: string;
  user_id: string;
  decision: string;
  context: string | null;
  outcome: string | null;
  date: string;
}

export interface PersonalityNote {
  id: string;
  user_id: string;
  note: string;
  category: string;
  created_at: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  bio?: string;
  communication_style?: Partial<CommunicationStyle>;
  learning_preferences?: Partial<LearningPreferences>;
  timezone?: string;
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  category: GoalCategory;
  priority?: number;
  target_date?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  category?: GoalCategory;
  priority?: number;
  status?: GoalStatus;
  target_date?: string;
  metadata?: Record<string, unknown>;
}
