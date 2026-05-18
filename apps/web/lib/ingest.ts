import { z } from 'zod';
import { ImportResult, PortfolioHolding, Transaction } from './types';

const txSchema = z.object({
  date: z.string().min(1),
  merchant: z.string().min(1),
  amount: z.number().finite(),
  type: z.enum(['debit','credit'])
});

const portfolioSchema = z.object({
  ticker: z.string().min(1),
  quantity: z.number().positive(),
  costBasis: z.number().nonnegative().optional()
});

export function parseTransactions(rows: Record<string, unknown>[]): ImportResult<Transaction> {
  const data: Transaction[] = []; const errors: string[] = [];
  rows.forEach((r, i) => {
    const amountRaw = Number(r.amount ?? r.Amount ?? 0);
    const tx = { date: String(r.date ?? r.Date ?? ''), merchant: String(r.merchant ?? r.description ?? r.Merchant ?? ''), amount: Math.abs(amountRaw), type: amountRaw >= 0 ? 'credit' : 'debit' as const };
    const v = txSchema.safeParse(tx);
    if (v.success) data.push(v.data); else errors.push(`Row ${i+1}: invalid transaction fields`);
  });
  return { data, errors };
}

export function parsePortfolio(rows: Record<string, unknown>[]): ImportResult<PortfolioHolding> {
  const data: PortfolioHolding[] = []; const errors: string[] = [];
  rows.forEach((r, i) => {
    const item = { ticker: String(r.ticker ?? r.symbol ?? '').toUpperCase(), quantity: Number(r.quantity ?? 0), costBasis: Number(r.cost_basis ?? r.costBasis ?? 0) };
    const v = portfolioSchema.safeParse(item);
    if (v.success) data.push(v.data); else errors.push(`Row ${i+1}: invalid portfolio fields`);
  });
  return { data, errors };
}
