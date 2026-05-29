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
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Zap className="w-8 h-8 text-brand-500" /> QueueWatch AI
          </h1>
          <p className="text-zinc-400 mt-1">Real-time business impact of background workflows.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={runSimulation}
            disabled={simulating}
            className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {simulating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
            Simulate Incident
          </button>
          <button 
            onClick={fetchAnalysis}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh AI Analysis
          </button>
        </div>
      </header>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Processed" 
          value={stats.processed} 
          subtext="+12% from yesterday"
          icon={<Activity className="w-5 h-5 text-zinc-400" />} 
        />
        <MetricCard 
          title="Active Incidents" 
          value={stats.activeIncidents} 
          subtext={parseInt(stats.activeIncidents) > 0 ? "Requires attention" : "All systems nominal"}
          icon={<AlertTriangle className={`w-5 h-5 ${parseInt(stats.activeIncidents) > 0 ? 'text-red-500' : 'text-zinc-400'}`} />} 
          critical={parseInt(stats.activeIncidents) > 0}
        />
        <MetricCard 
          title="Avg Processing Time" 
          value={stats.avgTime} 
          subtext="-0.3s from yesterday"
          icon={<Clock className="w-5 h-5 text-zinc-400" />} 
        />
        <MetricCard 
          title="Success Rate" 
          value={stats.successRate} 
          subtext="Target: 99.9%"
          icon={<CheckCircle className="w-5 h-5 text-zinc-400" />} 
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: AI Incident Feed */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 min-h-[400px]">
            <h2 className="text-lg font-semibold text-white mb-4">AI Business Impact Analysis</h2>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-zinc-400">Gemini is analyzing queue metrics...</p>
              </div>
            ) : incidents.length > 0 ? (
              <div className="space-y-4">
                {incidents.map((incident, i) => (
                  <IncidentAlert key={i} {...incident} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 space-y-4 border border-dashed border-zinc-800 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <p className="text-zinc-400">No active incidents. System is healthy.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Queue Health */}
        <div className="col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
            <h2 className="text-lg font-semibold text-white mb-4">Queue Health Map</h2>
            <div className="space-y-4">
              <QueueStatus name="Email Delivery" status={parseInt(stats.activeIncidents) > 0 ? "failing" : "healthy"} backlog={parseInt(stats.activeIncidents) > 0 ? 2347 : 12} />
              <QueueStatus name="Payment Processing" status="healthy" backlog={0} />
              <QueueStatus name="Image Processing" status="healthy" backlog={45} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtext, icon, critical = false }: { title: string, value: string, subtext: string, icon: React.ReactNode, critical?: boolean }) {
  return (
    <div className={`p-6 rounded-xl border transition-colors ${critical ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-zinc-900 border-zinc-800'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${critical ? 'text-red-400' : 'text-white'}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${critical ? 'bg-red-500/20' : 'bg-zinc-800/50'}`}>
          {icon}
        </div>
      </div>
      <p className={`text-sm mt-4 ${critical ? 'text-red-400/80' : 'text-zinc-500'}`}>{subtext}</p>
    </div>
  );
}

function IncidentAlert({ title, severity, impact, cause, action }: { title: string, severity: string, impact: string, cause: string, action: string }) {
  const isHigh = severity.toLowerCase() === 'high';
  return (
    <div className={`border rounded-lg p-5 transition-all ${isHigh ? 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent' : 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent'}`}>
      <div className="flex items-center space-x-3 mb-3">
        <AlertTriangle className={`w-5 h-5 ${isHigh ? 'text-red-500' : 'text-amber-500'}`} />
        <h3 className={`font-semibold ${isHigh ? 'text-red-50' : 'text-amber-50'}`}>{title}</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${isHigh ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-amber-500/20 text-amber-400 border-amber-500/20'}`}>{severity}</span>
      </div>
      <div className="space-y-3 mt-4 text-sm">
        <div>
          <span className={`${isHigh ? 'text-red-400' : 'text-amber-400'} font-medium`}>Business Impact:</span>
          <p className="text-zinc-300 mt-1">{impact}</p>
        </div>
        <div>
          <span className={`${isHigh ? 'text-red-400' : 'text-amber-400'} font-medium`}>Technical Cause:</span>
          <p className="text-zinc-300 mt-1">{cause}</p>
        </div>
        <div className={`pt-3 mt-3 border-t ${isHigh ? 'border-red-500/20' : 'border-amber-500/20'}`}>
          <span className="text-emerald-400 font-medium">AI Recommendation:</span>
          <p className="text-emerald-50 mt-1">{action}</p>
        </div>
      </div>
    </div>
  );
}

function QueueStatus({ name, status, backlog }: { name: string, status: 'healthy' | 'failing', backlog: number }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div>
        <p className="font-medium text-zinc-200 text-sm">{name}</p>
        <p className="text-xs text-zinc-500 mt-1">{backlog} jobs waiting</p>
      </div>
      <div>
        {status === 'healthy' ? (
          <span className="flex items-center text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
            Healthy
          </span>
        ) : (
          <span className="flex items-center text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-500/20 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            Failing
          </span>
        )}
      </div>
    </div>
  );
}

