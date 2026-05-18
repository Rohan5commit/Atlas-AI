import { NextRequest, NextResponse } from 'next/server';
import { detectAnomalies, portfolioRisk, simpleForecast, spendingSummary } from '@/lib/analytics';

export async function run(kind:string, req:NextRequest){
  const body = await req.json().catch(()=>({}));
  const tx = body.transactions||[]; const pf=body.portfolio||[];
  if(kind==='spending') return NextResponse.json(spendingSummary(tx));
  if(kind==='forecast') return NextResponse.json({day30:simpleForecast(tx,30),day90:simpleForecast(tx,90)});
  if(kind==='anomalies') return NextResponse.json(detectAnomalies(tx));
  if(kind==='portfolio') return NextResponse.json(portfolioRisk(pf));
  if(kind==='scenario'){ const {target,months,monthlySavings=220,cut=0}=body; const improved=monthlySavings*months+cut*months; return NextResponse.json({feasible:improved>=target,improved,shortfall:Math.max(0,target-improved)}); }
  if(kind==='chat'){ const s=spendingSummary(tx); return NextResponse.json({answer:`Health score ${s.health}. Biggest category ${Object.entries(s.byCat).sort((a,b)=>b[1]-a[1])[0]?.[0]||'N/A'}.`,evidence:['Computed from uploaded ledger','Category totals and savings-rate engine']}); }
  return NextResponse.json({summary:'Atlas action plan ready'});
}
