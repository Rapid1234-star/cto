import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

/**
 * Request logging middleware
 */
export async function loggingMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const startTime = Date.now();

  reply.addHook('onSend', async () => {
    const duration = Date.now() - startTime;

    logger.info({
      request: {
        method: request.method,
        url: request.url,
        params: request.params,
        query: request.query,
        headers: {
          'user-agent': request.headers['user-agent'],
          'content-type': request.headers['content-type'],
        },
      },
      response: {
        statusCode: reply.statusCode,
        duration: `${duration}ms`,
      },
    }, 'Request completed');
  });
}
