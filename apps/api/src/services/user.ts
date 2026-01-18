import { supabaseAdmin } from '../config/database';
import { logger } from '../utils/logger';
import { NotFoundError } from '../utils/errors';
import type { UpdateProfileRequest, CreateGoalRequest, UpdateGoalRequest } from 'shared-types';

/**
 * User service for managing user profiles and data
 */
export class UserService {
  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    try {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new NotFoundError('User');
      }

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        logger.error({ error: profileError, userId }, 'Failed to get profile');
      }

      // Get stats
      const [sessionsResult, messagesResult, goalsResult, skillsResult] = await Promise.all([
        supabaseAdmin.from('sessions').select('id', { count: 'exact' }).eq('user_id', userId),
        supabaseAdmin.from('messages').select('id', { count: 'exact' }).eq('user_id', userId),
        supabaseAdmin.from('goals').select('id', { count: 'exact' }).eq('user_id', userId).eq('status', 'active'),
        supabaseAdmin.from('skill_levels').select('id', { count: 'exact' }).eq('user_id', userId),
      ]);

      return {
        user: {
          id: user.id,
          email: user.email,
          plan_tier: user.plan_tier,
          created_at: user.created_at,
        },
        profile: profile ? {
          full_name: profile.full_name,
          bio: profile.bio,
          communication_style: profile.communication_style,
          learning_preferences: profile.learning_preferences,
          timezone: profile.timezone,
        } : null,
        stats: {
          total_sessions: sessionsResult.count || 0,
          total_messages: messagesResult.count || 0,
          active_goals: goalsResult.count || 0,
          tracked_skills: skillsResult.count || 0,
        },
      };
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user profile');
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: UpdateProfileRequest) {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.full_name !== undefined) updateData.full_name = updates.full_name;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.timezone !== undefined) updateData.timezone = updates.timezone;

      if (updates.communication_style) {
        const { data: currentProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('communication_style')
          .eq('user_id', userId)
          .single();

        updateData.communication_style = {
          ...(currentProfile?.communication_style || {}),
          ...updates.communication_style,
        };
      }

      if (updates.learning_preferences) {
        const { data: currentProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('learning_preferences')
          .eq('user_id', userId)
          .single();

        updateData.learning_preferences = {
          ...(currentProfile?.learning_preferences || {}),
          ...updates.learning_preferences,
        };
      }

      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error({ error, userId }, 'Failed to update profile');
        throw error;
      }

      return data;
    } catch (error) {
      logger.error({ error, userId, updates }, 'Error updating profile');
      throw error;
    }
  }

  /**
   * Get user goals
   */
  async getGoals(userId: string, status?: string) {
    try {
      let query = supabaseAdmin
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('priority', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get goals');
      throw error;
    }
  }

  /**
   * Create a goal
   */
  async createGoal(userId: string, goalData: CreateGoalRequest) {
    try {
      const { data, error } = await supabaseAdmin
        .from('goals')
        .insert({
          user_id: userId,
          title: goalData.title,
          description: goalData.description || null,
          category: goalData.category,
          priority: goalData.priority || 5,
          target_date: goalData.target_date || null,
          metadata: goalData.metadata || {},
        })
        .select()
        .single();

      if (error) {
        logger.error({ error, userId }, 'Failed to create goal');
        throw error;
      }

      return data;
    } catch (error) {
      logger.error({ error, userId, goalData }, 'Error creating goal');
      throw error;
    }
  }

  /**
   * Update a goal
   */
  async updateGoal(userId: string, goalId: string, updates: UpdateGoalRequest) {
    try {
      const { data, error } = await supabaseAdmin
        .from('goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new NotFoundError('Goal');
      }

      return data;
    } catch (error) {
      logger.error({ error, userId, goalId, updates }, 'Failed to update goal');
      throw error;
    }
  }

  /**
   * Get user skill levels
   */
  async getSkillLevels(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('skill_levels')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get skill levels');
      throw error;
    }
  }

  /**
   * Update skill level
   */
  async updateSkillLevel(userId: string, topic: string, level: number, notes?: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('skill_levels')
        .upsert({
          user_id: userId,
          topic,
          level,
          notes: notes || null,
          last_updated: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        logger.error({ error, userId, topic }, 'Failed to update skill level');
        throw error;
      }

      return data;
    } catch (error) {
      logger.error({ error, userId, topic, level }, 'Error updating skill level');
      throw error;
    }
  }
}

export const userService = new UserService();
