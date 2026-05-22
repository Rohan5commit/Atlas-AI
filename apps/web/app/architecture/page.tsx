import Script from 'next/script';

export default function P(){
  const diagram = `
graph TD
  CSV[CSV/JSON Import] --> Parser[lib/ingest.ts]
  Parser --> Norm[lib/analytics.ts]
  Norm --> Dash[Dashboard/KPIs]
  Norm --> Chart[Volume Chart]
  Norm --> Chat[Ask Atlas API]
  Chat --> NVIDIA[NVIDIA LLM API]
  NVIDIA --> Streaming[ReadableStream Response]
  Streaming --> UI[Chat UI]
`;
  return (
    <div className='min-h-screen bg-[#020617] text-slate-200 p-8'>
      <div className='max-w-4xl mx-auto prose prose-invert'>
        <h1 className='text-4xl font-bold text-white mb-4'>Atlas AI System Architecture</h1>
        <p className='text-slate-400 text-lg mb-8'>
          Our architecture focuses on <strong>grounded financial intelligence</strong>, processing data deterministically before leveraging LLMs for natural language explanation.
        </p>
        
        <div className="mermaid bg-white p-6 rounded-xl text-center my-12 shadow-2xl">
          {diagram}
        </div>

        <div className='grid md:grid-cols-1 gap-8 mt-12'>
          <div className='glass-card p-6 border border-slate-800 bg-slate-900/50 rounded-2xl'>
            <h2 className='text-2xl font-semibold text-white mb-4'>Data Pipeline</h2>
            <ul className='space-y-4 text-slate-300'>
              <li><strong>Ingestion:</strong> Client-side parsing using standardized Zod schemas ensures data integrity before it ever leaves the user's browser.</li>
              <li><strong>Analytics Layer:</strong> Deterministic metrics (Net Cashflow, Volatility, Anomalies) computed via <code>analytics.ts</code>.</li>
              <li><strong>Grounded AI:</strong> Context from the analytics layer is injected into the prompt, ensuring the LLM responses are constrained to the user's provided data.</li>
            </ul>
          </div>
        </div>

        <Script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js" strategy="afterInteractive" />
        <Script id="mermaid-init" strategy="afterInteractive">{`
          mermaid.initialize({ startOnLoad: true, theme: 'default' });
        `}</Script>
      </div>
    </div>
  );
}
