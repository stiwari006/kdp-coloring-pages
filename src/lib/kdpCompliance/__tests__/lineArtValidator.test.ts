import { validateLineArt } from '../lineArtValidator';
import sharp from 'sharp';

describe('validateLineArt', () => {
  // Helper to create a test image buffer
  async function createTestImage(
    whiteRatio: number,
    blackRatio: number,
    midToneRatio: number
  ): Promise<Buffer> {
    const width = 100;
    const height = 100;
    const totalPixels = width * height;
    const whitePixels = Math.floor(totalPixels * whiteRatio);
    const blackPixels = Math.floor(totalPixels * blackRatio);
    const midTonePixels = totalPixels - whitePixels - blackPixels;

    const pixels: number[] = [];

    // Add white pixels (value 255)
    for (let i = 0; i < whitePixels; i++) {
      pixels.push(255);
    }

    // Add black pixels (value 0)
    for (let i = 0; i < blackPixels; i++) {
      pixels.push(0);
    }

    // Add mid-tone pixels (value 128)
    for (let i = 0; i < midTonePixels; i++) {
      pixels.push(128);
    }

    // Shuffle to randomize positions
    for (let i = pixels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
    }

    // Create image buffer
    const image = sharp(Buffer.from(pixels), {
      raw: {
        width,
        height,
        channels: 1,
      },
    });

    return image.png().toBuffer();
  }

  it('should validate a good line art image', async () => {
    // 70% white, 20% black, 10% mid-tones (just at threshold)
    const imageBuffer = await createTestImage(0.7, 0.2, 0.1);
    const result = await validateLineArt(imageBuffer);

    expect(result.ok).toBe(true);
  });

  it('should reject image with too much shading', async () => {
    // 60% white, 10% black, 30% mid-tones (too much shading)
    const imageBuffer = await createTestImage(0.6, 0.1, 0.3);
    const result = await validateLineArt(imageBuffer);

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('shading');
  });

  it('should reject image without enough white background', async () => {
    // 50% white, 30% black, 20% mid-tones (not enough white)
    const imageBuffer = await createTestImage(0.5, 0.3, 0.2);
    const result = await validateLineArt(imageBuffer);

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('white');
  });

  it('should reject blank image', async () => {
    // 99% white, 0.5% black, 0.5% mid-tones (almost blank)
    const imageBuffer = await createTestImage(0.99, 0.005, 0.005);
    const result = await validateLineArt(imageBuffer);

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('blank');
  });

  it('should reject image with too much black', async () => {
    // 40% white, 55% black, 5% mid-tones (too much black)
    const imageBuffer = await createTestImage(0.4, 0.55, 0.05);
    const result = await validateLineArt(imageBuffer);

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('Too much black');
  });

  it('should handle invalid image buffer gracefully', async () => {
    const invalidBuffer = Buffer.from('not an image');
    const result = await validateLineArt(invalidBuffer);

    expect(result.ok).toBe(false);
    expect(result.reason).toBeDefined();
  });
});
