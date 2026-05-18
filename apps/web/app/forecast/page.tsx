'use client';
import { useAtlas } from '@/components/state';
import { simpleForecast } from '@/lib/analytics';

export default function ForecastPage(){
  const {transactions}=useAtlas();
  const f30=simpleForecast(transactions,30);
  const f90=simpleForecast(transactions,90);
  const p30=f30.points.at(-1);
  const p90=f90.points.at(-1);
  return <section className='space-y-4'>
    <h2 className='text-3xl font-semibold'>Cashflow Forecast</h2>
    <div className='grid md:grid-cols-2 gap-3'>
      <div className='card'><p>30-day projection</p><b>${p30?.base.toFixed(2) ?? '0.00'}</b><p className='text-sm text-slate-400'>Range ${p30?.worst.toFixed(2)} to ${p30?.best.toFixed(2)}</p></div>
      <div className='card'><p>90-day projection</p><b>${p90?.base.toFixed(2) ?? '0.00'}</b><p className='text-sm text-slate-400'>Range ${p90?.worst.toFixed(2)} to ${p90?.best.toFixed(2)}</p></div>
    </div>
    <div className='card'><h3 className='font-semibold mb-2'>Forecast drivers</h3><ul className='list-disc ml-5'>{f30.drivers.map(d=><li key={d}>{d}</li>)}</ul></div>
  </section>
}
