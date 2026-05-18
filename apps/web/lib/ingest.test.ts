import { describe, it, expect } from 'vitest';
import { parsePortfolio, parseTransactions } from './ingest';

describe('ingest', ()=>{
  it('parses transaction rows', ()=>{
    const out = parseTransactions([{Date:'2026-01-01', Merchant:'Rent', Amount:-900}]);
    expect(out.data.length).toBe(1);
    expect(out.errors.length).toBe(0);
  });
  it('flags invalid portfolio rows', ()=>{
    const out = parsePortfolio([{ticker:'', quantity:0}]);
    expect(out.data.length).toBe(0);
    expect(out.errors.length).toBe(1);
  });
});
