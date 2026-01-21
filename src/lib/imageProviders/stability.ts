// @ts-ignore - Module resolution will work at runtime when node_modules is installed
import axios from 'axios';
import { ImageProvider, ImageProviderConfig } from './types';
import { env } from '../env';

export class StabilityProvider implements ImageProvider {
  private apiKey: string;
  private baseUrl = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

  constructor() {
    if (!env.STABILITY_API_KEY) {
      throw new Error('STABILITY_API_KEY is required for Stability AI provider');
    }
    this.apiKey = env.STABILITY_API_KEY;
  }

  // @ts-ignore - Buffer type is available at runtime via Node.js
  async generateColoringPage(config: ImageProviderConfig): Promise<Buffer> {
    const { prompt, width, height, seed } = config;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          text_prompts: [{ text: prompt, weight: 1 }],
          cfg_scale: 7,
          height,
          width,
          steps: 30,
          samples: 1,
          ...(seed && { seed }),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          responseType: 'json',
        }
      );

      const imageBase64 = response.data.artifacts[0]?.base64;
      if (!imageBase64) {
        throw new Error('No image data returned from Stability AI');
      }

      // @ts-ignore - Buffer is available at runtime via Node.js
      return Buffer.from(imageBase64, 'base64');
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; message?: string };
      if (err.response?.status === 429) {
        throw new Error('Stability AI rate limit exceeded. Please try again later.');
      }
      const message = err.message || (error instanceof Error ? error.message : String(error));
      throw new Error(`Stability AI image generation failed: ${message}`);
    }
  }
}
