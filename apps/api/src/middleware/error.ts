import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { isAppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ErrorCode, ApiError } from 'shared-types';

/**
 * Global error handler middleware
 */
export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Log error
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
    },
    request: {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
    },
  }, 'Request error');

  // Handle application errors
  if (isAppError(error)) {
    const response: ApiError = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      timestamp: new Date().toISOString(),
    };

    reply.status(error.statusCode).send(response);
    return;
  }

  // Handle Fastify validation errors
  if ((error as FastifyError).validation) {
    const response: ApiError = {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: {
          validation: (error as FastifyError).validation,
        },
      },
      timestamp: new Date().toISOString(),
    };

    reply.status(400).send(response);
    return;
  }

  // Handle generic errors
  const response: ApiError = {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
    },
    timestamp: new Date().toISOString(),
  };

  reply.status(500).send(response);
}
