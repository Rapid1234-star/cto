# API Documentation

Base URL: `http://localhost:5000` (development) or your deployed API URL

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2024-01-18T12:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { /* optional */ }
  },
  "timestamp": "2024-01-18T12:00:00.000Z"
}
```

## Endpoints

### Auth

#### Send Magic Link
```http
POST /auth/magic-link
Content-Type: application/json

{
  "email": "user@example.com",
  "redirect_to": "http://localhost:3000/auth/callback" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Magic link sent successfully",
    "email": "user@example.com"
  }
}
```

#### Verify Token
```http
POST /auth/verify
Content-Type: application/json

{
  "token": "magic-link-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_at": "2024-01-25T12:00:00.000Z"
  }
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Chat

#### Send Message
```http
POST /chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Hello, how are you?",
  "session_id": "session-uuid" // optional
}
```

**Regular Response:**
```json
{
  "success": true,
  "data": {
    "response": "I'm doing well, thank you!",
    "session_id": "session-uuid",
    "message_id": "message-uuid",
    "metadata": {
      "memory_updates": [],
      "topics_discussed": ["greeting"]
    }
  }
}
```

**Streaming Response** (when Accept: text/event-stream):
```
data: {"type":"token","content":"I'm"}
data: {"type":"token","content":" doing"}
data: {"type":"token","content":" well"}
data: {"type":"done","session_id":"session-uuid"}
```

#### Get Sessions
```http
GET /chat/sessions
Authorization: Bearer <token>
```

#### Get Session Messages
```http
GET /chat/sessions/:sessionId
Authorization: Bearer <token>
```

#### End Session
```http
POST /chat/sessions/:sessionId/end
Authorization: Bearer <token>
Content-Type: application/json

{
  "summary": "Discussed project goals" // optional
}
```

### User

#### Get Profile
```http
GET /user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "plan_tier": "free",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "profile": {
      "full_name": "John Doe",
      "bio": "Software developer",
      "communication_style": {},
      "learning_preferences": {},
      "timezone": "America/New_York"
    },
    "stats": {
      "total_sessions": 10,
      "total_messages": 150,
      "active_goals": 3,
      "tracked_skills": 5
    }
  }
}
```

#### Update Profile
```http
PATCH /user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Doe",
  "bio": "Updated bio",
  "communication_style": {
    "tone": "casual",
    "verbosity": "concise"
  }
}
```

#### Get Goals
```http
GET /user/goals?status=active
Authorization: Bearer <token>
```

#### Create Goal
```http
POST /user/goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Learn TypeScript",
  "description": "Master TypeScript fundamentals",
  "category": "learning",
  "priority": 8,
  "target_date": "2024-06-01T00:00:00.000Z"
}
```

#### Update Goal
```http
PATCH /user/goals/:goalId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "completed_at": "2024-01-18T00:00:00.000Z"
}
```

#### Get Skills
```http
GET /user/skills
Authorization: Bearer <token>
```

#### Update Skill
```http
PUT /user/skills/:topic
Authorization: Bearer <token>
Content-Type: application/json

{
  "level": 7,
  "notes": "Improved understanding of async/await"
}
```

### Memory

#### Search Memories
```http
POST /memory/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "project planning",
  "limit": 10,
  "time_range": {
    "start": "2024-01-01T00:00:00.000Z",
    "end": "2024-01-18T00:00:00.000Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "vector-id",
        "content": "Discussed project planning...",
        "score": 0.95,
        "metadata": {
          "sessionId": "session-uuid",
          "timestamp": "2024-01-15T12:00:00.000Z"
        }
      }
    ],
    "summary": "Found 1 relevant memories"
  }
}
```

#### Get Recent Activity
```http
GET /memory/recent?days=30
Authorization: Bearer <token>
```

#### Get Memory Summaries
```http
GET /memory/summaries?type=long_term
Authorization: Bearer <token>
```

## Error Codes

- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid request data
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error
- `SERVICE_UNAVAILABLE` (503) - External service unavailable

## Rate Limiting

- Default: 100 requests per minute per IP
- Authenticated: Higher limits based on plan tier
- Response header: `X-RateLimit-Remaining`

## Webhooks (Future)

Coming in Phase 2 - webhook support for events like:
- Session completed
- Goal achieved
- Skill level updated
