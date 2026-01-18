import { getPineconeIndex } from '../config/vector';
import { llmService } from './llm';
import { logger } from '../utils/logger';
import { generateId } from '../utils/helpers';

/**
 * Vector service for managing embeddings in Pinecone
 */
export class VectorService {
  /**
   * Store a text with its embedding
   */
  async storeText(
    userId: string,
    text: string,
    metadata: Record<string, unknown> = {}
  ): Promise<string> {
    try {
      const embedding = await llmService.generateEmbedding(text);
      const vectorId = `${userId}-${generateId()}`;

      const index = getPineconeIndex();
      await index.upsert([
        {
          id: vectorId,
          values: embedding,
          metadata: {
            userId,
            text,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        },
      ]);

      logger.info({ userId, vectorId }, 'Text stored in vector database');
      return vectorId;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to store text in vector database');
      throw error;
    }
  }

  /**
   * Store multiple texts with their embeddings
   */
  async storeTexts(
    userId: string,
    texts: Array<{ text: string; metadata?: Record<string, unknown> }>
  ): Promise<string[]> {
    try {
      const embeddings = await llmService.generateEmbeddings(
        texts.map(t => t.text)
      );

      const vectors = texts.map((item, index) => {
        const vectorId = `${userId}-${generateId()}`;
        return {
          id: vectorId,
          values: embeddings[index],
          metadata: {
            userId,
            text: item.text,
            timestamp: new Date().toISOString(),
            ...item.metadata,
          },
        };
      });

      const index = getPineconeIndex();
      await index.upsert(vectors);

      logger.info({ userId, count: texts.length }, 'Texts stored in vector database');
      return vectors.map(v => v.id);
    } catch (error) {
      logger.error({ error, userId }, 'Failed to store texts in vector database');
      throw error;
    }
  }

  /**
   * Search for similar texts
   */
  async search(
    userId: string,
    query: string,
    options: {
      topK?: number;
      filter?: Record<string, unknown>;
      includeMetadata?: boolean;
    } = {}
  ) {
    try {
      const { topK = 10, filter = {}, includeMetadata = true } = options;

      const queryEmbedding = await llmService.generateEmbedding(query);

      const index = getPineconeIndex();
      const results = await index.query({
        vector: queryEmbedding,
        topK,
        filter: {
          userId,
          ...filter,
        },
        includeMetadata,
      });

      logger.info({ userId, query, resultsCount: results.matches.length }, 'Vector search completed');

      return results.matches.map(match => ({
        id: match.id,
        score: match.score || 0,
        text: match.metadata?.text as string || '',
        metadata: match.metadata || {},
      }));
    } catch (error) {
      logger.error({ error, userId, query }, 'Vector search failed');
      throw error;
    }
  }

  /**
   * Delete vectors for a user
   */
  async deleteUserVectors(userId: string): Promise<void> {
    try {
      const index = getPineconeIndex();
      await index.deleteMany({
        userId,
      });

      logger.info({ userId }, 'User vectors deleted');
    } catch (error) {
      logger.error({ error, userId }, 'Failed to delete user vectors');
      throw error;
    }
  }

  /**
   * Delete specific vector by ID
   */
  async deleteVector(vectorId: string): Promise<void> {
    try {
      const index = getPineconeIndex();
      await index.deleteOne(vectorId);

      logger.info({ vectorId }, 'Vector deleted');
    } catch (error) {
      logger.error({ error, vectorId }, 'Failed to delete vector');
      throw error;
    }
  }
}

export const vectorService = new VectorService();
