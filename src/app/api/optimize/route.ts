import { NextRequest, NextResponse } from 'next/server';
import { optimizePrompt } from '@/lib/prompt-optimization/optimizer';
import type { OptimizationMode } from '@/lib/prompt-optimization/types';

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (typeof body.prompt !== 'string' || !body.prompt.trim()) return NextResponse.json({ error: 'A prompt is required.' }, { status: 400 });
  const optimizationMode: OptimizationMode = ['balanced', 'aggressive', 'quality_first'].includes(body.optimizationMode) ? body.optimizationMode : 'balanced';
  return NextResponse.json(optimizePrompt({ prompt: body.prompt, optimizationMode, targetModel: typeof body.targetModel === 'string' ? body.targetModel : 'gpt-4o' }));
}
