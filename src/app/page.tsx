'use client';

import { FormEvent, useMemo, useState } from 'react';

type Mode = 'balanced' | 'aggressive' | 'quality_first';
type Result = {
  originalPrompt: string; optimizedPrompt: string; originalTokens: number; optimizedTokens: number;
  tokensSaved: number; savingsPercentage: number; estimatedOriginalCost: number; estimatedOptimizedCost: number;
  estimatedSavings: number; qualityScore: number; confidence: string; changes: { title: string; reason: string }[];
  warnings: string[]; recommendation: { title: string; reduction: number; confidence: string };
};

const samplePrompt = `Please carefully analyze the following customer data. I would like you to provide a detailed and comprehensive analysis of the most important trends. Please make sure that you identify any unusual patterns, explain the reasons behind those patterns where possible, and provide actionable recommendations that the business can use. First analyze the data, then tell me the important trends, after that explain anomalies and finally provide recommendations. Prioritize the most significant findings.`;

function BrandMark() { return <span className="brand-mark"><span>✦</span></span>; }
function Spark() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" fill="currentColor"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" fill="currentColor"/></svg>; }
function Check() { return <span className="check">✓</span>; }

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<Mode>('balanced');
  const [model, setModel] = useState('gpt-4o');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const count = useMemo(() => prompt.trim() ? Math.ceil(prompt.trim().split(/\s+/).length * 1.28) : 0, [prompt]);

  async function optimize(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/optimize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, optimizationMode: mode, targetModel: model }) });
      setResult(await res.json());
    } finally { setLoading(false); }
  }
  return <main>
    <nav className="nav shell"><a className="brand" href="#top"><BrandMark/> PromptSaver <i>AI</i></a><div className="nav-links"><a href="#how">How it works</a><a href="#pricing">Pricing</a><button className="sign-in">Sign in</button><button className="nav-cta">Start optimizing <span>→</span></button></div></nav>
    <section id="top" className="hero shell">
      <div className="eyebrow"><Spark/> AI cost optimization, made simple</div>
      <h1>Cut your AI costs <em>without changing</em><br/>what you ask.</h1>
      <p className="lead">PromptSaver analyzes your AI prompts, removes unnecessary tokens,<br className="desktop"/> and estimates how much you could save.</p>
      <form className="optimizer-card" onSubmit={optimize}>
        <div className="prompt-head"><label htmlFor="prompt">Your prompt</label><span>{count ? `~${count.toLocaleString()} estimated tokens` : 'Estimated token count'}</span></div>
        <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Paste your AI prompt here..." />
        <div className="tool-row"><div className="select-wrap"><span className="select-label">Optimization mode</span><select value={mode} onChange={e => setMode(e.target.value as Mode)}><option value="balanced">Balanced</option><option value="aggressive">Aggressive</option><option value="quality_first">Quality First</option></select></div><div className="select-wrap"><span className="select-label">Target model</span><select value={model} onChange={e => setModel(e.target.value)}><option value="gpt-4o">GPT-4o</option><option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option><option value="gemini-1.5-pro">Gemini 1.5 Pro</option></select></div><button className="optimize" disabled={!prompt.trim() || loading}>{loading ? 'Optimizing…' : <><Spark/> Optimize my prompt <b>→</b></>}</button></div>
        <button type="button" className="sample" onClick={() => setPrompt(samplePrompt)}>Try an example <span>→</span></button>
      </form>
      <p className="fine-print">No sign-up required <span>•</span> Your prompts are never stored</p>
    </section>
    {result ? <Report result={result} /> : <Preview />}
    <section className="trusted"><p>BUILT FOR PEOPLE WHO USE AI EVERY DAY</p><div><span>OPENAI</span><span>Anthropic</span><span>Google</span><span>Perplexity</span><span>Vercel</span></div></section>
    <section id="how" className="how shell"><div><div className="eyebrow"><Spark/> HOW IT WORKS</div><h2>Smarter prompts.<br/><em>Lower costs.</em></h2></div><div className="steps"><article><b>01</b><h3>Paste your prompt</h3><p>Drop in any prompt you use with your favorite AI tool.</p></article><article><b>02</b><h3>We find the waste</h3><p>Our engine identifies redundant words and overly verbose instructions.</p></article><article><b>03</b><h3>Save without sacrifice</h3><p>Get a leaner prompt that preserves your intent and quality.</p></article></div></section>
    <footer className="shell"><a className="brand" href="#top"><BrandMark/> PromptSaver <i>AI</i></a><p>Same intent. Less tokens. Lower AI cost.</p><span>© 2025 PromptSaver AI</span></footer>
  </main>;
}

function Preview() { return <section className="preview shell"><div className="preview-top"><span>SEE WHAT YOU COULD SAVE</span><p>Your results will appear here</p></div><div className="ghost-results"><div/><div/><div/></div></section>; }
function Report({ result }: { result: Result }) { const money = (n:number) => `$${n < .01 ? n.toFixed(4) : n.toFixed(3)}`; return <section className="report shell"><div className="report-heading"><div><div className="eyebrow"><Spark/> YOUR OPTIMIZATION REPORT</div><h2>Same intent. <em>Less spend.</em></h2></div><div className="efficiency"><span>Prompt efficiency</span><strong>{Math.max(1, result.qualityScore - result.savingsPercentage)} <i>→</i> {result.qualityScore}</strong><small>out of 100</small></div></div><div className="metrics"><Metric label="Token reduction" value={`${result.originalTokens.toLocaleString()} → ${result.optimizedTokens.toLocaleString()}`} sub={`${result.tokensSaved.toLocaleString()} tokens saved`}/><Metric label="Reduction" value={`${result.savingsPercentage}%`} sub="of input tokens" accent/><Metric label="Estimated savings" value={money(result.estimatedSavings)} sub={`${money(result.estimatedOriginalCost)} → ${money(result.estimatedOptimizedCost)} per request`}/></div><div className="comparison"><div><header>ORIGINAL <span>~{result.originalTokens} TOKENS</span></header><p>{result.originalPrompt}</p></div><div><header>OPTIMIZED <span>~{result.optimizedTokens} TOKENS</span></header><p>{result.optimizedPrompt}</p></div></div><div className="opportunities"><div><h3>Optimization opportunities</h3>{result.changes.map(c => <p key={c.title}><Check/><b>{c.title}</b><small>{c.reason}</small></p>)}</div><aside><span>MODEL RECOMMENDATION</span><h3>{result.recommendation.title}</h3><p>Based on prompt complexity, a lower-cost model may be potentially suitable.</p><div><b>~{result.recommendation.reduction}%</b><small>potential cost reduction</small></div></aside></div><p className="estimate-note">Estimates exclude output tokens, caching, tool calls, and reasoning tokens. Actual provider costs may vary.</p></section>; }
function Metric({label,value,sub,accent}: {label:string;value:string;sub:string;accent?:boolean}) {return <article className={accent ? 'metric accent' : 'metric'}><span>{label}</span><strong>{value}</strong><small>{sub}</small></article>}
