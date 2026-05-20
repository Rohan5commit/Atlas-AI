import { NextResponse } from 'next/server';
import { spendingSummary, detectAnomalies } from '@/lib/analytics';

export async function POST(req: Request){
  const { question, context, transactions } = await req.json().catch(()=>({question:'',context:{},transactions:[] }));
  const apiKey = process.env.NVCF_API_KEY;
  if(!apiKey) return NextResponse.json({ error:'NVCF_API_KEY missing' }, { status: 500 });

  const prompt = `You are Atlas AI, a high-tier financial copilot for students and first-time investors.
Your goal is to provide analytical, grounded, and empathetic financial guidance.

STRICT GUIDELINES:
1. Use ONLY the provided context JSON. If the information is not present, state: "I don't have enough data in your current upload to answer this accurately."
2. Be concise. Avoid conversational filler.
3. If the context contains negative trends (e.g., high spending, low savings), be supportive but direct.
4. When referencing numbers, always include the unit (e.g., "$").

Context JSON: ${JSON.stringify(context)}
User Question: ${question}`;

  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method:'POST',
    headers:{ 'Authorization': `Bearer ${apiKey}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ model:'meta/llama-3.1-70b-instruct', messages:[{role:'system', content:prompt}, {role:'user', content:question}], temperature:0.1, max_tokens:400 })
  });

  if(!res.ok) return NextResponse.json({ error:'NVIDIA inference call failed' }, { status: 502 });
  const data = await res.json();
  const answer = data?.choices?.[0]?.message?.content ?? 'Insufficient data to answer confidently.';
  return NextResponse.json({ answer, evidence:['Grounded context from Atlas computed metrics'] });
}
