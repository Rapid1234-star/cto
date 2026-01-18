import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Supabase client for database operations
 * Uses service role key for backend operations that bypass RLS
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Supabase client for auth operations
 * Uses anon key for client-like operations
 */
export const supabaseAuth = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
}
