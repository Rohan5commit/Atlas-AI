'use client';
import { useMemo, useState } from 'react';
import { useAtlas } from '@/components/state';
import { spendingSummary } from '@/lib/analytics';

export default function ScenarioPage(){
  const {transactions}=useAtlas();
  const s=spendingSummary(transactions);
  const [goal,setGoal]=useState(1500);
  const [months,setMonths]=useState(4);
  const [monthlyCut,setMonthlyCut]=useState(120);

  const result = useMemo(()=>{
    const currentMonthly = Math.max(0, (s.totalIncome - s.totalSpend) / Math.max(1, 5));
    const improvedMonthly = Math.max(0, currentMonthly + monthlyCut);
    const currentTotal = currentMonthly * months;
    const improvedTotal = improvedMonthly * months;
    return {
      currentMonthly, improvedMonthly, currentTotal, improvedTotal,
      feasibleNow: currentTotal >= goal,
      feasibleImproved: improvedTotal >= goal,
      shortfallNow: Math.max(0, goal-currentTotal),
      shortfallImproved: Math.max(0, goal-improvedTotal)
    };
  },[s,goal,months,monthlyCut]);

  return <section className='space-y-4'>
    <h2 className='text-3xl font-semibold'>Scenario Planner</h2>
    <div className='grid md:grid-cols-3 gap-3'>
      <label className='card'>Goal amount ($)<input className='w-full mt-2 bg-transparent' type='number' value={goal} onChange={e=>setGoal(Number(e.target.value||0))} /></label>
      <label className='card'>Timeline (months)<input className='w-full mt-2 bg-transparent' type='number' value={months} onChange={e=>setMonths(Number(e.target.value||1))} /></label>
      <label className='card'>Extra monthly savings ($)<input className='w-full mt-2 bg-transparent' type='number' value={monthlyCut} onChange={e=>setMonthlyCut(Number(e.target.value||0))} /></label>
    </div>
    <div className='grid md:grid-cols-2 gap-3'>
      <div className='card'><p>Current path</p><b>${result.currentTotal.toFixed(2)}</b><p className='text-sm text-slate-400'>{result.feasibleNow ? 'Goal feasible' : `Shortfall $${result.shortfallNow.toFixed(2)}`}</p></div>
      <div className='card'><p>Improved path</p><b>${result.improvedTotal.toFixed(2)}</b><p className='text-sm text-slate-400'>{result.feasibleImproved ? 'Goal feasible' : `Shortfall $${result.shortfallImproved.toFixed(2)}`}</p></div>
    </div>
  </section>
}
