import { Pinecone } from '@pinecone-database/pinecone';
import { env } from './env';

/**
 * Pinecone client for vector operations
 * Used for semantic memory search and storage
 */
export const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

/**
 * Get the Pinecone index
 */
export function getPineconeIndex() {
  return pinecone.index(env.PINECONE_INDEX_NAME);
}

/**
 * Initialize Pinecone index if it doesn't exist
 * This should be run during deployment setup
 */
export async function initializePineconeIndex() {
  try {
    const indexes = await pinecone.listIndexes();
    const indexExists = indexes.indexes?.some(
      (index) => index.name === env.PINECONE_INDEX_NAME
    );

    if (!indexExists) {
      console.log(`Creating Pinecone index: ${env.PINECONE_INDEX_NAME}`);
      
      await pinecone.createIndex({
        name: env.PINECONE_INDEX_NAME,
        dimension: 1536, // OpenAI ada-002 embedding dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });

      console.log('Pinecone index created successfully');
    } else {
      console.log('Pinecone index already exists');
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize Pinecone index:', error);
    return false;
  }
}

/**
 * Test Pinecone connection
 */
export async function testPineconeConnection(): Promise<boolean> {
  try {
    const indexes = await pinecone.listIndexes();
    return indexes.indexes !== undefined;
  } catch (error) {
    console.error('Pinecone connection test failed:', error);
    return false;
  }
}
