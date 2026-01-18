import { FastifyInstance } from 'fastify';
import { agentService } from '../services/agent';
import { memoryService } from '../services/memory';
import type { ApiResponse, ChatRequest, ChatResponse } from 'shared-types';

/**
 * Chat routes
 */
export async function chatRoutes(fastify: FastifyInstance) {
  /**
   * POST /chat
   * Send a chat message and get response
   * Supports both regular and streaming responses
   */
  fastify.post<{ Body: ChatRequest }>('/chat', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', minLength: 1 },
          session_id: { type: 'string' },
          context: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const user = (request as any).user;
    const { message, session_id, context } = request.body;

    // Create or use existing session
    let sessionId = session_id;
    if (!sessionId) {
      const session = await memoryService.createSession(user.id);
      sessionId = session.id;
    }

    // Check if client wants streaming
    const acceptsStream = request.headers.accept?.includes('text/event-stream');

    if (acceptsStream) {
      // Streaming response
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      try {
        const stream = await agentService.generateStreamingResponse(
          user.id,
          sessionId,
          message
        );

        let fullResponse = '';

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            reply.raw.write(`data: ${JSON.stringify({ type: 'token', content })}\n\n`);
          }
        }

        // Store the full response
        await memoryService.storeMessage(user.id, sessionId, 'assistant', fullResponse);

        // Send done event
        reply.raw.write(`data: ${JSON.stringify({ type: 'done', session_id: sessionId })}\n\n`);
        reply.raw.end();
      } catch (error) {
        reply.raw.write(`data: ${JSON.stringify({ type: 'error', error: 'Failed to generate response' })}\n\n`);
        reply.raw.end();
      }
    } else {
      // Regular response
      const result = await agentService.orchestrate(user.id, sessionId, message);

      const response: ApiResponse<ChatResponse> = {
        success: true,
        data: {
          response: result.final_response,
          session_id: sessionId,
          message_id: '', // Will be set after storing
          metadata: {
            memory_updates: result.memory_updates,
            topics_discussed: [],
          },
        },
        timestamp: new Date().toISOString(),
      };

      return reply.send(response);
    }
  });

  /**
   * GET /chat/sessions
   * Get user's chat sessions
   */
  fastify.get('/chat/sessions', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = (request as any).user;

    const { data, error } = await fastify.supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(50);

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

  /**
   * GET /chat/sessions/:sessionId
   * Get session messages
   */
  fastify.get<{ Params: { sessionId: string } }>('/chat/sessions/:sessionId', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { sessionId } = request.params;

    const messages = await memoryService.getSessionMessages(sessionId);

    const response: ApiResponse = {
      success: true,
      data: messages,
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });

  /**
   * POST /chat/sessions/:sessionId/end
   * End a chat session
   */
  fastify.post<{ 
    Params: { sessionId: string };
    Body: { summary?: string };
  }>('/chat/sessions/:sessionId/end', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { sessionId } = request.params;
    const { summary } = request.body;

    const session = await memoryService.endSession(sessionId, summary);

    const response: ApiResponse = {
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });
}
