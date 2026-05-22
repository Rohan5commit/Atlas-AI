import { Transaction, PortfolioHolding } from './types';

const categoryMap: Record<string,string> = {
  starbucks:'Coffee', doordash:'Food Delivery', uber:'Transport', grab:'Transport',
  spotify:'Subscriptions', netflix:'Subscriptions', apple:'Tech',
  rent:'Housing', payroll:'Income', salary:'Income',
  fairprice:'Groceries', wholefoods:'Groceries', 'cold storage':'Groceries',
  amazon:'Shopping', lazada:'Shopping', shopee:'Shopping',
  utility:'Utilities', singtel:'Utilities', starhub:'Utilities', mio:'Utilities',
  tuition:'Education', school:'Education',
  restaurant:'Dining', mcdonald:'Dining', kfc:'Dining', hawker:'Dining',
};

export function normalizeTransactions(rows: Transaction[]) {
  return rows.map((r) => {
    const key = r.merchant.toLowerCase();
    const hit = Object.keys(categoryMap).find(k => key.includes(k));
    return { ...r, category: r.category || (hit ? categoryMap[hit] : 'Other') };
  });
}

export function spendingSummary(tx: Transaction[]) {
  // amount is always stored as absolute value; type carries the direction
  const debits  = tx.filter(t => t.type === 'debit');
  const credits = tx.filter(t => t.type === 'credit');
  const totalSpend  = debits.reduce((a, b) => a + Math.abs(b.amount), 0);
  const totalIncome = credits.reduce((a, b) => a + Math.abs(b.amount), 0);

  const byCat = debits.reduce((acc, t) => {
    const cat = t.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
    return acc;
  }, {} as Record<string,number>);

  const maxCat = Math.max(...Object.values(byCat), 1);
  const health = Math.max(0, Math.min(100, Math.round(
    40
    + ((totalIncome - totalSpend) / Math.max(totalIncome, 1)) * 40
    + (1 - maxCat / Math.max(totalSpend, 1)) * 20
  )));

  const merchants = debits.reduce((acc, t) => {
    acc[t.merchant] = (acc[t.merchant] || 0) + 1;
    return acc;
  }, {} as Record<string,number>);
  const recurring = Object.entries(merchants).filter(([, c]) => c >= 2).map(([m]) => m);

  return {
    totalSpend,
    totalIncome,
    savingsRate: totalIncome ? (totalIncome - totalSpend) / totalIncome : 0,
    byCat,
    health,
    recurring,
  };
}

export function simpleForecast(tx: Transaction[], days: 30 | 90) {
  const summary = spendingSummary(tx);

  // Derive actual date range from the data instead of hardcoding 180
  const dates = tx
    .map(t => new Date(t.date).getTime())
    .filter(d => !isNaN(d));
  const spanDays = dates.length >= 2
    ? Math.max(1, (Math.max(...dates) - Math.min(...dates)) / 86_400_000)
    : 30;

  const dailyNet = (summary.totalIncome - summary.totalSpend) / spanDays;

  let balance = 2000;
  const points: { date: string; base: number; best: number; worst: number }[] = [];
  for (let i = 1; i <= days; i++) {
    balance += dailyNet;
    points.push({
      date: `Day ${i}`,
      base:  +balance.toFixed(2),
      best:  +(balance + Math.sqrt(i) * 12).toFixed(2),
      worst: +(balance - Math.sqrt(i) * 20).toFixed(2),
    });
  }
  return {
    horizon: days,
    points,
    drivers: ['Recent net cash flow trend', 'Recurring subscriptions load', 'Spending volatility'],
  };
}

export function detectAnomalies(tx: Transaction[]) {
  const debits = tx.filter(t => t.type === 'debit');
  if (debits.length === 0) return [];

  const amounts = debits.map(t => Math.abs(t.amount));
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const sd   = Math.sqrt(amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length);

  return debits
    .filter(t => Math.abs(t.amount) > mean + 1.5 * sd)
    .map((t, i) => ({
      id:         `a${i}`,
      reason:     `Amount is ${Math.round((Math.abs(t.amount) / Math.max(mean, 1)) * 100)}% of average debit`,
      severity:   Math.abs(t.amount) > mean + 2 * sd ? 'high' : 'medium',
      confidence: Math.min(0.95, 0.65 + (Math.abs(t.amount) - mean) / (4 * (sd || 1))),
      merchant:   t.merchant,
      amount:     Math.abs(t.amount),
      date:       t.date,
    }));
}

export function portfolioRisk(holdings: PortfolioHolding[]) {
  // NOTE: These are illustrative prices for demonstration purposes.
  // In a production environment, this would integrate with a real-time market data provider.
  const prices: Record<string,number> = {
    AAPL:195, MSFT:420, NVDA:1020, VOO:510, TSLA:180, CASH:1, QQQ:450, AMD:160,
  };
  const values = holdings.map(h => ({ ...h, value: h.quantity * (prices[h.ticker] || 100) }));
  const total  = values.reduce((a, b) => a + b.value, 0);
  const top    = values.sort((a, b) => b.value - a.value)[0];
  const conc   = top ? top.value / Math.max(total, 1) : 0;
  return {
    totalValue:   total,
    concentration: conc,
    shock10:      -(total * 0.1),
    volatility:   0.22 + conc * 0.3,
    drawdown:     0.15 + conc * 0.25,
  };
}

export function generateDataSummary(tx: Transaction[]) {
  const summary = spendingSummary(tx);
  const anomalies = detectAnomalies(tx);
  const forecast = simpleForecast(tx, 30);
  
  const sortedByVal = [...tx].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  
  return {
    totalRows: tx.length,
    dateRange: { 
      from: tx.length ? new Date(Math.min(...tx.map(t => new Date(t.date).getTime()))).toISOString().split('T')[0] : '',
      to: tx.length ? new Date(Math.max(...tx.map(t => new Date(t.date).getTime()))).toISOString().split('T')[0] : ''
    },
    totalInflow: summary.totalIncome,
    totalOutflow: summary.totalSpend,
    netCashflow: summary.totalIncome - summary.totalSpend,
    topCategories: Object.entries(summary.byCat).sort((a,b) => b[1] - a[1]).slice(0, 10).map(([name, total]) => ({ name, total })),
    largestTransactions: sortedByVal.slice(0, 10).map(t => ({ date: t.date, description: t.merchant, amount: Math.abs(t.amount) })),
    anomaliesSummary: anomalies.length ? `Detected ${anomalies.length} anomalies.` : 'No significant anomalies.',
    forecastSummary: `Net cashflow trend projects a balance shift of $${(forecast.points[forecast.points.length-1].base - 2000).toFixed(2)} over 30 days.`
  };
}

