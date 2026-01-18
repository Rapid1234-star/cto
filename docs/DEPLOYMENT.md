# Deployment Guide

This guide covers deploying ThinkCompanion to production.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Railway/Render account
- Supabase account
- Pinecone account
- OpenAI API key

## 1. Database Setup (Supabase)

### Create Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait for project to be created

### Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
cd apps/api/migrations
supabase db push
```

### Get Connection Details

From Supabase dashboard:
- Settings → API → URL (SUPABASE_URL)
- Settings → API → anon/public key (SUPABASE_KEY)
- Settings → API → service_role key (SUPABASE_SERVICE_ROLE_KEY)
- Settings → API → JWT Secret (SUPABASE_JWT_SECRET)

## 2. Vector Database (Pinecone)

### Create Index

1. Go to https://www.pinecone.io
2. Create a new project
3. Create a serverless index:
   - Name: `thinkcompanion`
   - Dimensions: `1536`
   - Metric: `cosine`
   - Cloud: `AWS`
   - Region: `us-east-1`

### Get API Key

- Settings → API Keys → Copy API key

## 3. Backend Deployment (Railway)

### Connect Repository

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select `apps/api` as root directory

### Configure Environment Variables

Add these in Railway dashboard:

```
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

FRONTEND_URL=https://your-app.vercel.app

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
SUPABASE_JWT_SECRET=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

PINECONE_API_KEY=xxx
PINECONE_INDEX_NAME=thinkcompanion
PINECONE_ENVIRONMENT=us-east-1-aws

JWT_SECRET=your-secure-random-string-min-32-chars

RATE_LIMIT_MAX=100
RATE_LIMIT_TIMEWINDOW=60000

LOG_LEVEL=info
LOG_PRETTY=false
```

### Deploy

1. Railway will auto-deploy on push to main
2. Get your backend URL from Railway dashboard

## 4. Frontend Deployment (Vercel)

### Connect Repository

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `pnpm build`
   - Output Directory: `.next`

### Configure Environment Variables

Add these in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Deploy

1. Click "Deploy"
2. Vercel will auto-deploy on push to main
3. Get your frontend URL

## 5. Update CORS

Update `FRONTEND_URL` in Railway to match your Vercel URL:
```
FRONTEND_URL=https://your-app.vercel.app
```

## 6. Verify Deployment

### Test Frontend
1. Visit your Vercel URL
2. Click "Get Started"
3. Enter email for magic link

### Test Backend
```bash
curl https://your-api.railway.app/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-18T...",
  "environment": "production"
}
```

## 7. Set Up Monitoring (Optional)

### Sentry (Error Tracking)
1. Create Sentry project
2. Add Sentry SDK to frontend and backend
3. Add `SENTRY_DSN` to environment variables

### LogTail (Logging)
1. Create LogTail source
2. Add LogTail token to Railway
3. Configure log shipping

## Troubleshooting

### Database Connection Failed
- Check Supabase URL and keys
- Verify RLS policies are set up
- Check network connectivity

### Vector Search Not Working
- Verify Pinecone index exists
- Check API key is correct
- Ensure index dimensions match (1536)

### Authentication Issues
- Check JWT secret matches
- Verify Supabase auth is enabled
- Check email provider is configured

### CORS Errors
- Verify FRONTEND_URL in backend matches actual frontend URL
- Check CORS middleware is configured correctly

## Updating Deployments

### Frontend
```bash
git push origin main
# Vercel auto-deploys
```

### Backend
```bash
git push origin main
# Railway auto-deploys
```

### Database Migrations
```bash
# Create new migration
cd apps/api/migrations
# Add XXX_description.sql

# Push to Supabase
supabase db push
```

## Rollback

### Vercel
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Railway
1. Go to Deployments
2. Click on previous deployment
3. Click "Redeploy"

## Production Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations run successfully
- [ ] Pinecone index created and configured
- [ ] CORS configured correctly
- [ ] Email provider configured for magic links
- [ ] Rate limiting configured
- [ ] Monitoring and logging set up
- [ ] Error tracking configured
- [ ] SSL certificates valid
- [ ] Custom domain configured (optional)
- [ ] Backup strategy in place
