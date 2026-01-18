import { supabaseAdmin } from '../config/database';
import { vectorService } from './vector';
import { logger } from '../utils/logger';
import { NotFoundError } from '../utils/errors';
import type { ChatMessage, MemorySummary } from 'shared-types';

/**
 * Memory service for managing user memories
 */
export class MemoryService {
  /**
   * Store a chat message and its embedding
   */
  async storeMessage(
    userId: string,
    sessionId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<ChatMessage> {
    try {
      // Store embedding in vector database
      const embeddingId = await vectorService.storeText(userId, content, {
        sessionId,
        role,
        type: 'message',
      });

      // Store message in database
      const { data, error } = await supabaseAdmin
        .from('messages')
        .insert({
          user_id: userId,
          session_id: sessionId,
          role,
          content,
          embedding_id: embeddingId,
        })
        .select()
        .single();

      if (error) {
        logger.error({ error, userId, sessionId }, 'Failed to store message');
        throw error;
      }

      return {
        id: data.id,
        session_id: data.session_id,
        user_id: data.user_id,
        role: data.role,
        content: data.content,
        embedding_id: data.embedding_id,
        created_at: data.created_at,
      };
    } catch (error) {
      logger.error({ error, userId, sessionId }, 'Error storing message');
      throw error;
    }
  }

  /**
   * Get session messages
   */
  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map(msg => ({
        id: msg.id,
        session_id: msg.session_id,
        user_id: msg.user_id,
        role: msg.role,
        content: msg.content,
        embedding_id: msg.embedding_id,
        created_at: msg.created_at,
      }));
    } catch (error) {
      logger.error({ error, sessionId }, 'Failed to get session messages');
      throw error;
    }
  }

  /**
   * Search user memories
   */
  async searchMemories(
    userId: string,
    query: string,
    options: {
      limit?: number;
      timeRange?: { start: string; end: string };
    } = {}
  ) {
    try {
      const { limit = 10 } = options;

      // Search vector database
      const results = await vectorService.search(userId, query, {
        topK: limit,
      });

      return results;
    } catch (error) {
      logger.error({ error, userId, query }, 'Memory search failed');
      throw error;
    }
  }

  /**
   * Create or update a memory summary
   */
  async createMemorySummary(
    userId: string,
    memoryType: 'short_term' | 'medium_term' | 'long_term',
    timeRange: string,
    summaryContent: string
  ): Promise<MemorySummary> {
    try {
      const { data, error } = await supabaseAdmin
        .from('memory_summaries')
        .insert({
          user_id: userId,
          memory_type: memoryType,
          time_range: timeRange,
          summary_content: summaryContent,
        })
        .select()
        .single();

      if (error) {
        logger.error({ error, userId }, 'Failed to create memory summary');
        throw error;
      }

      return {
        id: data.id,
        user_id: data.user_id,
        memory_type: data.memory_type,
        time_range: data.time_range,
        summary_content: data.summary_content,
        created_at: data.created_at,
        compressed_at: data.compressed_at,
      };
    } catch (error) {
      logger.error({ error, userId }, 'Error creating memory summary');
      throw error;
    }
  }

  /**
   * Get user's recent activity
   */
  async getRecentActivity(userId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('id, session_id, role, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get recent activity');
      throw error;
    }
  }

  /**
   * Create a new session
   */
  async createSession(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('sessions')
        .insert({
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        logger.error({ error, userId }, 'Failed to create session');
        throw error;
      }

      // Update user's last_session
      await supabaseAdmin
        .from('users')
        .update({ last_session: new Date().toISOString() })
        .eq('id', userId);

      return {
        id: data.id,
        user_id: data.user_id,
        started_at: data.started_at,
        ended_at: data.ended_at,
        summary: data.summary,
        key_topics: data.key_topics,
      };
    } catch (error) {
      logger.error({ error, userId }, 'Error creating session');
      throw error;
    }
  }

  /**
   * End a session
   */
  async endSession(sessionId: string, summary?: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('sessions')
        .update({
          ended_at: new Date().toISOString(),
          summary: summary || null,
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        throw new NotFoundError('Session');
      }

      return data;
    } catch (error) {
      logger.error({ error, sessionId }, 'Failed to end session');
      throw error;
    }
  }
}

export const memoryService = new MemoryService();
