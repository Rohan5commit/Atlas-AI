import { NextResponse } from 'next/server';
import { Transaction } from '@/lib/types';
import {
  normalizeTransactions,
  spendingSummary,
  detectAnomalies,
  simpleForecast,
} from '@/lib/analytics';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ question: '', transactions: [] }));
  const question: string = body.question ?? '';
  const rawTransactions: Transaction[] = body.transactions ?? [];

  const apiKey = process.env.NVCF_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'NVCF_API_KEY missing' }, { status: 500 });
  if (!rawTransactions.length) {
    return NextResponse.json({ answer: "No transaction data received. Please upload your file first." });
  }

  // 1. Normalize: assigns categories via categoryMap
  const transactions = normalizeTransactions(rawTransactions);

  // 2. Compute all analytics
  const summary = spendingSummary(transactions);
  const anomalies = detectAnomalies(transactions);
  const forecast = simpleForecast(transactions, 30);

  // 3. Build a token-efficient context — cap anomalies at 15 to avoid blowing max_tokens
  const context = {
    transactionCount: transactions.length,
    summary: {
      totalSpend: summary.totalSpend,
      totalIncome: summary.totalIncome,
      savingsRate: +summary.savingsRate.toFixed(4),
      healthScore: summary.health,
      spendByCategory: summary.byCat,
      recurringMerchants: summary.recurring,
    },
    anomalies: anomalies.slice(0, 15).map((a) => ({
      merchant: a.merchant,
      amount: a.amount,
      reason: a.reason,
      severity: a.severity,
    })),
    forecast: {
      horizon: forecast.horizon,
      points: forecast.points.slice(0, 7), // Just weekly snapshots
    },
  };

  const prompt = `You are Atlas AI, a grounded financial copilot.

STRICT GUIDELINES:
1. Use ONLY the provided context. If the data is absent, say: "I don't have enough data in your current upload to answer this accurately."
2. Be concise. No conversational filler.
3. Always include currency units (e.g. "$" ).
4. For anomaly detection: flag transactions where the amount is more than 2 standard deviations from the mean, or where the merchant appears only once with a large amount.

Context JSON:
${JSON.stringify(context)}

User Question: ${question}`;

  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'meta/llama-3.1-70b-instruct',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: question },
      ],
      temperature: 0.1,
      max_tokens: 400,
    }),
  });

  if (!res.ok) return NextResponse.json({ error: 'NVIDIA inference call failed' }, { status: 502 });
  const data = await res.json();
  const answer = data?.choices?.[0]?.message?.content ?? 'Insufficient data to answer confidently.';
  return NextResponse.json({ answer, evidence: ['Grounded context from Atlas computed metrics'] });
}
