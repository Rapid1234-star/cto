import OpenAI from 'openai';
import { env } from './env';

/**
 * OpenAI client for LLM operations
 */
export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/**
 * Default model configuration
 */
export const MODEL_CONFIG = {
  model: env.OPENAI_MODEL,
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

/**
 * Embedding model configuration
 */
export const EMBEDDING_MODEL = 'text-embedding-ada-002';

/**
 * Test OpenAI connection
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    await openai.models.retrieve(env.OPENAI_MODEL);
    return true;
  } catch (error) {
    console.error('OpenAI connection test failed:', error);
    return false;
  }
}
