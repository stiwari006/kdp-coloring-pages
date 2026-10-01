export type OptimizationMode = 'balanced' | 'aggressive' | 'quality_first';

export type OptimizationRequest = { prompt: string; optimizationMode: OptimizationMode; targetModel: string };
export type OptimizationChange = { title: string; reason: string };
export type OptimizationResult = {
  originalPrompt: string; optimizedPrompt: string; originalTokens: number; optimizedTokens: number;
  tokensSaved: number; savingsPercentage: number; estimatedOriginalCost: number; estimatedOptimizedCost: number;
  estimatedSavings: number; qualityScore: number; confidence: 'High' | 'Medium' | 'Low';
  changes: OptimizationChange[]; warnings: string[];
  recommendation: { title: string; reduction: number; confidence: 'High' | 'Medium' | 'Low' };
};

export interface TokenCounter { count(text: string): number; }
