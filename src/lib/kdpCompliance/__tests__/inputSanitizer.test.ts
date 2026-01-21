import { sanitizeInput } from '../inputSanitizer';

describe('sanitizeInput', () => {
  it('should reject empty input', () => {
    const result = sanitizeInput('');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('empty');
  });

  it('should reject Disney characters', () => {
    const result = sanitizeInput('mickey mouse coloring page');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('copyrighted');
  });

  it('should reject Marvel characters', () => {
    const result = sanitizeInput('spiderman');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('copyrighted');
  });

  it('should reject Pokemon', () => {
    const result = sanitizeInput('pikachu');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('copyrighted');
  });

  it('should reject trademark terms', () => {
    const result = sanitizeInput('nike logo');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('trademark');
  });

  it('should accept valid input', () => {
    const result = sanitizeInput('cute animals');
    expect(result.isValid).toBe(true);
    expect(result.sanitized).toBe('cute animals');
  });

  it('should trim whitespace', () => {
    const result = sanitizeInput('  cute animals  ');
    expect(result.isValid).toBe(true);
    expect(result.sanitized).toBe('cute animals');
  });

  it('should reject input that is too long', () => {
    const longInput = 'a'.repeat(501);
    const result = sanitizeInput(longInput);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('too long');
  });

  it('should be case insensitive for blocklist', () => {
    const result = sanitizeInput('MICKEY MOUSE');
    expect(result.isValid).toBe(false);
  });

  it('should handle partial matches in blocklist', () => {
    const result = sanitizeInput('I want a mickey mouse style');
    expect(result.isValid).toBe(false);
  });
});
