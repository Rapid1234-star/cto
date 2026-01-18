# Database Migrations

This directory contains SQL migration files for the ThinkCompanion database schema.

## Migration Files

- `001_init_schema.sql` - Initial database schema with all core tables
- `002_rls_policies.sql` - Row Level Security policies for Supabase

## Running Migrations

### Using Supabase CLI

If you're using Supabase (recommended):

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push migrations to Supabase
supabase db push
```

### Using Direct PostgreSQL Connection

If you're using a direct PostgreSQL connection:

```bash
# Run migrations in order
psql $DATABASE_URL -f migrations/001_init_schema.sql
psql $DATABASE_URL -f migrations/002_rls_policies.sql
```

### Using Node.js Script

```bash
# From the api directory
pnpm run migrate
```

## Creating New Migrations

1. Create a new file with the format: `XXX_description.sql`
   - Use sequential numbering (003, 004, etc.)
   - Use descriptive names (e.g., `003_add_analytics_tables.sql`)

2. Include both UP and DOWN migrations:
   ```sql
   -- UP Migration
   CREATE TABLE new_table (...);
   
   -- To rollback, create a separate rollback file or comment:
   -- DOWN Migration (for reference)
   -- DROP TABLE new_table;
   ```

3. Test migrations locally before deploying:
   ```bash
   # Start local database
   docker-compose up -d postgres
   
   # Run migration
   psql postgresql://postgres:postgres@localhost:5432/thinkcompanion -f migrations/003_new_migration.sql
   ```

## Migration Safety Checklist

Before running migrations in production:

- [ ] Test migration on local database
- [ ] Verify migration is idempotent (can be run multiple times)
- [ ] Check for breaking changes to existing queries
- [ ] Backup production database
- [ ] Plan rollback strategy
- [ ] Test RLS policies if adding new tables
- [ ] Verify indexes are created for performance
- [ ] Document any manual steps required

## Schema Versioning

We use sequential numbering for migrations. The current schema version can be tracked by creating a `schema_version` table:

```sql
CREATE TABLE schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Rollback Strategy

If a migration fails or causes issues:

1. Identify the problematic migration
2. Create a rollback migration that reverses the changes
3. Test rollback on staging environment
4. Apply rollback to production
5. Fix the original migration
6. Re-apply corrected migration

## Supabase-Specific Notes

When using Supabase:

- RLS policies are critical for security
- Always test RLS policies with actual user tokens
- Use `auth.uid()` to reference the current user
- Service role key bypasses RLS (use carefully)
- Supabase automatically creates some helper functions

## Common Issues

### Issue: Migration already applied
**Solution**: Migrations should be idempotent. Use `IF NOT EXISTS` clauses:
```sql
CREATE TABLE IF NOT EXISTS my_table (...);
```

### Issue: RLS blocking queries
**Solution**: Verify policies are correctly configured and user is authenticated:
```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Test policy
SET request.jwt.claims.sub = 'user-id-here';
```

### Issue: Foreign key constraints failing
**Solution**: Ensure referenced tables exist and have the correct columns:
```sql
-- Check foreign keys
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY';
```
