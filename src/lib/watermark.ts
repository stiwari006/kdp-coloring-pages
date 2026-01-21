import sharp from 'sharp';

/**
 * Add watermark to image for free plan users
 * Uses thin black outline to avoid introducing gray tones
 */
export async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const watermarkSvg = `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="120"
        font-weight="bold"
        fill="none"
        stroke="black"
        stroke-width="2"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-45 50% 50%)"
        opacity="0.3"
      >
        SAMPLE
      </text>
    </svg>
  `;

  const watermarkBuffer = Buffer.from(watermarkSvg);

  // Composite watermark onto image
  const result = await sharp(imageBuffer)
    .composite([
      {
        input: watermarkBuffer,
        blend: 'over',
      },
    ])
    .png()
    .toBuffer();

  return result;
}
