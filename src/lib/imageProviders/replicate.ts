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
      return Buffer.from(arrayBuffer);
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error('Replicate rate limit exceeded. Please try again later.');
      }
      throw new Error(`Replicate image generation failed: ${error.message}`);
    }
  }
}
