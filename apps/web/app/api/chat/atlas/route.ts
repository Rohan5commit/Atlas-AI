import { NextResponse } from 'next/server';

export async function POST(req: Request){
  const { question, context } = await req.json().catch(()=>({question:'',context:{}}));
  const apiKey = process.env.NVCF_API_KEY;
  if(!apiKey) return NextResponse.json({ error:'NVCF_API_KEY missing' }, { status: 500 });

  const prompt = `You are Atlas AI. Answer using ONLY this context JSON: ${JSON.stringify(context)}. If insufficient data, say so clearly. User question: ${question}`;
  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method:'POST',
    headers:{ 'Authorization': `Bearer ${apiKey}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ model:'meta/llama-3.1-70b-instruct', messages:[{role:'user', content:prompt}], temperature:0.2, max_tokens:300 })
  });

  if(!res.ok) return NextResponse.json({ error:'NVIDIA inference call failed' }, { status: 502 });
  const data = await res.json();
  const answer = data?.choices?.[0]?.message?.content ?? 'Insufficient data to answer confidently.';
  return NextResponse.json({ answer, evidence:['Grounded context from Atlas computed metrics'] });
}
