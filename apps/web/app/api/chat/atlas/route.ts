import { NextResponse } from 'next/server';
import { Transaction } from '@/lib/types';
import { normalizeTransactions, generateDataSummary } from '@/lib/analytics';

export async function POST(req: Request) {
  const body = await req.json();
  console.log('=== ATLAS DEBUG ===');
  console.log('Keys received:', Object.keys(body));
  console.log('dataSummary:', body.dataSummary ? 'PRESENT' : 'MISSING');
  console.log('messages count:', body.messages?.length);
  console.log('===================');

  const { question, dataSummary } = body;

  const apiKey = process.env.NVCF_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'NVCF_API_KEY missing' }, { status: 500 });

  const simpleKeywords = ["total", "how much", "what is", "show", "list", "top", "biggest", "highest", "lowest"];
  const isSimple = simpleKeywords.some(kw => question.toLowerCase().includes(kw));
  const model = isSimple ? "meta/llama-3.1-8b-instruct" : "meta/llama-3.1-70b-instruct";

  const systemPrompt = dataSummary
    ? `You are Atlas, a grounded financial copilot. Answer questions strictly based on the data below. Do not speculate or use outside knowledge.

ACCOUNT SUMMARY:
${JSON.stringify(dataSummary, null, 0)}

Rules:
- Be concise and direct
- Use bullet points for lists
- Format currency as USD with 2 decimal places
- If the answer isn't in the data, say "This information isn't available in your statement"`
    : `You are Atlas. No data has been uploaded yet. Ask the user to upload a CSV or XLSX file.`;

  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.1,
      stream: true,
    }),
  });

  if (!res.ok) return NextResponse.json({ error: 'NVIDIA inference call failed' }, { status: 502 });
  
  return new Response(res.body, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
