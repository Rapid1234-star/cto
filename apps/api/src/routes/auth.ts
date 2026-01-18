import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authService } from '../services/auth';
import type { ApiResponse, MagicLinkRequest, MagicLinkResponse, VerifyTokenRequest, AuthResponse } from 'shared-types';

/**
 * Auth routes
 */
export async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /auth/magic-link
   * Send magic link to email
   */
  fastify.post<{ Body: MagicLinkRequest }>('/auth/magic-link', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          redirect_to: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { email, redirect_to } = request.body;

    await authService.sendMagicLink(email, redirect_to);

    const response: ApiResponse<MagicLinkResponse> = {
      success: true,
      data: {
        message: 'Magic link sent successfully',
        email,
      },
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });

  /**
   * POST /auth/verify
   * Verify magic link token
   */
  fastify.post<{ Body: VerifyTokenRequest }>('/auth/verify', {
    schema: {
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { token } = request.body;

    const result = await authService.verifyToken(token);

    // Ensure user exists in database
    await authService.upsertUser(result.user.id, result.user.email);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: result.user,
        access_token: result.session!.access_token,
        refresh_token: result.session!.refresh_token,
        expires_at: new Date(result.session!.expires_at! * 1000).toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });

  /**
   * POST /auth/logout
   * Sign out user
   */
  fastify.post('/auth/logout', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const token = request.headers.authorization?.substring(7) || '';
    
    await authService.signOut(token);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Logged out successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });

  /**
   * GET /auth/me
   * Get current user
   */
  fastify.get('/auth/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = (request as any).user;

    const response: ApiResponse = {
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  });
}
