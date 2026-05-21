import OpenAI from 'openai';

let client: OpenAI | null = null;
const getClient = () => {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.NVCF_API_KEY ?? process.env.NVIDIA_API_KEY ?? process.env.OPENAI_API_KEY,
      baseURL: process.env.NVIDIA_BASE_URL ?? 'https://api.openai.com/v1',
    });
  }
  return client;
};

export const maxDuration = 60; // extend Vercel timeout to 60s

export async function POST(req: Request) {
  try {
    const { messages, dataSummary } = await req.json();

    const systemContent = dataSummary
      ? `You are Atlas, a grounded financial copilot. Answer questions ONLY using the transaction data provided below. Do not use outside knowledge.

TRANSACTION DATA SUMMARY:
${JSON.stringify(dataSummary)}

Instructions:
- Answer concisely with bullet points where appropriate
- Format all amounts with 2 decimal places and currency symbol
- For anomaly detection: identify transactions or categories that are unusually high compared to the average
- If something is not in the data, say exactly: "This information isn't available in your statement"
- Never make up numbers`
      : `You are Atlas, a financial copilot. No data has been uploaded yet. Tell the user to upload a CSV or XLSX file to get started.`;

    const stream = await getClient().chat.completions.create({
      model: process.env.MODEL_NAME ?? 'meta/llama-3.1-8b-instruct',
      messages: [
        { role: 'system', content: systemContent },
        ...messages.map((m: any) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content ?? '' })),
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content;
            if (token) {
              controller.enqueue(encoder.encode(token));
            }
          }
        } catch (streamErr) {
          controller.enqueue(encoder.encode(`\n\n[Stream error: ${(streamErr as Error).message}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (err: any) {
    console.error('Atlas chat error:', err);
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
