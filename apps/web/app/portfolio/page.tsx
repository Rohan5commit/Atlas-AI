'use client';
import { useAtlas } from '@/components/state';
import { portfolioRisk } from '@/lib/analytics';

export default function PortfolioPage(){
  const {portfolio}=useAtlas();
  const p=portfolioRisk(portfolio);
  return <section className='space-y-4'>
    <h2 className='text-3xl font-semibold'>Portfolio Risk</h2>
    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-3'>
      <div className='card'><p>Portfolio value</p><b>${p.totalValue.toFixed(2)}</b></div>
      <div className='card'><p>Concentration</p><b>{(p.concentration*100).toFixed(1)}%</b></div>
      <div className='card'><p>Volatility</p><b>{(p.volatility*100).toFixed(1)}%</b></div>
      <div className='card'><p>Shock @ -10%</p><b>${p.shock10.toFixed(2)}</b></div>
    </div>
    <div className='card text-sm text-slate-300'>
      Higher concentration increases volatility and drawdown risk. For first-time investors, spreading exposure across diversified funds can reduce downside stress.
    </div>
  </section>
}
