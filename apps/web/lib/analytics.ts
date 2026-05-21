import { Transaction, PortfolioHolding } from './types';

const categoryMap: Record<string,string> = { starbucks:'Coffee', doordash:'Food Delivery', uber:'Transport', spotify:'Subscriptions', rent:'Housing', payroll:'Income', wholefoods:'Groceries', amazon:'Shopping', apple:'Tech', netflix:'Subscriptions', utility:'Utilities', tuition:'Education' };

export function normalizeTransactions(rows: Transaction[]) {
  return rows.map((r)=>{ const key=r.merchant.toLowerCase(); const hit=Object.keys(categoryMap).find(k=>key.includes(k)); return {...r, category:r.category|| (hit?categoryMap[hit]:'Other')}; });
}

export function spendingSummary(tx: Transaction[]) {
  const debits = tx.filter(t=>t.type==='debit');
  const credits = tx.filter(t=>t.type==='credit');
  const totalSpend = debits.reduce((a,b)=>a+Math.abs(b.amount),0);
  const totalIncome = credits.reduce((a,b)=>a+b.amount,0);
  const byCat = debits.reduce((acc,t)=>{acc[t.category||'Other']=(acc[t.category||'Other']||0)+Math.abs(t.amount); return acc;}, {} as Record<string,number>);
  const health = Math.max(0, Math.min(100, Math.round(40 + ((totalIncome-totalSpend)/Math.max(totalIncome,1))*40 + (1-Object.values(byCat).reduce((m,v)=>Math.max(m,v),0)/Math.max(totalSpend,1))*20)));
  const merchants = debits.reduce((acc,t)=>{acc[t.merchant]=(acc[t.merchant]||0)+1; return acc;}, {} as Record<string,number>);
  const recurring = Object.entries(merchants).filter(([,c])=>c>=2).map(([m])=>m);
  return { totalSpend,totalIncome,savingsRate: totalIncome?((totalIncome-totalSpend)/totalIncome):0, byCat, health, recurring };
}

export function simpleForecast(tx: Transaction[], days:30|90){
  const summary = spendingSummary(tx);
  const daily = (summary.totalIncome - summary.totalSpend)/180;
  let balance=2000;
  const points=[] as {date:string;base:number;best:number;worst:number}[];
  for(let i=1;i<=days;i++){ balance += daily; points.push({date:`Day ${i}`, base:+balance.toFixed(2), best:+(balance+Math.sqrt(i)*12).toFixed(2), worst:+(balance-Math.sqrt(i)*20).toFixed(2)}); }
  return { horizon:days, points, drivers:['Recent net cash flow trend','Recurring subscriptions load','Spending volatility'] };
}

export function detectAnomalies(tx: Transaction[]){
  const debits = tx.filter(t=>t.type==='debit').map(t => ({...t, amount: Math.abs(t.amount)}));
  const mean = debits.reduce((a,b)=>a+b.amount,0)/Math.max(debits.length,1);
  const sd = Math.sqrt(debits.reduce((a,b)=>a+Math.pow(b.amount-mean,2),0)/Math.max(debits.length,1));
  return debits.filter(t=>t.amount>mean+1.5*sd).map((t,i)=>({id:`a${i}`,reason:`Amount ${Math.round((t.amount/mean)*100)}% of normal debit size`,severity:t.amount>mean+2*sd?'high':'medium',confidence:Math.min(0.95,0.65+(t.amount-mean)/(4*sd||1)),merchant:t.merchant,amount:t.amount,date:t.date}));
}

export function portfolioRisk(holdings: PortfolioHolding[]){
  const prices: Record<string,number> = {AAPL:195,MSFT:420,NVDA:1020,VOO:510,TSLA:180,CASH:1,QQQ:450,AMD:160};
  const values=holdings.map(h=>({ ...h, value:h.quantity*(prices[h.ticker]||100)}));
  const total=values.reduce((a,b)=>a+b.value,0);
  const top=values.sort((a,b)=>b.value-a.value)[0];
  const conc=top?top.value/Math.max(total,1):0;
  return { totalValue:total, concentration:conc, shock10:-(total*0.1), volatility: 0.22 + conc*0.3, drawdown: 0.15 + conc*0.25 };
}
