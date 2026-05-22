import { z } from 'zod';
import * as XLSX from 'xlsx';
import { ImportResult, PortfolioHolding, Transaction } from './types';

const txSchema = z.object({
  date: z.string().min(1),
  merchant: z.string().min(1),
  amount: z.number().finite(),
  type: z.enum(['debit', 'credit']),
  category: z.string().optional()
});

export type IBKRData = {
  summary: { startingValue: number, endingValue: number, netChange: number, deposits: number, commissions: number, interest: number, dividends: number, tax: number, endingCash: number, twr: number };
  trades: any[];
  positions: any[];
  performance: any[];
};

export function parseExcelFile(buffer: ArrayBuffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

export function detectFileType(text: string): 'BANK' | 'IBKR' {
  if (text.startsWith('Statement,Header,Field Name,Field Value')) return 'IBKR';
  return 'BANK';
}
...

export function parseIBKR(text: string): IBKRData {
  const lines = text.split('\n');
  const result: IBKRData = { summary: {} as any, trades: [], positions: [], performance: [] };
  
  let currentSection = '';
  lines.forEach(line => {
    const parts = line.split(',');
    if (parts.length < 2) return;
    
    const section = parts[0];
    const rowType = parts[1];
    
    if (section === 'Trades' && rowType === 'Data') result.trades.push(parts);
    if (section === 'Open Positions' && rowType === 'Data') result.positions.push(parts);
    if (section === 'Realized & Unrealized Performance Summary' && rowType === 'Data') result.performance.push(parts);
    
    // Extract Summary fields...
    if (section === 'Change in NAV' && rowType === 'Data') {
      result.summary.startingValue = parseFloat(parts[2]);
      result.summary.endingValue = parseFloat(parts[6]);
      result.summary.netChange = result.summary.endingValue - result.summary.startingValue;
    }
    // (Additional logic for other sections would be here)
  });
  
  return result;
}

export function parseTransactions(rows: Record<string, unknown>[], fileType: 'BANK' | 'IBKR' = 'BANK'): ImportResult<Transaction> {
  if (fileType === 'IBKR') {
      // Logic for IBKR rows
      return { data: [], errors: [] };
  }
  
  const data: Transaction[] = []; const errors: string[] = [];
  rows.forEach((r, i) => {
    const amountRaw = Number(r.amount ?? r.Amount ?? 0);
    const tx = { 
        date: String(r.date ?? r.Date ?? ''), 
        merchant: String(r.merchant ?? r.description ?? r.Merchant ?? ''), 
        amount: Math.abs(amountRaw), 
        type: 'debit' as const // Default to debit for positive-amount CSVs as per prior fix
    };
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

const portfolioSchema = z.object({
  ticker: z.string().min(1),
  quantity: z.number(),
  costBasis: z.number().nonnegative().optional()
});
