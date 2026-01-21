import sharp from 'sharp';
import { getImageProvider } from './imageProviders';
import { buildKdpPrompt, validateLineArt } from './kdpCompliance';
import { addWatermark } from './watermark';
import { getPixelSize, type BookSize } from './kdpSizes';
import { env } from './env';
import type { Audience } from './kdpCompliance/promptBuilder';

export interface ImageGenerationConfig {
  jobId: string;
  pageNumber: number;
  bookSize: BookSize;
  audience: Audience;
  niche?: string;
  description?: string;
  isFreePlan: boolean;
  seed?: number;
}

export interface ImageGenerationResult {
  buffer: Buffer;
  validated: boolean;
}

/**
 * Generate a single coloring page with full KDP compliance
 */
export async function generateColoringPage(
  config: ImageGenerationConfig
): Promise<ImageGenerationResult> {
  const { bookSize, audience, niche, description, isFreePlan, seed } = config;

  // Build KDP-compliant prompt
  const prompt = buildKdpPrompt({ audience, niche, description });

  // Get pixel dimensions for book size
  const { width, height } = getPixelSize(bookSize);

  // Get image provider
  const provider = getImageProvider();

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      // Generate image
      let imageBuffer = await provider.generateColoringPage({
        prompt: attempts > 0 ? `${prompt}, STRONGER NO SHADING, pure binary black and white only` : prompt,
        width,
        height,
        seed: seed ? seed + config.pageNumber : undefined,
      });

      // Convert to PNG if needed and ensure proper format
      imageBuffer = await sharp(imageBuffer)
        .png()
        .toBuffer();

      // Validate line art compliance
      const validation = await validateLineArt(imageBuffer);
      if (!validation.ok) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`Validation failed after ${maxAttempts} attempts: ${validation.reason}`);
        }
        continue;
      }

      // Apply watermark if free plan
      if (isFreePlan) {
        imageBuffer = await addWatermark(imageBuffer);
      }

      return {
        buffer: imageBuffer,
        validated: true,
      };
    } catch (error: any) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    }
  }

  throw new Error('Failed to generate valid coloring page after maximum attempts');
}
