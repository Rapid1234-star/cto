/**
 * Multi-agent system type definitions
 */

export type AgentRole = 
  | 'listener'      // Analyzes user input for intent and emotion
  | 'planner'       // Plans response structure and approach
  | 'tutor'         // Provides educational content
  | 'critic'        // Reviews and refines responses
  | 'memory'        // Manages memory read/write operations
  | 'execution'     // Executes planned actions
  | 'orchestrator'; // Coordinates all agents

export interface AgentMessage {
  from: AgentRole;
  to: AgentRole;
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AgentContext {
  user_id: string;
  session_id: string;
  user_message: string;
  user_profile: Record<string, unknown>;
  recent_memory: string[];
  active_goals: string[];
  skill_levels: Record<string, number>;
  confusion_patterns: string[];
}

export interface ListenerAnalysis {
  intent: string;
  topics: string[];
  emotion_detected: string | null;
  complexity_level: number; // 1-10
  requires_memory_lookup: boolean;
  requires_goal_context: boolean;
}

export interface PlannerOutput {
  response_strategy: string;
  key_points: string[];
  tone: string;
  depth: 'overview' | 'detailed' | 'expert';
  should_ask_clarifying_questions: boolean;
  memory_writes_needed: string[];
}

export interface TutorOutput {
  explanation: string;
  examples: string[];
  analogies: string[];
  follow_up_suggestions: string[];
}

export interface CriticFeedback {
  quality_score: number; // 1-10
  suggestions: string[];
  potential_issues: string[];
  approved: boolean;
}

export interface MemoryAgentOutput {
  relevant_memories: string[];
  new_memories_to_store: Array<{
    content: string;
    type: 'fact' | 'preference' | 'goal' | 'pattern';
  }>;
  skill_updates: Array<{
    topic: string;
    new_level: number;
  }>;
}

export interface ExecutionOutput {
  final_response: string;
  memory_stored: boolean;
  profile_updated: boolean;
  actions_taken: string[];
}

export interface AgentOrchestrationResult {
  final_response: string;
  agent_messages: AgentMessage[];
  memory_updates: string[];
  profile_updates: Record<string, unknown>;
  execution_time_ms: number;
}
