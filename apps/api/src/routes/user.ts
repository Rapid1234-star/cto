import { FastifyInstance } from 'fastify';
import { userService } from '../services/user';
import type { 
  ApiResponse, 
  GetProfileResponse, 
  UpdateProfileRequest,
  CreateGoalRequest,
  UpdateGoalRequest 
} from 'shared-types';

/**
 * User routes
 */
export async function userRoutes(fastify: FastifyInstance) {
  /**
   * GET /user/profile
   * Get user profile with stats
   */
  fastify.get('/user/profile', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = (request as any).user;

    const profile = await userService.getProfile(user.id);

    const response: ApiResponse<GetProfileResponse> = {
      success: true,
      data: profile as GetProfileResponse,
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });

  /**
   * PATCH /user/profile
   * Update user profile
   */
  fastify.patch<{ Body: UpdateProfileRequest }>('/user/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          full_name: { type: 'string' },
          bio: { type: 'string' },
          communication_style: { type: 'object' },
          learning_preferences: { type: 'object' },
          timezone: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const user = (request as any).user;
    const updates = request.body;

    const updatedProfile = await userService.updateProfile(user.id, updates);

    const response: ApiResponse = {
      success: true,
      data: updatedProfile,
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });

  /**
   * GET /user/goals
   * Get user goals
   */
  fastify.get<{ Querystring: { status?: string } }>('/user/goals', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = (request as any).user;
    const { status } = request.query;

    const goals = await userService.getGoals(user.id, status);

    const response: ApiResponse = {
      success: true,
      data: goals,
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });

  /**
   * POST /user/goals
   * Create a new goal
   */
  fastify.post<{ Body: CreateGoalRequest }>('/user/goals', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['title', 'category'],
        properties: {
          title: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          category: { type: 'string', enum: ['learning', 'project', 'skill', 'habit'] },
          priority: { type: 'number', minimum: 1, maximum: 10 },
          target_date: { type: 'string' },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const user = (request as any).user;
    const goalData = request.body;

    const goal = await userService.createGoal(user.id, goalData);

    const response: ApiResponse = {
      success: true,
      data: goal,
      timestamp: new Date().toISOString(),
    };

    return reply.code(201).send(response);
  });

  /**
   * PATCH /user/goals/:goalId
   * Update a goal
   */
  fastify.patch<{ 
    Params: { goalId: string };
    Body: UpdateGoalRequest;
  }>('/user/goals/:goalId', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = (request as any).user;
    const { goalId } = request.params;
    const updates = request.body;

    const goal = await userService.updateGoal(user.id, goalId, updates);

    const response: ApiResponse = {
      success: true,
      data: goal,
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });

  /**
   * GET /user/skills
   * Get user skill levels
   */
  fastify.get('/user/skills', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = (request as any).user;

    const skills = await userService.getSkillLevels(user.id);

    const response: ApiResponse = {
      success: true,
      data: skills,
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });

  /**
   * PUT /user/skills/:topic
   * Update skill level
   */
  fastify.put<{ 
    Params: { topic: string };
    Body: { level: number; notes?: string };
  }>('/user/skills/:topic', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['level'],
        properties: {
          level: { type: 'number', minimum: 0, maximum: 10 },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const user = (request as any).user;
    const { topic } = request.params;
    const { level, notes } = request.body;

    const skill = await userService.updateSkillLevel(user.id, topic, level, notes);

    const response: ApiResponse = {
      success: true,
      data: skill,
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });
}
