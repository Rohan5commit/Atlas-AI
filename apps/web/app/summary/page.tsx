'use client';
import { useAtlas } from '@/components/state';
import { spendingSummary } from '@/lib/analytics';

export default function SummaryPage(){
  const {transactions}=useAtlas();
  const s=spendingSummary(transactions);
  const topCat = Object.entries(s.byCat).sort((a,b)=>b[1]-a[1])[0];
  const topName = topCat?.[0] || 'Discretionary spending';
  const topValue = topCat?.[1] || 0;
  const impact = Math.round(topValue * 0.25);

  return <section className='space-y-4'>
    <h2 className='text-3xl font-semibold'>Action Plan Summary</h2>
    <div className='card'>1) Reduce {topName.toLowerCase()} by 25%. Why: highest spending pressure. Estimated impact: ${impact}/month. Confidence: 0.78.</div>
    <div className='card'>2) Protect your savings rate above {(Math.max(10, s.savingsRate*100)).toFixed(0)}%. Why: improves runway and goal feasibility. Estimated impact: +1 to +2 weeks faster on medium goals. Confidence: 0.72.</div>
    <div className='card'>3) Review recurring charges monthly. Why: recurring leakage compounds. Estimated impact: $40-$120/month depending on subscriptions. Confidence: 0.65.</div>
  </section>
}
