'use client';
import Link from 'next/link';
import Papa from 'papaparse';
import { useAtlas } from '@/components/state';
import { normalizeTransactions } from '@/lib/analytics';
import txDemo from '../../data/sample-transactions/student-transactions.json';
import pfDemo from '../../data/sample-portfolios/beginner-portfolio.json';

export default function Demo(){ const {setTransactions,setPortfolio}=useAtlas();
const loadDemo=()=>{setTransactions(normalizeTransactions(txDemo as any));setPortfolio(pfDemo as any)};
const parse=(file:File,kind:'tx'|'pf')=>Papa.parse(file,{header:true,complete:(res)=>{if(kind==='tx')setTransactions(normalizeTransactions((res.data as any[]).map(r=>({date:r.date||r.Date,merchant:r.merchant||r.description||r.Merchant,amount:Math.abs(Number(r.amount||r.Amount)),type:(Number(r.amount||r.Amount)>=0?'credit':'debit')})))); else setPortfolio((res.data as any[]).map(r=>({ticker:r.ticker||r.symbol,quantity:Number(r.quantity),costBasis:Number(r.cost_basis||0)})));}});
return <div className='space-y-4'><h2 className='text-3xl font-semibold'>Demo Onboarding</h2><button className='btn' onClick={loadDemo}>Use demo dataset</button><div className='grid md:grid-cols-2 gap-4'><label className='card'>Upload transactions CSV<input type='file' onChange={e=>e.target.files&&parse(e.target.files[0],'tx')} /></label><label className='card'>Upload portfolio CSV<input type='file' onChange={e=>e.target.files&&parse(e.target.files[0],'pf')} /></label></div><Link className='btn' href='/dashboard'>Open dashboard</Link></div>}
