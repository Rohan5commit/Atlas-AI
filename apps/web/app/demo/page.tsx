'use client';
import Link from 'next/link';
import Papa from 'papaparse';
import { useAtlas } from '@/components/state';
import { normalizeTransactions } from '@/lib/analytics';
import { parsePortfolio, parseTransactions } from '@/lib/ingest';
import { useState } from 'react';

export default function Demo(){
  const {setTransactions,setPortfolio,transactions}=useAtlas();
  const [errors, setErrors] = useState<string[]>([]);
  const parse=(file:File,kind:'tx'|'pf')=>Papa.parse(file,{header:true,skipEmptyLines:true,complete:(res)=>{
    if(kind==='tx'){
      const result = parseTransactions((res.data as Record<string, unknown>[]));
      setTransactions(normalizeTransactions(result.data));
      setErrors(result.errors);
    } else {
      const result = parsePortfolio((res.data as Record<string, unknown>[]));
      setPortfolio(result.data);
      setErrors(result.errors);
    }
  }});

  return <div className='space-y-4'>
    <h2 className='text-3xl font-semibold'>Secure Import</h2>
    <p className='text-slate-300'>Upload your real transaction CSV and optional portfolio CSV. Validation runs on every row.</p>
    <div className='grid md:grid-cols-2 gap-4'>
      <label className='card'>Upload transactions CSV<input aria-label='transactions csv' type='file' onChange={e=>e.target.files&&parse(e.target.files[0],'tx')} /></label>
      <label className='card'>Upload portfolio CSV<input aria-label='portfolio csv' type='file' onChange={e=>e.target.files&&parse(e.target.files[0],'pf')} /></label>
    </div>
    {errors.length>0 && <div className='card border-rose-600 text-rose-300'><b>Validation issues</b><ul>{errors.slice(0,5).map(e=><li key={e}>{e}</li>)}</ul></div>}
    <Link className='btn' href='/dashboard'>{transactions.length ? 'Open dashboard' : 'Upload transactions first'}</Link>
  </div>
}
