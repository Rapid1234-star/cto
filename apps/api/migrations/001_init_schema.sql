-- ThinkCompanion Database Schema
-- This migration creates the foundational tables for the ThinkCompanion platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table: Core user accounts
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'premium')) NOT NULL,
  last_session TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE users IS 'Core user accounts with authentication and subscription info';
COMMENT ON COLUMN users.plan_tier IS 'Subscription tier: free or premium';
COMMENT ON COLUMN users.last_session IS 'Timestamp of the most recent session start';

-- User profiles: Extended user information and preferences
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  bio TEXT,
  communication_style JSONB DEFAULT '{}',
  learning_preferences JSONB DEFAULT '{}',
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

COMMENT ON TABLE user_profiles IS 'Extended user profiles with communication and learning preferences';
COMMENT ON COLUMN user_profiles.communication_style IS 'JSON object with preferences like tone, verbosity, examples';
COMMENT ON COLUMN user_profiles.learning_preferences IS 'JSON object with pace, depth, style preferences';

-- Goals: User goals and objectives
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('learning', 'project', 'skill', 'habit')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  target_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE goals IS 'User goals and objectives with priority and status tracking';
COMMENT ON COLUMN goals.priority IS 'Priority from 1 (low) to 10 (high)';
COMMENT ON COLUMN goals.metadata IS 'Additional goal context and custom fields';

-- Focus areas: Current areas of user focus
CREATE TABLE focus_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  priority_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE focus_areas IS 'Current areas of user focus, ordered by priority';

-- Skill levels: Tracked skill proficiency over time
CREATE TABLE skill_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  level INTEGER DEFAULT 0 CHECK (level >= 0 AND level <= 10),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  notes TEXT,
  UNIQUE(user_id, topic)
);

COMMENT ON TABLE skill_levels IS 'User skill proficiency tracking from 0 (beginner) to 10 (expert)';
COMMENT ON COLUMN skill_levels.level IS 'Skill level from 0 (complete beginner) to 10 (expert)';

-- Confusion patterns: Identified user confusion patterns
CREATE TABLE confusion_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  pattern_description TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  suggested_approach TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE confusion_patterns IS 'Detected patterns where user frequently needs clarification';
COMMENT ON COLUMN confusion_patterns.frequency IS 'Number of times this pattern has been observed';
COMMENT ON COLUMN confusion_patterns.suggested_approach IS 'Recommended teaching approach for this pattern';

-- Sessions: Chat sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  summary TEXT,
  key_topics TEXT[] DEFAULT '{}'
);

COMMENT ON TABLE sessions IS 'Chat sessions with summaries and key topics discussed';
COMMENT ON COLUMN sessions.key_topics IS 'Array of main topics discussed in this session';

-- Messages: Individual chat messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  embedding_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE messages IS 'Individual chat messages with optional vector embeddings';
COMMENT ON COLUMN messages.embedding_id IS 'Reference to vector embedding in Pinecone';

-- Memory summaries: Compressed memory across different time ranges
CREATE TABLE memory_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('short_term', 'medium_term', 'long_term')),
  time_range TEXT NOT NULL,
  summary_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  compressed_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE memory_summaries IS 'Compressed memory summaries across different time ranges';
COMMENT ON COLUMN memory_summaries.memory_type IS 'short_term: hours/days, medium_term: weeks/months, long_term: years';
COMMENT ON COLUMN memory_summaries.time_range IS 'Human-readable time range like "2024-01-18 to 2024-01-25"';

-- Decisions log: Important user decisions and their outcomes
CREATE TABLE decisions_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  decision TEXT NOT NULL,
  context TEXT,
  outcome TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE decisions_log IS 'Log of user decisions with context and outcomes for learning';

-- Personality notes: Observed personality traits and preferences
CREATE TABLE personality_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE personality_notes IS 'Observed personality traits, quirks, and communication preferences';
COMMENT ON COLUMN personality_notes.category IS 'Category like communication, preferences, quirks, humor';

-- Indexes for performance
-- User-scoped queries
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_user_id_status ON goals(user_id, status);
CREATE INDEX idx_goals_user_id_created_at ON goals(user_id, created_at DESC);
CREATE INDEX idx_focus_areas_user_id ON focus_areas(user_id);
CREATE INDEX idx_skill_levels_user_id ON skill_levels(user_id);
CREATE INDEX idx_confusion_patterns_user_id ON confusion_patterns(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_user_id_started_at ON sessions(user_id, started_at DESC);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_user_id_created_at ON messages(user_id, created_at DESC);
CREATE INDEX idx_memory_summaries_user_id ON memory_summaries(user_id);
CREATE INDEX idx_memory_summaries_user_id_type ON memory_summaries(user_id, memory_type);
CREATE INDEX idx_decisions_log_user_id ON decisions_log(user_id);
CREATE INDEX idx_personality_notes_user_id ON personality_notes(user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial data: Create a default profile for each new user
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();
