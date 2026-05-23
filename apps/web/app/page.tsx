"use client";
import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import ReactMarkdown from "react-markdown";
import { generateDataSummary } from "@/lib/analytics";
import { parseTransactions, detectFileType, parseExcelFile } from "@/lib/ingest";
import { Transaction, DataSummary } from "@/lib/types";

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
  const [input, setInput] = useState("");
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const csvTextRef = useRef("");
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const [barsReady, setBarsReady] = useState(false);
  const [kpis, setKpis] = useState<{
    cashflow: { value: string; delta?: string };
    volatility: { value: string; delta?: string };
    anomalies: { value: string; delta?: string };
  } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    if (f.size > 5 * 1024 * 1024) {
      alert("File too large. Max 5MB.");
      return;
    }
    
    setFileName(f.name);
    setLoading(true);

    if (f.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const buffer = ev.target?.result as ArrayBuffer;
        const rows = parseExcelFile(buffer);
        const { data: transactions, errors } = parseTransactions(rows, 'BANK');

        if (errors.length > 0 || transactions.length === 0) {
          alert("Failed to parse Excel file. Please ensure it is a valid .xlsx format.");
          setLoading(false);
          return;
        }
        processTransactions(transactions, f.name);
      };
      reader.readAsArrayBuffer(f);
    } else {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const text = (ev.target?.result as string) ?? "";
        csvTextRef.current = text;
        const fileType = detectFileType(text);
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const { data: transactions, errors } = parseTransactions(parsed.data as any[], fileType);

        if (errors.length > 0 || transactions.length === 0) {
          alert("Failed to parse file. Please ensure it's a valid CSV/JSON bank export.");
          setLoading(false);
          return;
        }
        processTransactions(transactions, f.name);
      };
      reader.readAsText(f);
    }
  };

  const processTransactions = (transactions: Transaction[], fileName: string) => {
    const summary = generateDataSummary(transactions);
    setDataSummary(summary);
    
    const last15 = transactions.slice(-15);
    const absAmounts = last15.map((t) => Math.abs(t.amount));
    const max = Math.max(...absAmounts, 1);
    const realBarHeights = last15.map((t) => Math.round((Math.abs(t.amount) / max) * 100));
    setBarHeights(realBarHeights);

    const rowCount = transactions.length;
    setUploaded(true);
    setBarsReady(true);
    setLoading(false);
    setKpis({
      cashflow: { value: `$${summary.netCashflow.toFixed(2)}`, delta: "Based on historicals" },
      volatility: { value: summary.anomaliesSummary, delta: "P95 band" },
      anomalies: { value: String(summary.topCategories.length > 0 ? "Detected" : "None"), delta: "Ask Atlas for details" },
    });
    setMessages((m) => [
      ...m,
      {
        role: "ai",
        content: `✓ **${fileName}** uploaded — ${rowCount} transaction rows parsed. I'm ready. Ask me about your cashflow, forecast, or anomalies.`,
      },
    ]);
  };

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");
    
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

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
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

  return (
    <div className="page">
      <div
        className={`upload-zone ${uploaded ? "done" : ""}`}
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
          <div className={`upload-icon ${uploaded ? "green" : ""}`}>
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
                ? `${csvTextRef.current ? (csvTextRef.current.split('\\n').length - 1) : 0} transaction rows parsed`
                : "CSV, XLSX, or JSON · Any bank export format"}
            </div>
          </div>
        </div>
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
            { label: "30-Day Net Cashflow", val: kpis?.cashflow.value ?? "—", delta: kpis?.cashflow.delta ?? "Ask Atlas for the figure" },
            { label: "Forecast Volatility", val: kpis?.volatility.value ?? "—", delta: kpis?.volatility.delta ?? "P95 band" },
            { label: "Anomaly Alerts", val: kpis?.anomalies.value ?? "—", delta: kpis?.anomalies.delta ?? "Ask Atlas to surface them" },
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

      <div className="chat-box">
        <div className="messages">
          {messages.map((m: Message, i: number) => (
            <div key={i} className={`msg msg-${m.role}`}>
              {m.role === 'ai' ? (
                <ReactMarkdown components={{
                  p: ({children}) => <>{children}<br/></>,
                  ul: ({children}) => <ul style={{listStyle: 'disc', paddingLeft: '20px'}}>{children}</ul>,
                  strong: ({children}) => <strong>{children}</strong>,
                  code: ({children}) => <code>{children}</code>
                }}>{m.content}</ReactMarkdown>
              ) : m.content}
            </div>
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
  );
}
