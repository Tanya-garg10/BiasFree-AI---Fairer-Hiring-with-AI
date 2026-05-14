"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [data, setData] = useState<any>({
    score: 100,
    issues: [],
    breakdown: { "Gender Bias": 0, "Age Bias": 0, "Cultural Bias": 0, "Neutral": 100 },
    impact: "Fair and inclusive.",
    tone: "Neutral",
  });
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time analysis with debounce
  const analyze = async (val: string) => {
    setText(val);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      if (!val.trim()) {
        setData({
          score: 100,
          issues: [],
          breakdown: { "Gender Bias": 0, "Age Bias": 0, "Cultural Bias": 0, "Neutral": 100 },
          impact: "Fair and inclusive.",
          tone: "Neutral",
        });
        return;
      }
      try {
        const res = await fetch("http://localhost:8000/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: val }),
        });
        const result = await res.json();
        setData({
          score: result.score ?? 100,
          issues: result.issues ?? [],
          breakdown: result.breakdown ?? { "Gender Bias": 0, "Age Bias": 0, "Cultural Bias": 0, "Neutral": 100 },
          impact: result.impact ?? "Fair and inclusive.",
          tone: result.tone ?? "Neutral"
        });
      } catch (err) {
        console.error("Analysis failed", err);
      }
    }, 500); // 500ms delay for typing feedback
  };

  const autoFix = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      
      if (!res.ok) throw new Error("API Key missing or Invalid");
      
      const result = await res.json();
      if (result.rewritten_text) {
        // Clean up markdown if any slipped through
        const cleanText = result.rewritten_text.replace(/\*\*/g, '');
        setText(cleanText);
        // Force immediate analysis
        if (debounceRef.current) clearTimeout(debounceRef.current);
        analyze(cleanText);
      }
    } catch (err) {
      alert("AI Rewrite failed. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  // Color mapping
  const getColor = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 70) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white p-6 md:p-10 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-6 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4 border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Live Analysis Engine
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              BiasFree AI.
            </h1>
            <p className="text-slate-400 mt-2 font-medium text-lg">Write job descriptions that welcome everyone.</p>
          </div>
          
          <div className="flex gap-8 items-end bg-[#121214] p-4 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Inclusivity Score</p>
              <div className="flex items-baseline gap-1">
                <p className={`text-6xl font-black ${getColor(data.score)} leading-none`}>
                  {data.score}
                </p>
                <span className="text-slate-600 font-bold">/100</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Editor */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative group flex-1 min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <textarea
                value={text}
                onChange={(e) => analyze(e.target.value)}
                className="w-full h-full min-h-[400px] bg-[#121214]/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700 resize-y leading-relaxed text-slate-200"
                placeholder="Paste or type your job description here to see real-time analysis..."
                spellCheck="false"
              />
            </div>
            
            <button
              onClick={autoFix}
              disabled={loading || text.trim().length === 0}
              className="group relative w-full py-4 bg-white text-black font-bold rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] transition-all active:scale-[0.99] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-2 text-lg">
                {loading ? (
                  <><span className="animate-spin text-xl">⏳</span> AI is rewriting neutrally...</>
                ) : (
                  <><span className="text-xl">✨</span> Auto-Fix Entire JD</>
                )}
              </span>
            </button>
          </div>

          {/* Right Sidebar Dashboard */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Tone & Impact Card */}
            <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">AI Insights</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Detected Tone</p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-md bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700">
                      {data.tone}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-1">Diversity Impact</p>
                  <p className={`text-sm font-medium leading-relaxed ${data.score < 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {data.score < 100 ? "⚠️ " : "✅ "} {data.impact}
                  </p>
                </div>
              </div>
            </div>

            {/* Bias Breakdown Card */}
            <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Bias Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(data.breakdown).map(([key, val]: [string, any]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{key}</span>
                      <span className="text-slate-500 font-mono">{val}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${key === 'Neutral' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${val}%`, transition: 'width 0.5s ease-out' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues List Card */}
            <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-lg flex-1 overflow-hidden flex flex-col">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex justify-between">
                <span>Detected Issues</span>
                <span className="bg-rose-500/20 text-rose-400 px-2 rounded-full">{data.issues.length}</span>
              </h3>
              
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {!data.issues || data.issues.length === 0 ? (
                  <div className="text-slate-500 text-sm text-center py-8 border border-dashed border-slate-800 rounded-xl">
                    <span className="text-2xl mb-2 block">🎉</span>
                    No biased language detected!
                  </div>
                ) : (
                  data.issues.map((issue: any, i: number) => (
                    <div key={i} className="group p-3 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-400/10 px-2 py-0.5 rounded">
                          {issue.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">
                        Instead of <span className="text-rose-400 font-medium line-through decoration-rose-500/50">"{issue.word}"</span>
                      </p>
                      <p className="text-sm mt-1 text-slate-300">
                        Try <span className="text-emerald-400 font-medium">"{issue.suggestion}"</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
