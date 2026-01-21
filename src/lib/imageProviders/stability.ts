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

      return Buffer.from(imageBase64, 'base64');
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Stability AI rate limit exceeded. Please try again later.');
      }
      throw new Error(`Stability AI image generation failed: ${error.message}`);
    }
  }
}
