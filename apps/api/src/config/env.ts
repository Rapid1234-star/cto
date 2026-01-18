import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  HOST: z.string().default('0.0.0.0'),
  
  FRONTEND_URL: z.string().url(),
  
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default('gpt-4-turbo-preview'),
  
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  DATABASE_URL: z.string().optional(),
  
  PINECONE_API_KEY: z.string().min(1),
  PINECONE_INDEX_NAME: z.string().default('thinkcompanion'),
  PINECONE_ENVIRONMENT: z.string().default('us-east-1-aws'),
  
  REDIS_URL: z.string().optional(),
  
  MAIL_PROVIDER: z.enum(['sendgrid', 'resend', 'smtp']).default('sendgrid'),
  SENDGRID_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().email().default('noreply@thinkcompanion.app'),
  
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  RATE_LIMIT_MAX: z.string().default('100'),
  RATE_LIMIT_TIMEWINDOW: z.string().default('60000'),
  
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_PRETTY: z.string().transform(val => val === 'true').default('false'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    console.error(error.errors);
    process.exit(1);
  }
  throw error;
}

export { env };
