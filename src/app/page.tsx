"use client";

import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, Zap } from "lucide-react";
import { useEffect, useState } from "react";

type Incident = {
  title: string;
  severity: string;
  impact: string;
  cause: string;
  action: string;
};

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [stats, setStats] = useState({
    processed: "124,592",
    activeIncidents: "0",
    avgTime: "1.2s",
    successRate: "99.8%"
  });

  const runSimulation = async () => {
    setSimulating(true);
    try {
      await fetch('/api/simulate', { method: 'POST' });
      await fetchAnalysis();
    } catch (e) {
      console.error(e);
    }
    setSimulating(false);
  };

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', { method: 'POST' });
      const data = await res.json();
      if (data.incidents) {
        setIncidents(data.incidents);
        setStats(prev => ({ ...prev, activeIncidents: data.incidents.length.toString() }));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial fetch
    // fetchAnalysis(); // Uncomment if you want to run analysis on load (costs API quota)
  }, []);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-sky-500 selection:text-white pb-16">
      {/* Strict flat background grid mesh */}
      <div className="bg-grid-mesh" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between py-5 border-b border-zinc-900 mb-10">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-zinc-900 border border-zinc-800 text-zinc-200">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">QueueWatch AI</span>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-[11px] font-mono text-zinc-500 uppercase">
            <span className="text-zinc-350">Observatory Dashboard</span>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={runSimulation}
              disabled={simulating}
              className="flex items-center px-3.5 py-1.5 rounded bg-sky-500 hover:bg-sky-400 border border-transparent text-[10.5px] font-mono font-bold text-zinc-950 transition-all disabled:opacity-50"
            >
              {simulating ? <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" /> : <Activity className="w-3 h-3 mr-1.5" />}
              SIMULATE INCIDENT
            </button>
            <button 
              onClick={fetchAnalysis}
              disabled={loading}
              className="flex items-center px-3.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-[10.5px] font-mono font-bold hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              REFRESH
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="text-center max-w-3xl mx-auto py-10 flex flex-col items-center animate-fade-in">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded border border-zinc-900 bg-zinc-900/40 text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-6">
            <span>⚡️ REAL-TIME BUSINESS IMPACT TELEMETRY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Operational Intelligence. <br />
            <span className="text-zinc-500">Powered by Gemini AI.</span>
          </h1>
        </header>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-mono animate-fade-in">
          <MetricCard title="Total Processed" value={stats.processed} subtext="+12% from yesterday" icon={<Activity className="w-4 h-4 text-zinc-400" />} />
          <MetricCard title="Active Incidents" value={stats.activeIncidents} subtext={parseInt(stats.activeIncidents) > 0 ? "Requires attention" : "All systems nominal"} icon={<AlertTriangle className={`w-4 h-4 ${parseInt(stats.activeIncidents) > 0 ? 'text-rose-500' : 'text-zinc-400'}`} />} critical={parseInt(stats.activeIncidents) > 0} />
          <MetricCard title="Avg Processing Time" value={stats.avgTime} subtext="-0.3s from yesterday" icon={<Clock className="w-4 h-4 text-zinc-400" />} />
          <MetricCard title="Success Rate" value={stats.successRate} subtext="Target: 99.9%" icon={<CheckCircle className="w-4 h-4 text-zinc-400" />} />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 animate-fade-in">
          {/* Left Column: AI Incident Feed */}
          <div className="col-span-1 lg:col-span-2 space-y-4">
            <div className="flat-panel rounded-lg p-6 min-h-[400px]">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-5">
                <span className="text-[10px] text-sky-400 font-mono font-bold uppercase tracking-wider">AI Business Impact Analysis</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded font-mono">LIVE FEED</span>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                  <RefreshCw className="w-6 h-6 text-sky-500 animate-spin" />
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Gemini is analyzing telemetry...</p>
                </div>
              ) : incidents.length > 0 ? (
                <div className="space-y-4">
                  {incidents.map((incident, i) => (
                    <IncidentAlert key={i} {...incident} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 space-y-4 border border-dashed border-zinc-800 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">No Active Incidents Detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Queue Health */}
          <div className="col-span-1 space-y-4">
            <div className="flat-panel rounded-lg p-6 h-full">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-5">
                <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider">Worker Telemetry Map</span>
              </div>
              <div className="space-y-3 font-mono">
                <QueueStatus name="Email Delivery" status={parseInt(stats.activeIncidents) > 0 ? "failing" : "healthy"} backlog={parseInt(stats.activeIncidents) > 0 ? 2347 : 12} />
                <QueueStatus name="Payment Processing" status="healthy" backlog={0} />
                <QueueStatus name="Image Processing" status="healthy" backlog={45} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-zinc-900 text-center font-mono text-[9px] text-zinc-600 uppercase tracking-widest space-y-1 animate-fade-in">
          <div>QueueWatch AI • Built for Speed</div>
          <div className="text-zinc-700">Powered by Google Gemini 2.5 Flash</div>
        </footer>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtext, icon, critical = false }: { title: string, value: string, subtext: string, icon: React.ReactNode, critical?: boolean }) {
  return (
    <div className={`flat-panel p-5 rounded-lg ${critical ? 'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-sans font-bold mt-2 ${critical ? 'text-rose-400' : 'text-zinc-100'}`}>{value}</p>
        </div>
        <div className={`w-8 h-8 flex items-center justify-center rounded border ${critical ? 'bg-rose-500/10 border-rose-500/20' : 'bg-zinc-950 border-zinc-800'}`}>
          {icon}
        </div>
      </div>
      <p className={`text-[10px] mt-3 uppercase tracking-wider ${critical ? 'text-rose-400/80' : 'text-zinc-600'}`}>{subtext}</p>
    </div>
  );
}

function IncidentAlert({ title, severity, impact, cause, action, fix_snippet, timeline }: { title: string, severity: string, impact: string, cause: string, action: string, fix_snippet?: string, timeline?: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const isHigh = severity.toLowerCase() === 'high';
  
  return (
    <div className={`flat-panel p-5 rounded-lg transition-all duration-300 ${isHigh ? 'border-rose-500/40 bg-gradient-to-br from-rose-500/5 to-transparent' : 'border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-transparent'}`}>
      <div className="flex items-center justify-between mb-4 border-b border-zinc-850 pb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className={`w-4 h-4 ${isHigh ? 'text-rose-500' : 'text-amber-500'}`} />
          <h3 className={`font-mono text-xs font-bold uppercase tracking-wide ${isHigh ? 'text-rose-100' : 'text-amber-100'}`}>{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${isHigh ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
            {severity.toUpperCase()}
          </span>
          {(fix_snippet || timeline) && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border transition-colors ${isHigh ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/20' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20'}`}
            >
              {expanded ? 'HIDE' : 'DIAGNOSE'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 font-sans text-xs">
        <div className="bg-zinc-950 p-2.5 border border-zinc-850 rounded">
          <span className="text-[9px] text-zinc-500 uppercase block mb-1 font-mono font-bold">STAKEHOLDER IMPACT</span>
          <p className="text-zinc-200">{impact}</p>
        </div>
        <div className="bg-zinc-950 p-2.5 border border-zinc-850 rounded">
          <span className="text-[9px] text-zinc-500 uppercase block mb-1 font-mono font-bold">TECHNICAL EXCEPTION</span>
          <p className="text-zinc-400">{cause}</p>
        </div>
        <div className="bg-sky-500/5 p-2.5 border border-sky-500/20 rounded">
          <span className="text-[9px] text-sky-400 uppercase block mb-1 font-mono font-bold">GEMINI ACTION PLAN</span>
          <p className="text-sky-100 font-semibold">{action}</p>
        </div>
      </div>

      {/* Expanded Report Section */}
      {expanded && (timeline || fix_snippet) && (
        <div className={`mt-5 pt-5 border-t animate-in fade-in slide-in-from-top-2 ${isHigh ? 'border-rose-500/20' : 'border-amber-500/20'}`}>
          {timeline && timeline.length > 0 && (
            <div className="mb-5">
              <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider block mb-3">Chronological Breakdown</span>
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                {timeline.map((event, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className={`flex items-center justify-center w-3 h-3 rounded-full border border-zinc-800 bg-zinc-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative left-0 md:left-1/2 z-10 ${idx === timeline.length - 1 ? (isHigh ? 'bg-rose-500 border-rose-500' : 'bg-amber-500 border-amber-500') : ''}`}></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-2.5 rounded bg-zinc-950 border border-zinc-850 text-[11px] text-zinc-300 font-sans">
                      {event}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fix_snippet && (
            <div>
              <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider block mb-2">Developer Fix Snippet</span>
              <pre className="p-3 bg-[#0a0a0a] border border-zinc-800 rounded text-[11px] text-emerald-400 font-mono overflow-x-auto select-all">
                <code>{fix_snippet}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QueueStatus({ name, status, backlog }: { name: string, status: 'healthy' | 'failing', backlog: number }) {
  return (
    <div className="flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-850">
      <div>
        <p className="font-bold text-zinc-200 text-xs">{name}</p>
        <p className="text-[10px] text-zinc-500 mt-0.5 uppercase">{backlog} jobs in queue</p>
      </div>
      <div>
        {status === 'healthy' ? (
          <span className="flex items-center text-[10px] font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
            HEALTHY
          </span>
        ) : (
          <span className="flex items-center text-[10px] font-bold text-rose-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            FAILING
          </span>
        )}
      </div>
    </div>
  );
}

