import sharp from 'sharp';

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

const WHITE_THRESHOLD = 240; // RGB value above which is considered white
const BLACK_THRESHOLD = 15; // RGB value below which is considered black
const MID_TONE_THRESHOLD = 0.1; // Max 10% of pixels can be mid-tones

/**
 * Validate that image is true black and white line art
 * - No shading (no gray/mid-tones)
 * - White background
 * - Black lines only
 */
export async function validateLineArt(buffer: Buffer): Promise<ValidationResult> {
  try {
    // Convert to grayscale and get raw pixel data
    const { data, info } = await sharp(buffer)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    const totalPixels = width * height;

    let whitePixels = 0;
    let blackPixels = 0;
    let midTonePixels = 0;

    // Analyze pixel values
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (value >= WHITE_THRESHOLD) {
        whitePixels++;
      } else if (value <= BLACK_THRESHOLD) {
        blackPixels++;
      } else {
        midTonePixels++;
      }
    }

    const whiteRatio = whitePixels / totalPixels;
    const blackRatio = blackPixels / totalPixels;
    const midToneRatio = midTonePixels / totalPixels;

    // Check 1: Background should be mostly white (at least 60%)
    if (whiteRatio < 0.6) {
      return {
        ok: false,
        reason: `Background is not white enough (${Math.round(whiteRatio * 100)}% white, need 60%+)`,
      };
    }

    // Check 2: Mid-tones (shading) should be minimal (less than 10%)
    if (midToneRatio > MID_TONE_THRESHOLD) {
      return {
        ok: false,
        reason: `Image contains shading/gray tones (${Math.round(midToneRatio * 100)}% mid-tones, max 10%)`,
      };
    }

    // Check 3: Should have some black content (not blank)
    if (blackRatio < 0.01) {
      return {
        ok: false,
        reason: 'Image appears to be blank (no black lines detected)',
      };
    }

    // Check 4: Black content should be reasonable (not too much, not too little)
    if (blackRatio > 0.5) {
      return {
        ok: false,
        reason: `Too much black content (${Math.round(blackRatio * 100)}%, max 50%)`,
      };
    }

    return { ok: true };
  } catch (error: any) {
    return {
      ok: false,
      reason: `Validation error: ${error.message}`,
    };
  }
}
