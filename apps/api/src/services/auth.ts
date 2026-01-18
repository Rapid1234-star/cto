import { supabaseAuth, supabaseAdmin } from '../config/database';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Auth service for handling authentication operations
 */
export class AuthService {
  /**
   * Send magic link to user's email
   */
  async sendMagicLink(email: string, redirectTo?: string): Promise<void> {
    try {
      const { error } = await supabaseAuth.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        logger.error({ error }, 'Failed to send magic link');
        throw new ValidationError('Failed to send magic link');
      }

      logger.info({ email }, 'Magic link sent successfully');
    } catch (error) {
      logger.error({ error, email }, 'Error sending magic link');
      throw error;
    }
  }

  /**
   * Verify magic link token
   */
  async verifyToken(token: string) {
    try {
      const { data, error } = await supabaseAuth.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error || !data.user) {
        throw new UnauthorizedError('Invalid or expired token');
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
        },
        session: data.session,
      };
    } catch (error) {
      logger.error({ error }, 'Token verification failed');
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        throw new UnauthorizedError('User not found');
      }

      return data;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user');
      throw error;
    }
  }

  /**
   * Create or update user
   */
  async upsertUser(userId: string, email: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .upsert({
          id: userId,
          email,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        logger.error({ error, userId }, 'Failed to upsert user');
        throw error;
      }

      return data;
    } catch (error) {
      logger.error({ error, userId, email }, 'Error upserting user');
      throw error;
    }
  }

  /**
   * Sign out user
   */
  async signOut(token: string): Promise<void> {
    try {
      const { error } = await supabaseAuth.auth.signOut();

      if (error) {
        logger.error({ error }, 'Sign out failed');
        throw error;
      }

      logger.info('User signed out successfully');
    } catch (error) {
      logger.error({ error }, 'Error signing out');
      throw error;
    }
  }
}

export const authService = new AuthService();
