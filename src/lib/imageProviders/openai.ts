// @ts-ignore - Module resolution will work at runtime when node_modules is installed
import OpenAI from 'openai';
// @ts-ignore - Module resolution will work at runtime when node_modules is installed
import sharp from 'sharp';
import { ImageProvider, ImageProviderConfig } from './types';
import { env } from '../env';

export class OpenAIProvider implements ImageProvider {
  private client: OpenAI;

  constructor() {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for OpenAI provider');
    }
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  // @ts-ignore - Buffer type is available at runtime via Node.js
  async generateColoringPage(config: ImageProviderConfig): Promise<Buffer> {
    const { prompt, width, height, seed } = config;

    try {
      // DALL-E 3 only supports specific sizes, so we use DALL-E 2 for custom sizes
      // Or generate at supported size and resize
      const isCustomSize = width !== 1024 || height !== 1024;
      
      let response;
      if (isCustomSize) {
        // Use DALL-E 2 for custom sizes (supports more flexibility)
        response = await this.client.images.generate({
          model: 'dall-e-2',
          prompt,
          size: '1024x1024', // Generate at standard size
          n: 1,
          response_format: 'b64_json',
        });
      } else {
        // Use DALL-E 3 for standard sizes
        response = await this.client.images.generate({
          model: 'dall-e-3',
          prompt,
          size: '1024x1024',
          quality: 'standard',
          n: 1,
          response_format: 'b64_json',
        });
      }

      const imageData = response.data[0]?.b64_json;
      if (!imageData) {
        throw new Error('No image data returned from OpenAI');
      }

      // @ts-ignore - Buffer is available at runtime via Node.js
      let imageBuffer: Buffer = Buffer.from(imageData, 'base64');

      // Resize to requested dimensions if needed
      if (isCustomSize) {
        imageBuffer = await sharp(imageBuffer)
          .resize(width, height, {
            fit: 'fill',
            background: { r: 255, g: 255, b: 255 },
          })
          .png()
          .toBuffer();
      }

      return imageBuffer;
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      }
      const message = err.message || (error instanceof Error ? error.message : String(error));
      throw new Error(`OpenAI image generation failed: ${message}`);
    }
  }
}
