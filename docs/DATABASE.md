# Database Schema Documentation

## Overview

ThinkCompanion uses PostgreSQL (via Supabase) as the primary database. The schema is designed for:
- Multi-user support with Row Level Security
- Efficient querying with proper indexes
- Flexible JSON storage for preferences
- Relationship integrity with foreign keys

## Schema Diagram

```
users (1) ──┬─── (1) user_profiles
            ├─── (*) goals
            ├─── (*) focus_areas
            ├─── (*) skill_levels
            ├─── (*) confusion_patterns
            ├─── (*) sessions ──── (*) messages
            ├─── (*) memory_summaries
            ├─── (*) decisions_log
            └─── (*) personality_notes
```

## Tables

### users
Core user accounts and authentication.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'premium')),
  last_session TIMESTAMP WITH TIME ZONE
);
```

**Columns**:
- `id`: Unique user identifier (UUID)
- `email`: User email address (unique)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp (auto-updated)
- `plan_tier`: Subscription tier (free/premium)
- `last_session`: Most recent session start time

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE on `email`

### user_profiles
Extended user information and preferences.

```sql
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
```

**JSONB Fields**:

`communication_style`:
```json
{
  "prefers": ["examples", "step-by-step"],
  "tone": "casual",
  "verbosity": "balanced",
  "examples_preferred": true
}
```

`learning_preferences`:
```json
{
  "pace": "medium",
  "examples_first": true,
  "prefer_analogies": true,
  "depth_preference": "practical",
  "learning_style": ["visual", "hands-on"]
}
```

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE on `user_id`
- INDEX on `user_id`

### goals
User goals and objectives.

```sql
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
```

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `(user_id, status)`
- INDEX on `(user_id, created_at DESC)`

### skill_levels
Track user skill proficiency over time.

```sql
CREATE TABLE skill_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  level INTEGER DEFAULT 0 CHECK (level >= 0 AND level <= 10),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  notes TEXT,
  UNIQUE(user_id, topic)
);
```

**Skill Levels**:
- 0-2: Beginner
- 3-5: Intermediate
- 6-8: Advanced
- 9-10: Expert

### confusion_patterns
Identified patterns where users need clarification.

```sql
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
```

**Usage**: Track recurring confusion to adapt teaching approach.

### sessions
Chat sessions with summaries.

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  summary TEXT,
  key_topics TEXT[] DEFAULT '{}'
);
```

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `(user_id, started_at DESC)`

### messages
Individual chat messages with embeddings.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  embedding_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `session_id`
- INDEX on `(user_id, created_at DESC)`

### memory_summaries
Compressed memory across time ranges.

```sql
CREATE TABLE memory_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('short_term', 'medium_term', 'long_term')),
  time_range TEXT NOT NULL,
  summary_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  compressed_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `(user_id, memory_type)`

## Row Level Security (RLS)

All tables have RLS policies ensuring users only access their own data:

```sql
-- Example for messages table
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Database Functions

### Auto-update timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Auto-create profile
```sql
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Query Patterns

### Get user with profile
```sql
SELECT u.*, p.*
FROM users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.id = $1;
```

### Get active goals
```sql
SELECT *
FROM goals
WHERE user_id = $1
  AND status = 'active'
ORDER BY priority DESC, created_at DESC;
```

### Get session with messages
```sql
SELECT 
  s.*,
  json_agg(m.* ORDER BY m.created_at) as messages
FROM sessions s
LEFT JOIN messages m ON s.id = m.session_id
WHERE s.id = $1
GROUP BY s.id;
```

## Performance Optimization

### Connection Pooling
Supabase provides connection pooling automatically.

### Query Optimization
- All user-scoped queries use indexes
- Limit results with LIMIT clause
- Use prepared statements to prevent SQL injection

### Data Archival (Future)
```sql
-- Move old messages to archive table
INSERT INTO messages_archive
SELECT * FROM messages
WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM messages
WHERE created_at < NOW() - INTERVAL '1 year';
```

## Backup Strategy

### Supabase Automatic Backups
- Daily automatic backups
- Point-in-time recovery
- Backup retention based on plan

### Manual Backup
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

## Migration Management

### Creating Migrations
```bash
# Create new migration
cd apps/api/migrations
touch 003_add_new_feature.sql
```

### Running Migrations
```bash
# Using Supabase CLI
supabase db push

# Using psql
psql $DATABASE_URL -f migrations/003_add_new_feature.sql
```

## Data Integrity

### Foreign Keys
All relationships use foreign keys with CASCADE delete:
```sql
user_id UUID REFERENCES users(id) ON DELETE CASCADE
```

### Check Constraints
Validate data at database level:
```sql
CHECK (priority >= 1 AND priority <= 10)
CHECK (status IN ('active', 'paused', 'completed', 'archived'))
```

### Unique Constraints
Prevent duplicates:
```sql
UNIQUE(user_id, topic)  -- One skill level per topic per user
UNIQUE(email)           -- One account per email
```
