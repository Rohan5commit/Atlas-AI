'use client';
import { useAtlas } from './state';
import { detectAnomalies, portfolioRisk, simpleForecast, spendingSummary } from '@/lib/analytics';

export function DashboardCore() {
  const { transactions, portfolio } = useAtlas();
  const s = spendingSummary(transactions);
  const f = simpleForecast(transactions, 30);
  const a = detectAnomalies(transactions);
  const p = portfolioRisk(portfolio);

  const healthColor = s.health > 70 ? 'text-emerald-400' : s.health > 40 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className='space-y-6'>
      {/* KPI Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {[
          { label: 'Monthly Spend', value: `$${s.totalSpend.toFixed(0)}`, icon: '💸' },
          { label: 'Savings Rate', value: `${(s.savingsRate * 100).toFixed(1)}%`, icon: '📊' },
          { label: 'Health Score', value: `${s.health}/100`, icon: '❤️', valClass: healthColor },
          { label: 'Portfolio Value', value: `$${p.totalValue.toFixed(0)}`, icon: '🏦' }
        ].map((item, i) => (
          <div key={i} className='glass-card flex flex-col justify-between h-32'>
            <p className='text-xs font-semibold text-slate-400 uppercase tracking-widest'>{item.label}</p>
            <b className={`text-3xl font-bold ${item.valClass}`}>{item.value}</b>
          </div>
        ))}
      </div>

      {/* Secondary Insight Row */}
      <div className='grid md:grid-cols-3 gap-6'>
        <div className='glass-card md:col-span-2 space-y-4'>
          <div className='flex items-center gap-3 text-sm font-semibold text-slate-300'>
            <span className='text-xl'>📈</span> <span>30-Day Cashflow Projection</span>
          </div>
          <p className='text-4xl font-bold'>${f.points.at(-1)?.base.toFixed(0)}</p>
          <div className='flex gap-2 flex-wrap'>
            {f.drivers.map(d => <span key={d} className='text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300'>{d}</span>)}
          </div>
        </div>

        <div className='glass-card space-y-4'>
          <div className='flex items-center gap-3 text-sm font-semibold text-slate-300'>
            <span className='text-xl'>🔄</span> <span>Recurring Subscriptions</span>
          </div>
          <div className='text-3xl font-bold'>{(s as any).recurring?.length || 0}</div>
          <div className='flex flex-wrap gap-2'>
            {(s as any).recurring?.slice(0, 4).map((m: string) => (
              <span key={m} className='text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300'>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Anomaly Section */}
      <div className='glass-card space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3 text-sm font-semibold text-slate-300'>
            <span className='text-xl'>⚠️</span> <span>Anomaly Intelligence</span>
          </div>
          <span className='text-xs font-bold bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20'>{a.length} Alerts</span>
        </div>
        <div className='grid md:grid-cols-3 gap-4'>
          {a.length > 0 ? a.slice(0, 6).map(x => (
            <div key={x.id} className='bg-slate-950/50 border border-slate-800 p-4 rounded-xl flex justify-between items-center group hover:border-rose-900/50 transition-colors'>
              <div className='space-y-1'>
                <p className='text-sm font-bold text-slate-200'>{x.merchant}</p>
                <p className='text-xs text-slate-500'>${x.amount}</p>
              </div>
              <span className={`text-[10px] font-black uppercase ${x.severity === 'high' ? 'text-rose-400' : 'text-amber-400'}`}>
                {x.severity}
              </span>
            </div>
          )) : <p className='text-sm text-slate-500 italic p-4'>No suspicious activity detected in current data.</p>}
        </div>
      </div>
    </div>
  );
}
