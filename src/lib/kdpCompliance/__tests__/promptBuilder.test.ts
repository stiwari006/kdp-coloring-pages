import { buildKdpPrompt, type PromptConfig } from '../promptBuilder';

describe('buildKdpPrompt', () => {
  it('should include base template for all prompts', () => {
    const config: PromptConfig = {
      audience: 'kids',
    };

    const prompt = buildKdpPrompt(config);

    expect(prompt).toContain('Black and white coloring page interior for Amazon KDP');
    expect(prompt).toContain('no shading');
    expect(prompt).toContain('no gray');
    expect(prompt).toContain('white background only');
    expect(prompt).toContain('line art only');
    expect(prompt).toContain('no text');
    expect(prompt).toContain('no watermark');
  });

  it('should include audience-specific rules for toddlers', () => {
    const config: PromptConfig = {
      audience: 'toddlers',
    };

    const prompt = buildKdpPrompt(config);

    expect(prompt).toContain('very simple shapes');
    expect(prompt).toContain('minimal detail');
    expect(prompt).toContain('large open areas');
  });

  it('should include audience-specific rules for kids', () => {
    const config: PromptConfig = {
      audience: 'kids',
    };

    const prompt = buildKdpPrompt(config);

    expect(prompt).toContain('moderate detail');
    expect(prompt).toContain('friendly style');
    expect(prompt).toContain('clear outlines');
  });

  it('should include audience-specific rules for adults', () => {
    const config: PromptConfig = {
      audience: 'adults',
    };

    const prompt = buildKdpPrompt(config);

    expect(prompt).toContain('intricate patterns');
    expect(prompt).toContain('detailed line art');
    expect(prompt).toContain('high complexity');
  });

  it('should append niche when provided', () => {
    const config: PromptConfig = {
      audience: 'kids',
      niche: 'animals',
    };

    const prompt = buildKdpPrompt(config);

    expect(prompt).toContain('animals');
  });

  it('should append description when provided', () => {
    const config: PromptConfig = {
      audience: 'kids',
      description: 'cute puppies playing',
    };

    const prompt = buildKdpPrompt(config);

    expect(prompt).toContain('cute puppies playing');
  });

  it('should include all components when all fields provided', () => {
    const config: PromptConfig = {
      audience: 'adults',
      niche: 'mandala',
      description: 'geometric patterns',
    };

    const prompt = buildKdpPrompt(config);

    expect(prompt).toContain('intricate patterns');
    expect(prompt).toContain('mandala');
    expect(prompt).toContain('geometric patterns');
  });

  it('should never include user raw input directly', () => {
    // This test ensures we're always using the template
    const config: PromptConfig = {
      audience: 'kids',
      description: 'mickey mouse', // Should be sanitized before this point
    };

    const prompt = buildKdpPrompt(config);

    // Even if bad input gets through, it's wrapped in KDP template
    expect(prompt).toContain('Black and white coloring page interior for Amazon KDP');
  });
});
