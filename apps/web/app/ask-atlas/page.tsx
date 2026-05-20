'use client';
import { useMemo, useState } from 'react';
import { parseTransactions } from '@/lib/ingest';
import { useAtlas } from '@/components/state';
import { spendingSummary, detectAnomalies } from '@/lib/analytics';

export default function AskAtlasPage(){
  const [q,setQ]=useState('');
  const [answer,setAnswer]=useState('');
  const [loading,setLoading]=useState(false);
  const {transactions,portfolio}=useAtlas();
  const summary = spendingSummary(transactions);
  const anomalies = detectAnomalies(transactions);
  const context = useMemo(()=>({
    health: summary.health,
    totalSpend: summary.totalSpend,
    totalIncome: summary.totalIncome,
    savingsRate: summary.savingsRate,
    categories: summary.byCat,
    holdings: (portfolio as {ticker:string; quantity:number}[]).map((h:{ticker:string; quantity:number})=>({ticker:h.ticker, quantity:h.quantity})),
    anomalies
  }),[summary,portfolio,transactions]);

  const ask=async(query:string)=>{
    setQ(query);
    setLoading(true);
    try{
      const res=await fetch('/api/chat/atlas',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({question:query,context,transactions})
      });
      const data=await res.json();
      setAnswer(data.answer || data.error || 'Insufficient data');
    } finally { setLoading(false); }
  };

  const suggestions = [
    "Why is my financial health score " + summary.health + "?",
    "What is my biggest spending category?",
    "How can I improve my savings rate?",
    "Is my portfolio too concentrated in one asset?"
  ];

  return <section className='space-y-6 max-w-3xl'>
    <div className='space-y-2'>
      <h2 className='text-3xl font-semibold'>Ask Atlas</h2>
      <p className='text-slate-400'>Get grounded financial advice based on your real-time metrics.</p>
    </div>
    <div className='space-y-3'>
      <div className='flex gap-2'>
        <textarea className='card flex-1 min-h-24 resize-none' placeholder='Ask about your spending, savings, or portfolio risk...' value={q} onChange={e=>setQ(e.target.value)} />
        <button className='btn px-6' onClick={()=>ask(q)} disabled={loading || !q.trim()}>{loading?'...':'Ask'}</button>
      </div>
      <div className='flex flex-wrap gap-2'>
        {suggestions.map(s=><button key={s} className='text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-700' onClick={()=>ask(s)}>{s}</button>)}
      </div>
    </div>
    <div className='card bg-slate-900/50 border-cyan-900/30'>
      <div className='flex items-center gap-2 text-sm font-medium text-cyan-400 mb-3'>
        <div className='w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse'/><span>Atlas Analysis</span>
      </div>
      <p className='leading-relaxed text-slate-200'>{answer || 'No analysis yet. Select a suggested question or type your own.'}</p>
      <div className='mt-4 pt-4 border-t border-slate-800 flex justify-between items-center'>
        <span className='text-[10px] uppercase tracking-wider text-slate-500 font-bold'>Grounded in your data</span>
        <span className='text-[10px] text-slate-500'>Llama-3.1-70B</span>
      </div>
    </div>
  </section>
}
