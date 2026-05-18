import { NextResponse } from 'next/server';
import { parsePortfolio } from '@/lib/ingest';

export async function POST(req: Request){
  const body = await req.json().catch(()=>({ rows: [] }));
  const rows = Array.isArray(body?.rows) ? body.rows : [];
  const parsed = parsePortfolio(rows);
  return NextResponse.json({
    ok: parsed.errors.length === 0,
    count: parsed.data.length,
    errors: parsed.errors,
    portfolio: parsed.data
  }, { status: parsed.errors.length ? 400 : 200 });
}
