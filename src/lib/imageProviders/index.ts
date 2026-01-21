import { ImageProvider } from './types';
import { OpenAIProvider } from './openai';
import { StabilityProvider } from './stability';
import { ReplicateProvider } from './replicate';
import { env } from '../env';

let providerInstance: ImageProvider | null = null;

export function getImageProvider(): ImageProvider {
  if (providerInstance) {
    return providerInstance;
  }

  try {
    switch (env.IMAGE_PROVIDER) {
      case 'openai':
        if (!env.OPENAI_API_KEY) {
          throw new Error(
            'OPENAI_API_KEY is required. Please set it in your .env file. ' +
            'See README.md for setup instructions.'
          );
        }
        providerInstance = new OpenAIProvider();
        break;
      case 'stability':
        if (!env.STABILITY_API_KEY) {
          throw new Error(
            'STABILITY_API_KEY is required. Please set it in your .env file. ' +
            'See README.md for setup instructions.'
          );
        }
        providerInstance = new StabilityProvider();
        break;
      case 'replicate':
        if (!env.REPLICATE_API_TOKEN) {
          throw new Error(
            'REPLICATE_API_TOKEN is required. Please set it in your .env file. ' +
            'See README.md for setup instructions.'
          );
        }
        providerInstance = new ReplicateProvider();
        break;
      default:
        throw new Error(`Unknown image provider: ${env.IMAGE_PROVIDER}`);
    }
    return providerInstance;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    throw new Error(`Failed to initialize image provider: ${err.message}`);
  }
}

export type { ImageProvider, ImageProviderConfig } from './types';
