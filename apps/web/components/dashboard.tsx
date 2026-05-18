'use client';
import { useAtlas } from './state';
import { detectAnomalies, portfolioRisk, simpleForecast, spendingSummary } from '@/lib/analytics';

export function DashboardCore(){
  const {transactions,portfolio}=useAtlas();
  const s=spendingSummary(transactions);
  const f=simpleForecast(transactions,30);
  const a=detectAnomalies(transactions);
  const p=portfolioRisk(portfolio);

  const healthColor = s.health > 70 ? 'text-emerald-400' : s.health > 40 ? 'text-amber-400' : 'text-rose-400';

  return <div className='space-y-6'>
    <div className='grid md:grid-cols-4 gap-4'>
      <div className='card flex flex-col justify-between h-32'>
        <p className='text-xs font-medium text-slate-400 uppercase tracking-wider'>Monthly Spend</p>
        <b className='text-3xl'>${s.totalSpend.toFixed(0)}</b>
      </div>
      <div className='card flex flex-col justify-between h-32'>
        <p className='text-xs font-medium text-slate-400 uppercase tracking-wider'>Savings Rate</p>
        <b className='text-3xl'>{(s.savingsRate*100).toFixed(1)}%</b>
      </div>
      <div className='card flex flex-col justify-between h-32 border-l-4 border-l-cyan-500'>
        <p className='text-xs font-medium text-slate-400 uppercase tracking-wider'>Health Score</p>
        <b className={`text-3xl ${healthColor}`}>{s.health}/100</b>
      </div>
      <div className='card flex flex-col justify-between h-32'>
        <p className='text-xs font-medium text-slate-400 uppercase tracking-wider'>Portfolio Value</p>
        <b className='text-3xl'>${p.totalValue.toFixed(0)}</b>
      </div>
    </div>
    <div className='grid md:grid-cols-3 gap-6'>
      <div className='card md:col-span-2 space-y-3'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-300'><span>📈</span> <span>30-Day Forecast</span></div>
        <p className='text-2xl font-semibold'>Est. Balance: ${f.points.at(-1)?.base.toFixed(0)}</p>
        <p className='text-sm text-slate-400'>Based on: {f.drivers.join(', ')}</p>
      </div>
      <div className='card space-y-3'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-300'><span>🔄</span> <span>Recurring Patterns</span></div>
        <p className='text-sm'>{ (s as any).recurring?.length ? `${(s as any).recurring.length} detected patterns` : 'No recurring patterns found.'}</p>
        <div className='flex flex-wrap gap-1'>
          {(s as any).recurring?.slice(0,4).map((m:string)=><span key={m} className='text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700'>{m}</span>)}
        </div>
      </div>
    </div>
    <div className='card space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-300'><span>⚠️</span> <span>Anomaly Detection</span></div>
        <span className='text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30'>{a.length} alerts</span>
      </div>
      <div className='grid md:grid-cols-3 gap-3'>
        {a.length > 0 ? a.slice(0,6).map(x=><div key={x.id} className='text-xs p-2 rounded bg-slate-800/50 border border-slate-800 flex justify-between items-center'>
          <span>{x.merchant} <b className='text-slate-100'>${x.amount}</b></span>
          <span className={`text-[10px] font-bold uppercase ${x.severity==='high' ? 'text-rose-400' : 'text-amber-400'}`}>{x.severity}</span>
        </div>) : <p className='text-sm text-slate-500 col-span-3 text-center py-4'>No anomalies detected in current data.</p>}
      </div>
    </div>
  </div>
}
