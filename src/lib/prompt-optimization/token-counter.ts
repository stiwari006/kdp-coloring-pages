import type { TokenCounter } from './types';

/** Safe fallback used until provider-specific tokenizers are configured. */
export class ApproximateTokenCounter implements TokenCounter {
  count(text: string) { return text.trim() ? Math.max(1, Math.ceil(text.trim().split(/\s+/).length * 1.28)) : 0; }
}
export class OpenAITokenCounter extends ApproximateTokenCounter {}
export class AnthropicTokenCounter extends ApproximateTokenCounter {}
export class GeminiTokenCounter extends ApproximateTokenCounter {}

export function counterForModel(model: string): TokenCounter {
  if (model.startsWith('claude')) return new AnthropicTokenCounter();
  if (model.startsWith('gemini')) return new GeminiTokenCounter();
  if (model.startsWith('gpt')) return new OpenAITokenCounter();
  return new ApproximateTokenCounter();
}
