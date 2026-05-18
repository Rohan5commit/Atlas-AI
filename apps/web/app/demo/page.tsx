'use client';
import Link from 'next/link';
import Papa from 'papaparse';
import { useAtlas } from '@/components/state';
import { normalizeTransactions } from '@/lib/analytics';
import { parsePortfolio, parseTransactions } from '@/lib/ingest';
import { useState } from 'react';

export default function Demo(){
  const {setTransactions,setPortfolio,transactions,portfolio}=useAtlas();
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const parse=(file:File,kind:'tx'|'pf')=>{
    setIsUploading(true);
    Papa.parse(file,{header:true,skipEmptyLines:true,complete:(res)=>{
      if(kind==='tx'){
        const result = parseTransactions((res.data as Record<string, unknown>[]));
        setTransactions(normalizeTransactions(result.data));
        setErrors(result.errors);
      } else {
        const result = parsePortfolio((res.data as Record<string, unknown>[]));
        setPortfolio(result.data);
        setErrors(result.errors);
      }
      setIsUploading(false);
    }});
  };

  const clearData=()=>{
    setTransactions([]);
    setPortfolio([]);
    setErrors([]);
  };

  return <div className='space-y-6 max-w-3xl'>
    <div className='space-y-2'>
      <h2 className='text-3xl font-semibold'>Secure Import</h2>
      <p className='text-slate-400'>Upload your financial data. All processing is local to your session; no data is stored on our servers.</p>
    </div>
    <div className='grid md:grid-cols-2 gap-6'>
      <div className='space-y-2'>
        <p className='text-sm font-medium text-slate-300'>Transactions CSV</p>
        <label className='card flex flex-col items-center justify-center gap-4 border-dashed border-2 cursor-pointer hover:bg-slate-800/50 transition-all group'>
          <span className='text-sm text-slate-400 group-hover:text-cyan-400 transition-colors'>{transactions.length ? `${transactions.length} rows loaded` : 'Click to upload'}</span>
          <input aria-label='transactions csv' type='file' accept='.csv' className='hidden' onChange={e=>e.target.files&&parse(e.target.files[0],'tx')} />
        </label>
      </div>
      <div className='space-y-2'>
        <p className='text-sm font-medium text-slate-300'>Portfolio CSV (Optional)</p>
        <label className='card flex flex-col items-center justify-center gap-4 border-dashed border-2 cursor-pointer hover:bg-slate-800/50 transition-all group'>
          <span className='text-sm text-slate-400 group-hover:text-cyan-400 transition-colors'>{portfolio.length ? `${portfolio.length} holdings loaded` : 'Click to upload'}</span>
          <input aria-label='portfolio csv' type='file' accept='.csv' className='hidden' onChange={e=>e.target.files&&parse(e.target.files[0],'pf')} />
        </label>
      </div>
    </div>
    {errors.length>0 && <div className='card border-rose-600/50 bg-rose-950/20 text-rose-300 p-4'>
      <div className='flex items-center gap-2 mb-2 font-semibold'><div className='w-1.5 h-1.5 rounded-full bg-rose-500'/><span>Validation issues detected</span></div>
      <ul className='text-sm space-y-1 list-disc pl-4 opacity-80'>{errors.slice(0,5).map((e,i)=><li key={i}>{e}</li>)}</ul>
      {errors.length>5 && <p className='text-xs mt-2 opacity-60'>...and {errors.length-5} more issues.</p>}
    </div>}
    <div className='flex gap-4 pt-4'>
      <Link className='btn flex-1 justify-center' href='/dashboard'>{transactions.length ? 'Open Dashboard' : 'Upload Transactions First'}</Link>
      {(transactions.length || portfolio.length) && <button className='btn bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 px-4' onClick={clearData}>Clear</button>}
    </div>
    {isUploading && <div className='text-center text-sm text-cyan-400 animate-pulse'>Processing files...</div>}
  </div>
}

