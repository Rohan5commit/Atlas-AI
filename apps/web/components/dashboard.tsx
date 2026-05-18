'use client';
import { useAtlas } from './state';
import { detectAnomalies, portfolioRisk, simpleForecast, spendingSummary } from '@/lib/analytics';
export function DashboardCore(){ const {transactions,portfolio}=useAtlas(); const s=spendingSummary(transactions); const f=simpleForecast(transactions,30); const a=detectAnomalies(transactions); const p=portfolioRisk(portfolio);
return <div className='space-y-4'><div className='grid md:grid-cols-4 gap-3'><div className='card'><p>Monthly spend</p><b>${s.totalSpend.toFixed(0)}</b></div><div className='card'><p>Savings rate</p><b>{(s.savingsRate*100).toFixed(1)}%</b></div><div className='card'><p>Health score</p><b>{s.health}/100</b></div><div className='card'><p>Portfolio value</p><b>${p.totalValue.toFixed(0)}</b></div></div><div className='card'><p>30-day forecast end balance: ${f.points.at(-1)?.base.toFixed(0)}</p></div><div className='card'><p>Anomalies detected: {a.length}</p></div></div> }
