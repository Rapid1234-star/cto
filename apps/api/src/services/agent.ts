import { llmService } from './llm';
import { memoryService } from './memory';
import { userService } from './user';
import { logger } from '../utils/logger';
import type { AgentContext, AgentOrchestrationResult } from 'shared-types';

/**
 * Agent service for multi-agent orchestration
 * This is a skeleton implementation - full agent logic will be implemented in Phase 2
 */
export class AgentService {
  /**
   * Orchestrate agent pipeline for a user message
   * 
   * Agent flow:
   * 1. Listener - Analyzes user input
   * 2. Memory - Retrieves relevant context
   * 3. Planner - Plans response strategy
   * 4. Tutor - Generates educational content (if needed)
   * 5. Critic - Reviews and refines
   * 6. Execution - Executes and stores result
   */
  async orchestrate(
    userId: string,
    sessionId: string,
    userMessage: string
  ): Promise<AgentOrchestrationResult> {
    const startTime = Date.now();

    try {
      // Get user context
      const context = await this.buildContext(userId, sessionId, userMessage);

      // For Phase 1, we'll use a simple single-agent approach
      // Phase 2 will implement full multi-agent orchestration
      const response = await this.generateSimpleResponse(context);

      // Store message and response
      await memoryService.storeMessage(userId, sessionId, 'user', userMessage);
      await memoryService.storeMessage(userId, sessionId, 'assistant', response);

      const executionTime = Date.now() - startTime;

      return {
        final_response: response,
        agent_messages: [],
        memory_updates: [],
        profile_updates: {},
        execution_time_ms: executionTime,
      };
    } catch (error) {
      logger.error({ error, userId, sessionId }, 'Agent orchestration failed');
      throw error;
    }
  }

  /**
   * Build context for agent processing
   */
  private async buildContext(
    userId: string,
    sessionId: string,
    userMessage: string
  ): Promise<AgentContext> {
    try {
      // Get user profile
      const profile = await userService.getProfile(userId);

      // Get recent messages
      const recentMessages = await memoryService.getSessionMessages(sessionId);

      // Get active goals
      const goals = await userService.getGoals(userId, 'active');

      // Get skill levels
      const skills = await userService.getSkillLevels(userId);

      // Search relevant memories
      const memories = await memoryService.searchMemories(userId, userMessage, {
        limit: 5,
      });

      return {
        user_id: userId,
        session_id: sessionId,
        user_message: userMessage,
        user_profile: profile.profile || {},
        recent_memory: memories.map(m => m.text),
        active_goals: goals.map(g => g.title),
        skill_levels: skills.reduce((acc, skill) => {
          acc[skill.topic] = skill.level;
          return acc;
        }, {} as Record<string, number>),
        confusion_patterns: [],
      };
    } catch (error) {
      logger.error({ error, userId }, 'Failed to build agent context');
      throw error;
    }
  }

  /**
   * Generate a simple response (Phase 1 implementation)
   * Phase 2 will replace this with full multi-agent orchestration
   */
  private async generateSimpleResponse(context: AgentContext): Promise<string> {
    const systemPrompt = llmService.getSystemPrompt({
      name: (context.user_profile as any).full_name,
      goals: context.active_goals,
      preferences: context.user_profile,
    });

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: context.user_message },
    ];

    const completion = await llmService.generateCompletion(messages);

    return completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
  }

  /**
   * Generate streaming response
   */
  async generateStreamingResponse(
    userId: string,
    sessionId: string,
    userMessage: string
  ) {
    try {
      const context = await this.buildContext(userId, sessionId, userMessage);

      const systemPrompt = llmService.getSystemPrompt({
        name: (context.user_profile as any).full_name,
        goals: context.active_goals,
        preferences: context.user_profile,
      });

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: context.user_message },
      ];

      // Store user message
      await memoryService.storeMessage(userId, sessionId, 'user', userMessage);

      return await llmService.generateStreamingCompletion(messages);
    } catch (error) {
      logger.error({ error, userId, sessionId }, 'Streaming response failed');
      throw error;
    }
  }
}

export const agentService = new AgentService();
