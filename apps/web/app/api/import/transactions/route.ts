import { NextResponse } from 'next/server';
import { parseTransactions } from '@/lib/ingest';
import { normalizeTransactions } from '@/lib/analytics';

export async function POST(req: Request){
  const body = await req.json().catch(()=>({ rows: [] }));
  const rows = Array.isArray(body?.rows) ? body.rows : [];
  const parsed = parseTransactions(rows);
  return NextResponse.json({
    ok: parsed.errors.length === 0,
    count: parsed.data.length,
    errors: parsed.errors,
    transactions: normalizeTransactions(parsed.data)
  }, { status: parsed.errors.length ? 400 : 200 });
}
