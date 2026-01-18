-- Row Level Security Policies for Supabase
-- Ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE confusion_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_notes ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view their own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- Focus areas policies
CREATE POLICY "Users can view their own focus areas"
  ON focus_areas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own focus areas"
  ON focus_areas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus areas"
  ON focus_areas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus areas"
  ON focus_areas FOR DELETE
  USING (auth.uid() = user_id);

-- Skill levels policies
CREATE POLICY "Users can view their own skill levels"
  ON skill_levels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skill levels"
  ON skill_levels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill levels"
  ON skill_levels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill levels"
  ON skill_levels FOR DELETE
  USING (auth.uid() = user_id);

-- Confusion patterns policies
CREATE POLICY "Users can view their own confusion patterns"
  ON confusion_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own confusion patterns"
  ON confusion_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own confusion patterns"
  ON confusion_patterns FOR UPDATE
  USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Memory summaries policies
CREATE POLICY "Users can view their own memory summaries"
  ON memory_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memory summaries"
  ON memory_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory summaries"
  ON memory_summaries FOR UPDATE
  USING (auth.uid() = user_id);

-- Decisions log policies
CREATE POLICY "Users can view their own decisions"
  ON decisions_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decisions"
  ON decisions_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decisions"
  ON decisions_log FOR UPDATE
  USING (auth.uid() = user_id);

-- Personality notes policies
CREATE POLICY "Users can view their own personality notes"
  ON personality_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personality notes"
  ON personality_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personality notes"
  ON personality_notes FOR UPDATE
  USING (auth.uid() = user_id);
