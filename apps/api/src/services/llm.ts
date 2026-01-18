import { openai, MODEL_CONFIG, EMBEDDING_MODEL } from '../config/llm';
import { logger } from '../utils/logger';
import { retry } from '../utils/helpers';
import { ServiceUnavailableError } from '../utils/errors';

/**
 * LLM service for interacting with OpenAI
 */
export class LLMService {
  /**
   * Generate a chat completion
   */
  async generateCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: {
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    } = {}
  ) {
    try {
      const response = await retry(
        () => openai.chat.completions.create({
          ...MODEL_CONFIG,
          ...options,
          messages,
        }),
        { maxAttempts: 3, initialDelay: 1000 }
      );

      return response;
    } catch (error) {
      logger.error({ error, messages }, 'Failed to generate completion');
      throw new ServiceUnavailableError('OpenAI');
    }
  }

  /**
   * Generate a streaming chat completion
   */
  async generateStreamingCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: {
      temperature?: number;
      max_tokens?: number;
    } = {}
  ) {
    try {
      const stream = await retry(
        () => openai.chat.completions.create({
          ...MODEL_CONFIG,
          ...options,
          messages,
          stream: true,
        }),
        { maxAttempts: 3, initialDelay: 1000 }
      );

      return stream;
    } catch (error) {
      logger.error({ error, messages }, 'Failed to generate streaming completion');
      throw new ServiceUnavailableError('OpenAI');
    }
  }

  /**
   * Generate text embedding
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await retry(
        () => openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: text,
        }),
        { maxAttempts: 3, initialDelay: 1000 }
      );

      return response.data[0].embedding;
    } catch (error) {
      logger.error({ error, textLength: text.length }, 'Failed to generate embedding');
      throw new ServiceUnavailableError('OpenAI');
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await retry(
        () => openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: texts,
        }),
        { maxAttempts: 3, initialDelay: 1000 }
      );

      return response.data.map(item => item.embedding);
    } catch (error) {
      logger.error({ error, count: texts.length }, 'Failed to generate embeddings');
      throw new ServiceUnavailableError('OpenAI');
    }
  }

  /**
   * System prompt for ThinkCompanion
   */
  getSystemPrompt(userContext?: {
    name?: string;
    goals?: string[];
    preferences?: Record<string, unknown>;
  }): string {
    let prompt = `You are ThinkCompanion, a persistent personal AI cognitive companion. Your role is to be a thoughtful thinking partner who becomes meaningfully better the longer you work with someone.

Key principles:
- Remember context from previous conversations
- Adapt your communication style to the user's preferences
- Help users think through problems rather than just providing answers
- Track and support their learning journey and goals
- Recognize patterns in their thinking and confusion
- Provide continuity across sessions

You should be:
- Thoughtful and reflective
- Supportive but not patronizing
- Clear and concise unless depth is needed
- Adaptive to the user's communication style`;

    if (userContext) {
      prompt += '\n\nUser context:';
      
      if (userContext.name) {
        prompt += `\n- Name: ${userContext.name}`;
      }
      
      if (userContext.goals && userContext.goals.length > 0) {
        prompt += `\n- Active goals: ${userContext.goals.join(', ')}`;
      }
      
      if (userContext.preferences) {
        prompt += `\n- Preferences: ${JSON.stringify(userContext.preferences)}`;
      }
    }

    return prompt;
  }
}

export const llmService = new LLMService();
