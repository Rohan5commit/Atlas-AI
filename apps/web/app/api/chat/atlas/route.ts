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
  
  // Removed strict requirement: Allow LLM to handle analysis if data is provided.
  // if (!rawTransactions.length) ...

  const transactions = normalizeTransactions(rawTransactions);
  const summary = spendingSummary(transactions);
  const anomalies = detectAnomalies(transactions);
  const forecast = simpleForecast(transactions, 30);

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
    // Send top 50 anomalies, more comprehensive than 15
    anomalies: anomalies.slice(0, 50).map((a) => ({
      merchant: a.merchant,
      amount: a.amount,
      reason: a.reason,
      severity: a.severity,
      date: a.date,
    })),
    forecast: {
      horizon: forecast.horizon,
      points: forecast.points, 
    },
  };

  const prompt = `You are Atlas AI, a financial copilot.
The user has uploaded ${transactions.length} transactions. Analyze the JSON below and answer their question.

CONTEXT JSON:
${JSON.stringify(context)}

USER QUESTION: ${question}

RULES:
1. Always answer using the context data above. Never say you lack data.
2. For anomaly questions: if anomalies array has items, list them. If anomalies array is empty, say "No statistical anomalies detected — all transactions are within normal range" and mention the top 3 highest spend transactions from the data instead.
3. Be concise and professional. Use $ for currency.`;

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
      max_tokens: 800,
    }),
  });

  if (!res.ok) return NextResponse.json({ error: 'NVIDIA inference call failed' }, { status: 502 });
  const data = await res.json();
  const answer = data?.choices?.[0]?.message?.content ?? 'Insufficient data to answer confidently.';
  return NextResponse.json({ answer });
}
