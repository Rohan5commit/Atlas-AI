'use client';
import { useAtlas } from '@/components/state';
import { spendingSummary } from '@/lib/analytics';

export default function SpendingPage(){
  const {transactions}=useAtlas();
  const s=spendingSummary(transactions);
  const categories = Object.entries(s.byCat).sort((a,b)=>b[1]-a[1]);
  return <section className='space-y-4'>
    <h2 className='text-3xl font-semibold'>Spending Analysis</h2>
    <div className='grid md:grid-cols-3 gap-3'>
      <div className='card'><p>Total spend</p><b>${s.totalSpend.toFixed(2)}</b></div>
      <div className='card'><p>Total income</p><b>${s.totalIncome.toFixed(2)}</b></div>
      <div className='card'><p>Savings rate</p><b>{(s.savingsRate*100).toFixed(1)}%</b></div>
    </div>
    <div className='card'>
      <h3 className='font-semibold mb-2'>Category pressure</h3>
      {categories.length===0 ? <p className='text-slate-400'>Upload transaction data to view category-level pressure.</p> :
      <ul className='space-y-2'>{categories.map(([name,value])=><li key={name} className='flex justify-between border-b border-slate-800 pb-1'><span>{name}</span><span>${value.toFixed(2)} ({((value/s.totalSpend)*100||0).toFixed(1)}%)</span></li>)}</ul>}
    </div>
  </section>
}
