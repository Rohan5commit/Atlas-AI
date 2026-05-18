'use client';import { useAtlas } from '@/components/state';import { spendingSummary } from '@/lib/analytics';
export default function P(){const {transactions}=useAtlas();const s=spendingSummary(transactions);return <div><h2 className='text-3xl font-semibold mb-3'>Spending Analysis</h2><pre className='card overflow-auto'>{JSON.stringify(s.byCat,null,2)}</pre></div>}
