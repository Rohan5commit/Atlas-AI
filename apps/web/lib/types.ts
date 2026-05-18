export type ISODateString = string;
export type UUID = string;
export type TickerSymbol = string;

export type TransactionType = 'debit' | 'credit';

export type Severity = 'low' | 'medium' | 'high';

export type ForecastHorizon = 30 | 90;

export interface Money {
  amount: number;
  currency: 'USD' | 'EUR' | 'ILS';
}

export interface Transaction {
  id: UUID;
  date: ISODateString;
  merchant: string;
  amount: Money;
  type: TransactionType;
  category?: string;
}

export interface PortfolioHolding {
  ticker: TickerSymbol;
  quantity: number;
  costBasis?: Money;
  sector?: string;
}

export interface ForecastPoint {
  date: ISODateString;
  base: number;
  best: number;
  worst: number;
}

export interface ForecastResult {
  horizon: ForecastHorizon;
  points: ForecastPoint[];
  drivers: string[];
}

export interface AnomalyAlert {
  id: UUID;
  reason: string;
  severity: Severity;
  confidence: number;
  merchant: string;
  amount: Money;
  date: ISODateString;
}

export interface ActionRecommendation {
  action: string;
  why: string;
  impact: string;
  confidence: number;
}

export interface ImportError {
  row?: number;
  field?: string;
  message: string;
}

export interface ImportResult<T> {
  data: T[];
  errors: ImportError[];
  successCount: number;
  failureCount: number;
}
