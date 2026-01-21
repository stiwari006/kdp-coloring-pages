export type Audience = 'toddlers' | 'kids' | 'adults';

export interface PromptConfig {
  audience: Audience;
  niche?: string;
  description?: string;
}

const BASE_TEMPLATE = `Black and white coloring page interior for Amazon KDP, single subject centered, thick clean outlines, pure black lines, no shading, no gray, no gradients, no halftone, no background, white background only, line art only, printable, 300 DPI, no text, no watermark, centered composition, simple clean contours, safe for commercial use.`;

const AUDIENCE_RULES: Record<Audience, string> = {
  toddlers: 'very simple shapes, minimal detail, large open areas',
  kids: 'moderate detail, friendly style, clear outlines',
  adults: 'intricate patterns, detailed line art, high complexity',
};

/**
 * Build KDP-compliant prompt from user input
 * Never send raw user prompt to image provider
 */
export function buildKdpPrompt(config: PromptConfig): string {
  const { audience, niche, description } = config;

  const audienceRule = AUDIENCE_RULES[audience];
  let prompt = `${BASE_TEMPLATE} ${audienceRule}`;

  if (niche) {
    prompt += `, ${niche}`;
  }

  if (description) {
    prompt += `, ${description}`;
  }

  return prompt.trim();
}
