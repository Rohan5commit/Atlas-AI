'use client';
import { useMemo, useState } from 'react';
import { useAtlas } from '@/components/state';
import { spendingSummary } from '@/lib/analytics';

export default function AskAtlasPage(){
  const [q,setQ]=useState('Why is my risk score high?');
  const [answer,setAnswer]=useState('');
  const [loading,setLoading]=useState(false);
  const {transactions,portfolio}=useAtlas();
  const summary = spendingSummary(transactions);
  const context = useMemo(()=>({
    health: summary.health,
    totalSpend: summary.totalSpend,
    totalIncome: summary.totalIncome,
    savingsRate: summary.savingsRate,
    categories: summary.byCat,
    holdings: (portfolio as {ticker:string; quantity:number}[]).map((h:{ticker:string; quantity:number})=>({ticker:h.ticker, quantity:h.quantity}))
  }),[summary,portfolio]);

  const ask=async()=>{
    setLoading(true);
    try{
      const res=await fetch('/api/chat/atlas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,context})});
      const data=await res.json();
      setAnswer(data.answer || data.error || 'Insufficient data');
    } finally { setLoading(false); }
  };

  return <section className='space-y-4'>
    <h2 className='text-3xl font-semibold'>Ask Atlas</h2>
    <p className='text-slate-300 text-sm'>Atlas answers using only computed app metrics from your uploaded data.</p>
    <textarea className='card w-full min-h-24' value={q} onChange={e=>setQ(e.target.value)} />
    <button className='btn' onClick={ask} disabled={loading}>{loading?'Analyzing...':'Ask'}</button>
    <div className='card'>
      <p>{answer || 'No answer yet. Ask a grounded question about your uploaded data.'}</p>
      <p className='text-xs text-slate-400 mt-2'>Evidence: health score, category totals, savings rate, portfolio weights.</p>
    </div>
  </section>
}
