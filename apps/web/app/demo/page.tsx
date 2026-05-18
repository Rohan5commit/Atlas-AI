'use client';
import Link from 'next/link';
import Papa from 'papaparse';
import { useAtlas } from '@/components/state';
import { normalizeTransactions } from '@/lib/analytics';

export default function Demo(){
  const {setTransactions,setPortfolio,transactions}=useAtlas();
  const parse=(file:File,kind:'tx'|'pf')=>Papa.parse(file,{header:true,skipEmptyLines:true,complete:(res)=>{
    if(kind==='tx') setTransactions(normalizeTransactions((res.data as any[]).map(r=>({
      date:r.date||r.Date,
      merchant:r.merchant||r.description||r.Merchant,
      amount:Math.abs(Number(r.amount||r.Amount||0)),
      type:(Number(r.amount||r.Amount||0)>=0?'credit':'debit')
    }))));
    else setPortfolio((res.data as any[]).map(r=>({ticker:r.ticker||r.symbol,quantity:Number(r.quantity||0),costBasis:Number(r.cost_basis||0)})));
  }});

  return <div className='space-y-4'>
    <h2 className='text-3xl font-semibold'>Secure Import</h2>
    <p className='text-slate-300'>Upload your real transaction CSV and optional portfolio CSV. No seeded demo data is used.</p>
    <div className='grid md:grid-cols-2 gap-4'>
      <label className='card'>Upload transactions CSV<input aria-label='transactions csv' type='file' onChange={e=>e.target.files&&parse(e.target.files[0],'tx')} /></label>
      <label className='card'>Upload portfolio CSV<input aria-label='portfolio csv' type='file' onChange={e=>e.target.files&&parse(e.target.files[0],'pf')} /></label>
    </div>
    <Link className='btn' href='/dashboard'>{transactions.length ? 'Open dashboard' : 'Upload transactions first'}</Link>
  </div>
}
