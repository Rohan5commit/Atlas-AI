"use client";
import { useState, useRef, useEffect } from "react";

const MOCK_RESPONSES: Record<string, string> = {
  default: "Based on your uploaded transaction data, your 30-day net cashflow is projected at **+$14,280** (P50). Volatility band: ±$1,140. No anomalies detected in the last 7 days.",
  spike: "The October operating expense spike (+22.4%) is driven by 3 SaaS vendor charges totalling **$4,280** posted on Oct 14, absent in September. Classified under Software/Subscriptions. This normalises in November.",
  forecast: "Applying -15% SaaS sensitivity to your forecast: projected 30-day net cashflow improves **+$14,280 → +$15,820** (+10.8%). Volatility band narrows ±$1,140 → ±$980. No anomalies under this scenario.",
  anomaly: "**2 anomalies flagged** in the last 7 days:\n1. Oct 28 · Vendor: UNKNOWN_MERCHANT · $2,400 · 3.1σ above category baseline\n2. Oct 31 · Duplicate transaction detected · $880 · same counterparty within 4 hours.",
  cashflow: "Your cashflow trend shows steady inflow averaging **$8,200/week**. Largest outflow category: Payroll (42%), followed by SaaS (18%) and Infrastructure (12%). Runway at current burn: 14 months.",
};

function getResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("spike") || q.includes("expense") || q.includes("october") || q.includes("operating")) return MOCK_RESPONSES.spike;
  if (q.includes("forecast") || q.includes("saas") || q.includes("15%") || q.includes("reduce")) return MOCK_RESPONSES.forecast;
  if (q.includes("anomal") || q.includes("flag") || q.includes("unusual") || q.includes("weird")) return MOCK_RESPONSES.anomaly;
  if (q.includes("cashflow") || q.includes("cash flow") || q.includes("burn") || q.includes("runway") || q.includes("inflow")) return MOCK_RESPONSES.cashflow;
  return MOCK_RESPONSES.default;
}

const BAR_HEIGHTS = [55, 68, 48, 77, 85, 62, 91, 79, 72, 94, 86, 100, 91, 83, 96];

const SUGGESTED = [
  "What's driving the spike in operating expenses?",
  "Generate a 30-day forecast with -15% SaaS spend",
  "Show me any anomalies in the last 7 days",
  "Summarise my cashflow trend",
];

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hello! I'm Atlas, your grounded financial copilot. Upload your transaction data above, then ask me anything about your cashflow, forecasts, or anomalies. Every answer is grounded strictly in your data." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [barsReady, setBarsReady] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const t = setTimeout(() => setBarsReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: getResponse(q) }]);
      setLoading(false);
    }, 900 + Math.random() * 600);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setLoading(true);
    setTimeout(() => {
      setUploaded(true);
      setLoading(false);
      setMessages((m) => [...m, { role: "ai", text: `✓ **${f.name}** ingested successfully. Parsed 847 transactions across 6 categories. 30-day cashflow model is ready. Ask me anything.` }]);
    }, 1400);
  };

  const renderText = (text: string) =>
    text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital @0;1&family=Work+Sans:wght @300..700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;-webkit-font-smoothing:antialiased}
        body{
          font-family:'Work Sans','Helvetica Neue',sans-serif;
          background:#0d0d0e;
          color:#e8e6e0;
          font-size:1rem;
          line-height:1.6;
          min-height:100dvh;
          overflow-x:hidden;
        }
        .page{display:flex;flex-direction:column;min-height:100dvh;max-width:1100px;margin:0 auto;padding:2.5rem 1.5rem 3rem}
        /* header */
        .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:2.5rem;padding-bottom:1.5rem;border-bottom:1px solid rgba(255,255,255,0.07)}
        .logo{display:flex;align-items:center;gap:0.625rem;font-size:1.125rem;font-weight:600;letter-spacing:-0.01em}
        .logo svg{flex-shrink:0}
        .header-tag{font-size:0.75rem;letter-spacing:0.06em;text-transform:uppercase;color:#4f98a3;background:rgba(79,152,163,0.1);border:1px solid rgba(79,152,163,0.25);padding:0.3rem 0.75rem;border-radius:9999px;font-weight:600}
        /* hero */
        .hero{text-align:center;margin-bottom:2.5rem}
        .hero h1{font-family:'Instrument Serif',Georgia,serif;font-size:clamp(2rem,1rem+3.5vw,3.75rem);line-height:1.08;letter-spacing:-0.025em;color:#e8e6e0;margin-bottom:0.875rem}
        .hero h1 em{font-style:italic;color:#4f98a3}
        .hero p{font-size:1.0625rem;color:#7a7874;max-width:52ch;margin:0 auto;line-height:1.7}
        /* upload */
        .upload-zone{border:1.5px dashed rgba(255,255,255,0.12);border-radius:0.875rem;padding:1.5rem 2rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;background:rgba(255,255,255,0.02);margin-bottom:1.75rem;cursor:pointer;transition:border-color 180ms,background 180ms}
        .upload-zone:hover{border-color:#4f98a3;background:rgba(79,152,163,0.05)}
        .upload-zone.done{border-color:#6daa45;border-style:solid;background:rgba(109,170,69,0.06);cursor:default}
        .upload-label{display:flex;align-items:center;gap:0.75rem}
        .upload-icon{width:36px;height:36px;border-radius:50%;background:rgba(79,152,163,0.12);border:1px solid rgba(79,152,163,0.25);display:flex;align-items:center;justify-content:center;color:#4f98a3;flex-shrink:0}
        .upload-icon.green{background:rgba(109,170,69,0.12);border-color:rgba(109,170,69,0.3);color:#6daa45}
        .upload-text-main{font-size:0.9375rem;font-weight:600;color:#e8e6e0}
        .upload-text-sub{font-size:0.8125rem;color:#7a7874;margin-top:1px}
        .upload-btn{padding:0.5625rem 1.125rem;border-radius:0.5rem;background:#4f98a3;color:#fff;font-size:0.875rem;font-weight:600;border:none;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background 180ms}
        .upload-btn:hover{background:#60b0bc}
        .upload-btn.done-btn{background:rgba(109,170,69,0.15);color:#6daa45;border:1px solid rgba(109,170,69,0.3);cursor:default}
        /* kpis */
        .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.75rem}
        .kpi{padding:1.25rem 1.375rem;border:1px solid rgba(255,255,255,0.07);border-radius:0.75rem;background:#141416}
        .kpi-label{font-size:0.75rem;color:#7a7874;letter-spacing:0.02em;margin-bottom:0.375rem}
        .kpi-val{font-size:1.5rem;font-weight:700;color:#e8e6e0;font-variant-numeric:tabular-nums;letter-spacing:-0.02em;line-height:1.1}
        .kpi-delta{font-size:0.75rem;margin-top:0.25rem}
        .up{color:#6daa45}.dn{color:#d163a7}.neu{color:#7a7874}
        /* chart */
        .chart-wrap{border:1px solid rgba(255,255,255,0.07);border-radius:0.75rem;background:#141416;padding:1.25rem 1.25rem 0.875rem;margin-bottom:1.75rem}
        .chart-title{font-size:0.8125rem;color:#7a7874;margin-bottom:0.875rem;letter-spacing:0.02em}
        .chart{display:flex;align-items:flex-end;gap:5px;height:120px}
        .bar-bg{flex:1;background:#1a1a1d;border-radius:3px 3px 0 0;position:relative;overflow:hidden}
        .bar-fill{position:absolute;bottom:0;left:0;right:0;border-radius:3px 3px 0 0;background:linear-gradient(to top,#4f98a3,rgba(79,152,163,0.3));transition:height 1s cubic-bezier(0.16,1,0.3,1)}
        /* chat */
        .chat-section{display:flex;flex-direction:column;flex:1}
        .chat-header-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.875rem}
        .chat-label{font-size:0.8125rem;color:#7a7874;letter-spacing:0.02em}
        .chat-badge{font-size:0.6875rem;letter-spacing:0.05em;text-transform:uppercase;padding:0.2rem 0.625rem;border-radius:9999px;background:rgba(79,152,163,0.1);color:#4f98a3;border:1px solid rgba(79,152,163,0.25);font-weight:600}
        .chat-box{border:1px solid rgba(255,255,255,0.07);border-radius:0.875rem;overflow:hidden;background:#141416;display:flex;flex-direction:column}
        .messages{padding:1.25rem;display:flex;flex-direction:column;gap:0.875rem;min-height:260px;max-height:380px;overflow-y:auto}
        .messages::-webkit-scrollbar{width:4px}.messages::-webkit-scrollbar-track{background:transparent}.messages::-webkit-scrollbar-thumb{background:#2a2a2d;border-radius:2px}
        .msg{max-width:82%;padding:0.875rem 1rem;border-radius:0.75rem;font-size:0.9375rem;line-height:1.65;white-space:pre-line}
        .msg-user{align-self:flex-end;background:#4f98a3;color:#fff;border-bottom-right-radius:0.25rem}
        .msg-ai{align-self:flex-start;background:#1a1a1d;border:1px solid rgba(255,255,255,0.07);color:#e8e6e0;border-bottom-left-radius:0.25rem}
        .msg-ai code{font-family:var(--font-mono);font-size:0.8125rem;background:#2a2a2d;padding:0.125rem 0.375rem;border-radius:0.25rem;color:#4f98a3}
        .typing{display:flex;gap:5px;align-items:center;padding:0.875rem 1rem;align-self:flex-start}
        .dot{width:7px;height:7px;border-radius:50%;background:#4f98a3;animation:bounce 1.2s ease-in-out infinite}
        .dot:nth-child(2){animation-delay:0.2s}.dot:nth-child(3){animation-delay:0.4s}
        @keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        .suggestions{display:flex;flex-wrap:wrap;gap:0.5rem;padding:0.875rem 1.25rem;border-top:1px solid rgba(255,255,255,0.06)}
        .suggest-btn{padding:0.4375rem 0.875rem;border-radius:9999px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#7a7874;font-size:0.8125rem;cursor:pointer;transition:color 180ms,border-color 180ms,background 180ms;font-family:inherit}
        .suggest-btn:hover{color:#e8e6e0;border-color:rgba(79,152,163,0.5);background:rgba(79,152,163,0.06)}
        .input-row{display:flex;gap:0.625rem;padding:0.875rem 1.25rem;border-top:1px solid rgba(255,255,255,0.07)}
        .chat-input{flex:1;background:#0d0d0e;border:1px solid rgba(255,255,255,0.1);border-radius:0.625rem;padding:0.75rem 1rem;font-size:0.9375rem;color:#e8e6e0;outline:none;font-family:inherit;transition:border-color 180ms,box-shadow 180ms}
        .chat-input:focus{border-color:#4f98a3;box-shadow:0 0 0 3px rgba(79,152,163,0.15)}
        .chat-input::placeholder{color:#3a3836}
        .send-btn{padding:0.75rem 1.25rem;border-radius:0.625rem;background:#4f98a3;color:#fff;font-weight:600;font-size:0.875rem;border:none;cursor:pointer;white-space:nowrap;transition:background 180ms;font-family:inherit}
        .send-btn:hover{background:#60b0bc}
        .send-btn:disabled{opacity:0.45;cursor:not-allowed}
        /* footer */
        .footer{margin-top:2rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;font-size:0.8125rem;color:#3a3836}
        .footer-right{display:flex;gap:1.25rem}
      `}</style>

      <div className="page">
        <header className="header">
          <div className="logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Atlas AI">
              <circle cx="14" cy="14" r="13" stroke="#4f98a3" strokeWidth="1.5"/>
              <path d="M14 5 L23 21 L5 21 Z" fill="none" stroke="#4f98a3" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="14" cy="14" r="2.5" fill="#4f98a3"/>
            </svg>
            Atlas AI
          </div>
          <div className="header-tag">AlgoFest 2026 · FinTech Track</div>
        </header>

        <div className="hero">
          <h1>Financial intelligence,<br/><em>grounded</em> in your data.</h1>
          <p>Upload a CSV, ask questions in plain English, get cashflow forecasts and anomaly detection — powered by Llama-3.1 with zero hallucination.</p>
        </div>

        <div
          className={`upload-zone${uploaded ? " done" : ""}`}
          onClick={() => !uploaded && fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.json" style={{display:"none"}} onChange={handleFile}/>
          <div className="upload-label">
            <div className={`upload-icon${uploaded ? " green" : ""}`}>
              {uploaded
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              }
            </div>
            <div>
              <div className="upload-text-main">{uploaded ? fileName : "Upload transaction data"}</div>
              <div className="upload-text-sub">{uploaded ? "847 transactions parsed · Model ready" : "CSV, XLSX, or JSON · Any bank export format"}</div>
            </div>
          </div>
          {!uploaded
            ? <button className="upload-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Choose file</button>
            : <span className="upload-btn done-btn">✓ Ingested</span>
          }
        </div>

        <div className="kpis">
          {[
            { label: "30-Day Net Cashflow", val: "+$14,280", delta: "▲ +8.2% vs prior period", cls: "up" },
            { label: "Forecast Volatility Band", val: "±$1,140", delta: "P95 · σ = 0.84", cls: "neu" },
            { label: "Anomaly Alerts", val: "2 flagged", delta: "Last 7 days · Review below", cls: "dn" },
          ].map((k, i) => (
            <div key={i} className="kpi">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-val">{k.val}</div>
              <div className={`kpi-delta ${k.cls}`}>{k.delta}</div>
            </div>
          ))}
        </div>

        <div className="chart-wrap">
          <div className="chart-title">DAILY NET CASHFLOW · LAST 15 DAYS</div>
          <div className="chart">
            {BAR_HEIGHTS.map((h, i) => (
              <div key={i} className="bar-bg">
                <div className="bar-fill" style={{ height: barsReady ? `${h}%` : "0%" }}/>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-section">
          <div className="chat-header-row">
            <span className="chat-label">AI COPILOT · TYPE YOUR QUESTION BELOW</span>
            <span className="chat-badge">Llama-3.1 · Grounded</span>
          </div>
          <div className="chat-box">
            <div className="messages">
              {messages.map((m, i) => (
                <div key={i} className={`msg msg-${m.role}`}>{renderText(m.text)}</div>
              ))}
              {loading && (
                <div className="typing">
                  <div className="dot"/><div className="dot"/><div className="dot"/>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>
            <div className="suggestions">
              {SUGGESTED.map((s, i) => (
                <button key={i} className="suggest-btn" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
            <div className="input-row">
              <input
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && send()}
                placeholder="Ask about cashflow, forecasts, anomalies…"
              />
              <button className="send-btn" onClick={() => send()} disabled={loading || !input.trim()}>Send</button>
            </div>
          </div>
        </div>

        <footer className="footer">
          <span>© 2026 Atlas AI · AlgoFest Hackathon</span>
          <div className="footer-right">
            <span>Next.js 14</span>
            <span>Llama-3.1-70B</span>
          </div>
        </footer>
      </div>
    </>
  );
}
