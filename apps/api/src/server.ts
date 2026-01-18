import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env';
import { supabaseAdmin, testDatabaseConnection } from './config/database';
import { testOpenAIConnection } from './config/llm';
import { testPineconeConnection } from './config/vector';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';
import { authRoutes } from './routes/auth';
import { chatRoutes } from './routes/chat';
import { userRoutes } from './routes/user';
import { memoryRoutes } from './routes/memory';

/**
 * Create and configure Fastify server
 */
async function createServer() {
  const fastify = Fastify({
    logger: logger as any,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
  });

  // Register plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: parseInt(env.RATE_LIMIT_MAX),
    timeWindow: parseInt(env.RATE_LIMIT_TIMEWINDOW),
  });

  // Add supabase to fastify instance
  fastify.decorate('supabase', supabaseAdmin);

  // Add authentication decorator
  fastify.decorate('authenticate', authMiddleware);

  // Set error handler
  fastify.setErrorHandler(errorHandler);

  // Health check endpoint
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    };
  });

  // Root endpoint
  fastify.get('/', async () => {
    return {
      name: 'ThinkCompanion API',
      version: '0.1.0',
      status: 'running',
      docs: '/docs',
    };
  });

  // Register routes
  await fastify.register(authRoutes);
  await fastify.register(chatRoutes);
  await fastify.register(userRoutes);
  await fastify.register(memoryRoutes);

  return fastify;
}

/**
 * Start the server
 */
async function start() {
  try {
    logger.info('Starting ThinkCompanion API...');

    // Test connections
    logger.info('Testing service connections...');

    const [dbOk, openaiOk, pineconeOk] = await Promise.all([
      testDatabaseConnection(),
      testOpenAIConnection(),
      testPineconeConnection(),
    ]);

    if (!dbOk) {
      logger.error('Database connection failed');
      process.exit(1);
    }

    if (!openaiOk) {
      logger.warn('OpenAI connection failed - chat functionality may be limited');
    }

    if (!pineconeOk) {
      logger.warn('Pinecone connection failed - memory search may be limited');
    }

    logger.info('Service connections verified');

    // Create and start server
    const fastify = await createServer();

    const address = await fastify.listen({
      port: parseInt(env.PORT),
      host: env.HOST,
    });

    logger.info(`Server listening on ${address}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Frontend URL: ${env.FRONTEND_URL}`);

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach(signal => {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, starting graceful shutdown...`);

        try {
          await fastify.close();
          logger.info('Server closed successfully');
          process.exit(0);
        } catch (error) {
          logger.error({ error }, 'Error during shutdown');
          process.exit(1);
        }
      });
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled rejection');
  process.exit(1);
});

// Start the server
start();
