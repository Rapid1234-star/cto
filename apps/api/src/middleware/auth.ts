import { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseAuth } from '../config/database';
import { UnauthorizedError } from '../utils/errors';

/**
 * Extended request with user context
 */
export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
  };
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Attach user to request
    (request as AuthenticatedRequest).user = {
      id: data.user.id,
      email: data.user.email!,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Authentication failed');
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't fail if missing
 */
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data } = await supabaseAuth.auth.getUser(token);

      if (data.user) {
        (request as AuthenticatedRequest).user = {
          id: data.user.id,
          email: data.user.email!,
        };
      }
    }
  } catch {
    // Silently fail for optional auth
  }
}
