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
Analyze the provided JSON transaction data summary to answer the user question.

CONTEXT JSON:
${JSON.stringify(context)}

USER QUESTION: ${question}

INSTRUCTIONS:
1. Use the provided context data as the primary source of truth.
2. If the user asks about anomalies, summarize the anomaly list provided in the JSON context.
3. If no data exists in the context (transactionCount === 0), respond: "I don't have enough data in your current upload to answer this accurately."
4. Be concise and professional. Use currency units like "$".`;

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
