import Link from 'next/link';

export default function Home() {
  return (
    <div className='space-y-32 pb-20'>
      {/* Hero Section */}
      <section className='relative text-center space-y-8 max-w-4xl mx-auto pt-20'>
        <div className='absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full -z-10' />
        <h1 className='text-7xl font-extrabold tracking-tight leading-tight text-gradient'>
          Your Financial <br /> <span className='text-cyan-400'>North Star.</span>
        </h1>
        <p className='text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed'>
          Atlas AI is a grounded financial copilot for the next generation of investors. 
          Transform messy CSV data into institutional-grade intelligence with deterministic analytics and generative AI.
        </p>
        <div className='flex items-center justify-center gap-4 pt-4'>
          <Link className='btn-primary text-lg px-10 py-4' href='/demo'>Launch Live Demo</Link>
          <Link className='btn-secondary text-lg px-10 py-4' href='/architecture'>System Architecture</Link>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className='space-y-12'>
        <div className='text-center space-y-4'>
          <h2 className='text-4xl font-bold'>Intelligence, Grounded.</h2>
          <p className='text-slate-400'>Moving beyond simple budgeting to deep financial forensics.</p>
        </div>
        <div className='grid md:grid-cols-3 gap-6'>
          <div className='glass-card md:col-span-2 space-y-4 group'>
            <div className='w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors'>
              <span className='text-2xl'>📈</span>
            </div>
            <h3 className='text-2xl font-bold'>Deterministic Forecasting</h3>
            <p className='text-slate-400 leading-relaxed'>
              Unlike traditional apps, Atlas uses a probabilistic cashflow engine to project 30 and 90-day balances with 
              base, best, and worst-case scenarios based on your actual volatility.
            </p>
          </div>
          <div className='glass-card space-y-4 group'>
            <div className='w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors'>
              <span className='text-2xl'>⚠️</span>
            </div>
            <h3 className='text-2xl font-bold'>Anomaly Detection</h3>
            <p className='text-slate-400 leading-relaxed'>
              Automatic detection of spending spikes using standard deviation thresholds. 
              Identify leakage before it becomes a trend.
            </p>
          </div>
          <div className='glass-card space-y-4 group'>
            <div className='w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors'>
              <span className='text-2xl'>🛡️</span>
            </div>
            <h3 className='text-2xl font-bold'>Portfolio Risk</h3>
            <p className='text-slate-400 leading-relaxed'>
              Analyze concentration risk and potential drawdown shocks. 
              Understand exactly how a 10% market dip impacts your net worth.
            </p>
          </div>
          <div className='glass-card md:col-span-2 space-y-4 group shimmer'>
            <div className='w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors'>
              <span className='text-2xl'>🤖</span>
            </div>
            <h3 className='text-2xl font-bold'>Grounded AI Copilot</h3>
            <p className='text-slate-400 leading-relaxed'>
              Powered by Llama-3.1, Atlas doesn't guess. It injects your computed financial metrics 
              directly into the model's context, ensuring every answer is evidence-based.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className='space-y-12 py-20 border-t border-slate-800/50'>
        <div className='text-center space-y-4'>
          <h2 className='text-4xl font-bold'>How it Works</h2>
          <p className='text-slate-400'>Three steps from raw data to financial clarity.</p>
        </div>
        <div className='grid md:grid-cols-3 gap-12'>
          {[
            { step: '01', title: 'Secure Import', desc: 'Upload your transaction and portfolio CSVs. All data stays in your browser session.' },
            { step: '02', title: 'Deterministic Analysis', desc: 'Our engine computes health scores, anomalies, and cashflow projections.' },
            { step: '03', title: 'AI-Driven Guidance', desc: 'Ask Atlas specific questions to get a personalized, grounded action plan.' },
          ].map((item, i) => (
            <div key={i} className='relative space-y-4 text-center group'>
              <div className='text-6xl font-black text-slate-800 absolute -top-10 left-1/2 -translate-x-1/2 z-0 group-hover:text-cyan-500/20 transition-colors'>{item.step}</div>
              <div className='relative z-10 space-y-2'>
                <h3 className='text-xl font-bold'>{item.title}</h3>
                <p className='text-slate-400 text-sm leading-relaxed'>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
