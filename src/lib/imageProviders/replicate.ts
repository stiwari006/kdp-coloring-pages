// @ts-ignore - Module resolution will work at runtime when node_modules is installed
import Replicate from 'replicate';
import { ImageProvider, ImageProviderConfig } from './types';
import { env } from '../env';

export class ReplicateProvider implements ImageProvider {
  private replicate: Replicate;
  private model = 'black-forest-labs/flux-dev'; // Can be configured

  constructor() {
    if (!env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is required for Replicate provider');
    }
    this.replicate = new Replicate({ auth: env.REPLICATE_API_TOKEN });
  }

  // @ts-ignore - Buffer type is available at runtime via Node.js
  async generateColoringPage(config: ImageProviderConfig): Promise<Buffer> {
    const { prompt, width, height, seed } = config;

    try {
      const output = await this.replicate.run(
        this.model,
        {
          input: {
            prompt,
            width,
            height,
            ...(seed && { seed }),
          },
        }
      ) as string[];

      if (!output || output.length === 0) {
        throw new Error('No image data returned from Replicate');
      }

      // Replicate returns URLs, fetch the image
      const imageUrl = output[0];
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from Replicate: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      // @ts-ignore - Buffer is available at runtime via Node.js
      return Buffer.from(arrayBuffer);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err.status === 429) {
        throw new Error('Replicate rate limit exceeded. Please try again later.');
      }
      const message = err.message || (error instanceof Error ? error.message : String(error));
      throw new Error(`Replicate image generation failed: ${message}`);
    }
  }
}
