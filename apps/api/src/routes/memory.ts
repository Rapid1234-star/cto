import { FastifyInstance } from 'fastify';
import { memoryService } from '../services/memory';
import type { ApiResponse, MemoryQueryRequest, MemoryQueryResponse } from 'shared-types';

/**
 * Memory routes
 */
export async function memoryRoutes(fastify: FastifyInstance) {
  /**
   * POST /memory/query
   * Search user memories
   */
  fastify.post<{ Body: MemoryQueryRequest }>('/memory/query', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', minLength: 1 },
          memory_types: { 
            type: 'array',
            items: { type: 'string', enum: ['short_term', 'medium_term', 'long_term'] }
          },
          limit: { type: 'number', minimum: 1, maximum: 50 },
          time_range: {
            type: 'object',
            properties: {
              start: { type: 'string' },
              end: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const user = (request as any).user;
    const { query, limit, time_range } = request.body;

    const results = await memoryService.searchMemories(user.id, query, {
      limit,
      timeRange: time_range,
    });

    const responseData: MemoryQueryResponse = {
      results: results.map(r => ({
        id: r.id,
        content: r.text,
        score: r.score,
        metadata: r.metadata,
      })),
      summary: results.length > 0 
        ? `Found ${results.length} relevant memories` 
        : 'No relevant memories found',
    };

    const response: ApiResponse<MemoryQueryResponse> = {
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });

  /**
   * GET /memory/recent
   * Get recent activity
   */
  fastify.get<{ Querystring: { days?: number } }>('/memory/recent', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = (request as any).user;
    const { days = 30 } = request.query;

    const activity = await memoryService.getRecentActivity(user.id, days);

    const response: ApiResponse = {
      success: true,
      data: activity,
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });

  /**
   * GET /memory/summaries
   * Get memory summaries
   */
  fastify.get<{ Querystring: { type?: string } }>('/memory/summaries', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = (request as any).user;
    const { type } = request.query;

    let query = fastify.supabase
      .from('memory_summaries')
      .select('*')
      .eq('user_id', user.id);

    if (type) {
      query = query.eq('memory_type', type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const response: ApiResponse = {
      success: true,
      data: data || [],
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });
}
