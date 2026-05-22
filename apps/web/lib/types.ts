export type Transaction = { date: string; merchant: string; amount: number; type: 'debit'|'credit'; category?: string };
export type PortfolioHolding = { ticker: string; quantity: number; costBasis?: number; sector?: string };
export type ForecastResult = { horizon: 30|90; points: {date:string; base:number; best:number; worst:number}[]; drivers: string[] };
export type AnomalyAlert = { id: string; reason: string; severity: 'low'|'medium'|'high'; confidence: number; merchant: string; amount: number; date: string };
export type ImportResult<T> = { data: T[]; errors: string[] };
export type DataSummary = {
  totalRows: number;
  dateRange: { from: string; to: string };
  totalInflow: number;
  totalOutflow: number;
  netCashflow: number;
  topCategories: { name: string; total: number }[];
  largestTransactions: { date: string; description: string; amount: number }[];
  anomaliesSummary: string;
  forecastSummary: string;
};

