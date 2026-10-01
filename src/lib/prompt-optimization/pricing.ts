export type ModelPrice = { id: string; provider: string; name: string; inputPricePerMillion: number; outputPricePerMillion: number; cachedInputPricePerMillion?: number; active: boolean; updatedAt: string };
export const MODEL_PRICING: ModelPrice[] = [
  { id: 'gpt-4o', provider: 'OpenAI', name: 'GPT-4o', inputPricePerMillion: 2.5, outputPricePerMillion: 10, cachedInputPricePerMillion: 1.25, active: true, updatedAt: '2025-01-01' },
  { id: 'claude-3-5-sonnet', provider: 'Anthropic', name: 'Claude 3.5 Sonnet', inputPricePerMillion: 3, outputPricePerMillion: 15, active: true, updatedAt: '2025-01-01' },
  { id: 'gemini-1.5-pro', provider: 'Google', name: 'Gemini 1.5 Pro', inputPricePerMillion: 1.25, outputPricePerMillion: 5, active: true, updatedAt: '2025-01-01' },
];
export function calculateCost(inputTokens: number, modelId: string) { const price = MODEL_PRICING.find(m => m.id === modelId) ?? MODEL_PRICING[0]; return inputTokens / 1_000_000 * price.inputPricePerMillion; }
export function calculateSavings(before: number, after: number) { return Math.max(0, before - after); }
export function calculateAnnualizedSavings(perRequest: number, monthlyRequests = 1000) { return perRequest * monthlyRequests * 12; }
