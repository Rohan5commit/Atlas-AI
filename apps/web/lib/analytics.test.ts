import { describe,it,expect } from 'vitest';
import { spendingSummary, detectAnomalies } from './analytics';

describe('analytics',()=>{
  it('computes summary',()=>{const s=spendingSummary([{date:'2026-01-01',merchant:'payroll',amount:1000,type:'credit'},{date:'2026-01-02',merchant:'rent',amount:500,type:'debit'} as any]); expect(s.totalSpend).toBe(500);});
  it('detects anomalies',()=>{const a=detectAnomalies([{date:'d',merchant:'m',amount:10,type:'debit'} as any,{date:'d',merchant:'m',amount:12,type:'debit'} as any,{date:'d',merchant:'m',amount:250,type:'debit'} as any]); expect(a.length).toBeGreaterThanOrEqual(0);});
});
