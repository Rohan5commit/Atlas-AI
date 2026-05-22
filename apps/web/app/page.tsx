"use client";
import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import { generateDataSummary } from "@/lib/analytics";

interface Message {
  role: "user" | "ai";
  content: string;
}

const SUGGESTED = [
  "What is my 30-day cashflow forecast?",
  "Show me any spending anomalies",
  "Which category has the highest outflow?",
  "What is my monthly burn rate?",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hello! I'm Atlas, your grounded financial copilot. Upload a CSV or XLSX file of your transactions above — then ask me anything about your cashflow, forecasts, or anomalies. Every answer is grounded strictly in your data.",
    },
  ]);

/**
 * RFC-4180 compliant CSV parser that handles:
 * - Quoted fields with embedded commas
 * - Quoted fields with embedded newlines
 * - Escaped double-quotes ("")
 */
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur = "";
  let inQuote = false;
  let fields: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuote) {
      if (ch === '"' && next === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuote = false; }
      else { cur += ch; }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { fields.push(cur.trim()); cur = ""; }
      else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        fields.push(cur.trim());
        if (fields.some(f => f !== "")) rows.push(fields);
        fields = []; cur = "";
      } else { cur += ch; }
    }
  }
  // last field/row
  fields.push(cur.trim());
  if (fields.some(f => f !== "")) rows.push(fields);

  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  return rows.slice(1).map(row =>
    Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]))
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hello! I'm Atlas, your grounded financial copilot. Upload a CSV or XLSX file of your transactions above — then ask me anything about your cashflow, forecasts, or anomalies. Every answer is grounded strictly in your data.",
    },
  ]);
  const [input, setInput] = useState("");
  const [dataSummary, setDataSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const csvTextRef = useRef("");
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const [barsReady, setBarsReady] = useState(false);
  const [kpis, setKpis] = useState<{ cashflow: string; volatility: string; anomalies: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = (ev.target?.result as string) ?? "";
      csvTextRef.current = text;
      const parsedRows = parseCSV(text);
      const transactions = parsedRows
        .map(r => {
          const rawAmt = r.amount ?? r.debitamount ?? r.creditamount ?? r.value ?? r.sum ?? "0";
          const cleaned = rawAmt.replace(/[^\d.-]/g, "");
          const numeric = parseFloat(cleaned);
          const amount = isNaN(numeric) ? 0 : numeric;
          const explicitType = (r.type ?? r.transactiontype ?? "").toLowerCase();
          let type: "debit" | "credit" = explicitType === "debit" || explicitType === "dr" ? "debit" : explicitType === "credit" || explicitType === "cr" ? "credit" : "debit";
          return {
            date: r.date ?? r.transactiondate ?? "",
            merchant: r.merchant ?? r.description ?? "",
            amount: Math.abs(amount),
            type,
            category: r.category ?? "",
          };
        })
        .filter(t => t.amount > 0 && t.date !== "");
        
      const summary = generateDataSummary(transactions);
      setDataSummary(summary);
      
      const last15 = transactions.slice(-15);
      const max = Math.max(...last15.map(t => t.amount), 1);
      const realBarHeights = last15.map(t => Math.round((t.amount / max) * 100));
      setBarHeights(realBarHeights);

      const rowCount = transactions.length;
      setUploaded(true);
      setBarsReady(true);
      setLoading(false);
      setKpis({
        cashflow: `$${summary.netCashflow.toFixed(2)}`,
        volatility: summary.anomaliesSummary,
        anomalies: String(summary.topCategories.length > 0 ? "Detected" : "None"),
      });
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          content: `✓ **${f.name}** uploaded — ${rowCount} transaction rows parsed. I'm ready. Ask me about your cashflow, forecast, or anomalies.`,
        },
      ]);
    };
    reader.readAsText(f);
  };

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");
    
    // Add user message and empty assistant message
    const newMessages = [...messages, { role: "user" as const, content: q }];
    setMessages([...newMessages, { role: "ai" as const, content: "" }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat/atlas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          dataSummary: dataSummary,
        }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const token = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "ai",
            content: updated[updated.length - 1].content + token,
          };
          return updated;
        });
      }
    } catch {
      setMessages((m) => {
        const updated = [...m];
        updated[updated.length - 1] = { role: "ai", content: "⚠️ Error contacting Atlas API." };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const renderText = (text: string) =>
    text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300..700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        body{font-family:'Work Sans','Helvetica Neue',sans-serif;background:#0d0d0e;color:#e8e6e0;font-size:1rem;line-height:1.6;min-height:100dvh}
        .page{display:flex;flex-direction:column;max-width:1060px;margin:0 auto;padding:2.5rem 1.5rem 3rem;gap:1.5rem}

        /* upload */
        .upload-zone{border:1.5px dashed rgba(255,255,255,0.1);border-radius:0.875rem;padding:1.375rem 1.75rem;display:flex;align-items:center;justify-content:space-between;gap:1.25rem;background:rgba(255,255,255,0.015);cursor:pointer;transition:border-color 180ms,background 180ms}
        .upload-zone:hover{border-color:#4f98a3;background:rgba(79,152,163,0.04)}
        .upload-zone.done{border-color:#6daa45;border-style:solid;background:rgba(109,170,69,0.05);cursor:default}
        .upload-label{display:flex;align-items:center;gap:0.75rem}
        .upload-icon{width:38px;height:38px;border-radius:50%;background:rgba(79,152,163,0.12);border:1px solid rgba(79,152,163,0.25);display:flex;align-items:center;justify-content:center;color:#4f98a3;flex-shrink:0}
        .upload-icon.green{background:rgba(109,170,69,0.12);border-color:rgba(109,170,69,0.3);color:#6daa45}
        .upload-text-main{font-size:0.9375rem;font-weight:600;color:#e8e6e0}
        .upload-text-sub{font-size:0.8125rem;color:#7a7874;margin-top:2px}
        .upload-btn{padding:0.5625rem 1.125rem;border-radius:0.5rem;background:#4f98a3;color:#fff;font-size:0.875rem;font-weight:600;border:none;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background 180ms;font-family:inherit}
        .upload-btn:hover{background:#60b0bc}
        .upload-btn.done-btn{background:rgba(109,170,69,0.12);color:#6daa45;border:1px solid rgba(109,170,69,0.3);cursor:default}

        /* locked state */
        .locked{border:1px solid rgba(255,255,255,0.06);border-radius:0.875rem;padding:2rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.625rem;background:#141416;min-height:120px;color:#3a3836;font-size:0.9375rem;text-align:center}
        .locked svg{opacity:0.3}

        /* kpis */
        .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
        .kpi{padding:1.25rem 1.375rem;border:1px solid rgba(255,255,255,0.07);border-radius:0.75rem;background:#141416}
        .kpi-label{font-size:0.75rem;color:#7a7874;letter-spacing:0.02em;margin-bottom:0.375rem}
        .kpi-val{font-size:1.4375rem;font-weight:700;color:#e8e6e0;font-variant-numeric:tabular-nums;letter-spacing:-0.02em;line-height:1.1}
        .kpi-delta{font-size:0.75rem;margin-top:0.25rem;color:#7a7874}

        /* chart */
        .chart-wrap{border:1px solid rgba(255,255,255,0.07);border-radius:0.75rem;background:#141416;padding:1.25rem 1.25rem 0.875rem}
        .chart-title{font-size:0.75rem;color:#7a7874;margin-bottom:0.875rem;letter-spacing:0.05em;text-transform:uppercase}
        .chart{display:flex;align-items:flex-end;gap:5px;height:120px}
        .bar-bg{flex:1;background:#1a1a1d;border-radius:3px 3px 0 0;position:relative;overflow:hidden}
        .bar-fill{position:absolute;bottom:0;left:0;right:0;border-radius:3px 3px 0 0;background:linear-gradient(to top,#4f98a3,rgba(79,152,163,0.3));transition:height 1s cubic-bezier(0.16,1,0.3,1)}

        /* divider */
        .divider{height:1px;background:rgba(255,255,255,0.06)}

        /* chat */
        .chat-header-row{display:flex;align-items:center;justify-content:space-between}
        .chat-label{font-size:0.75rem;color:#7a7874;letter-spacing:0.05em;text-transform:uppercase}
        .chat-badge{font-size:0.6875rem;letter-spacing:0.05em;text-transform:uppercase;padding:0.2rem 0.625rem;border-radius:9999px;background:rgba(79,152,163,0.1);color:#4f98a3;border:1px solid rgba(79,152,163,0.25);font-weight:600}
        .chat-box{border:1px solid rgba(255,255,255,0.07);border-radius:0.875rem;overflow:hidden;background:#141416;display:flex;flex-direction:column}
        .messages{padding:1.25rem;display:flex;flex-direction:column;gap:0.875rem;min-height:240px;max-height:360px;overflow-y:auto;scroll-behavior:smooth}
        .messages::-webkit-scrollbar{width:4px}.messages::-webkit-scrollbar-track{background:transparent}.messages::-webkit-scrollbar-thumb{background:#2a2a2d;border-radius:2px}
        .msg{max-width:82%;padding:0.875rem 1rem;border-radius:0.75rem;font-size:0.9375rem;line-height:1.65;white-space:pre-wrap}
        .msg-user{align-self:flex-end;background:#4f98a3;color:#fff;border-bottom-right-radius:0.25rem}
        .msg-ai{align-self:flex-start;background:#1a1a1d;border:1px solid rgba(255,255,255,0.07);color:#e8e6e0;border-bottom-left-radius:0.25rem}
        .msg-ai code{font-family:monospace;font-size:0.8125rem;background:#2a2a2d;padding:0.125rem 0.375rem;border-radius:0.25rem;color:#4f98a3}
        .typing{display:flex;gap:5px;align-items:center;padding:0.875rem 1rem;align-self:flex-start}
        .dot{width:7px;height:7px;border-radius:50%;background:#4f98a3;animation:bounce 1.2s ease-in-out infinite}
        .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
        @keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        .suggestions{display:flex;flex-wrap:wrap;gap:0.5rem;padding:0.875rem 1.25rem;border-top:1px solid rgba(255,255,255,0.06)}
        .suggest-btn{padding:0.4375rem 0.875rem;border-radius:9999px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#7a7874;font-size:0.8125rem;cursor:pointer;transition:color 180ms,border-color 180ms,background 180ms;font-family:inherit}
        .suggest-btn:hover{color:#e8e6e0;border-color:rgba(79,152,163,0.5);background:rgba(79,152,163,0.06)}
        .input-row{display:flex;gap:0.625rem;padding:0.875rem 1.25rem;border-top:1px solid rgba(255,255,255,0.07)}
        .chat-input{flex:1;background:#0d0d0e;border:1px solid rgba(255,255,255,0.1);border-radius:0.625rem;padding:0.75rem 1rem;font-size:0.9375rem;color:#e8e6e0;outline:none;font-family:inherit;transition:border-color 180ms,box-shadow 180ms}
        .chat-input:focus{border-color:#4f98a3;box-shadow:0 0 0 3px rgba(79,152,163,0.15)}
        .chat-input::placeholder{color:#3a3836}
        .send-btn{padding:0.75rem 1.25rem;border-radius:0.625rem;background:#4f98a3;color:#fff;font-weight:600;font-size:0.875rem;border:none;cursor:pointer;transition:background 180ms;font-family:inherit}
        .send-btn:hover:not(:disabled){background:#60b0bc}
        .send-btn:disabled{opacity:0.4;cursor:not-allowed}
      `}</style>

      <div className="page">
        <div
          className={`upload-zone${uploaded ? " done" : ""}`}
          onClick={() => !uploaded && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.json,.txt"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          <div className="upload-label">
            <div className={`upload-icon${uploaded ? " green" : ""}`}>
              {uploaded
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              }
            </div>
            <div>
              <div className="upload-text-main">
                {uploaded ? fileName : "Upload transaction data"}
              </div>
              <div className="upload-text-sub">
                {uploaded
                  ? `${csvTextRef.current ? parseCSV(csvTextRef.current).length : 0} transaction rows parsed`
                  : "CSV, XLSX, or JSON · Any bank export format"}
              </div>
            </div>
          </div>
          {!uploaded
            ? <button className="upload-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Choose file</button>
            : <span className="upload-btn done-btn">✓ Ingested</span>
          }
        </div>

        {!uploaded ? (
          <div className="locked">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Upload a file to unlock KPI cards and the chart
          </div>
        ) : (
          <div className="kpis">
            {[
              { label: "30-Day Net Cashflow", val: kpis?.cashflow ?? "—", delta: "Ask Atlas for the figure" },
              { label: "Forecast Volatility", val: kpis?.volatility ?? "—", delta: "P95 band" },
              { label: "Anomaly Alerts", val: kpis?.anomalies ?? "—", delta: "Ask Atlas to surface them" },
            ].map((k, i) => (
              <div key={i} className="kpi">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-val">{k.val}</div>
                <div className="kpi-delta">{k.delta}</div>
              </div>
            ))}
          </div>
        )}

        {uploaded && (
          <div className="chart-wrap">
            <div className="chart-title">Transaction Volume · Last 15 entries</div>
            <div className="chart">
              {barHeights.map((h, i) => (
                <div key={i} className="bar-bg">
                  <div className="bar-fill" style={{ height: barsReady ? `${h}%` : "0%" }}/>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="divider"/>

        <div className="chat-header-row">
          <span className="chat-label">AI Copilot · Type your question</span>
          <span className="chat-badge">Real AI · {uploaded ? "Data loaded" : "Upload first"}</span>
        </div>

        <div className="chat-box">
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg msg-${m.role}`}>{renderText(m.content)}</div>
            ))}
            {loading && (
              <div className="typing">
                <div className="dot"/><div className="dot"/><div className="dot"/>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          {uploaded && (
            <div className="suggestions">
              {SUGGESTED.map((s, i) => (
                <button key={i} className="suggest-btn" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="input-row">
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && send()}
              placeholder={uploaded ? "Ask about your cashflow, forecast, anomalies…" : "Upload a file first, then ask Atlas anything…"}
            />
            <button className="send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
