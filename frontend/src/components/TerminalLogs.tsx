import React, { useState, useRef, useEffect } from 'react';
import { TerminalLog } from '../types/index.ts';
import { Terminal, ArrowDown } from 'lucide-react';

interface TerminalLogsProps {
  logs: TerminalLog[];
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filtered = logs.filter((log) => {
    if (filter === 'ALL') return true;
    if (filter === 'RADAR') return log.agent === 'MarketRadar';
    if (filter === 'SENTIMENT') return log.agent === 'SentimentAnalyzer';
    if (filter === 'RISK') return log.agent === 'RiskGuard';
    if (filter === 'EXECUTION') return log.agent === 'ExecutionEngine';
    if (filter === 'SYSTEM') return log.agent === 'System';
    return true;
  });

  return (
    <div className="bg-[#0b0e17] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col font-mono text-xs h-[360px]">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            Agent Telemetry Terminal Stream
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-slate-900 px-1 py-0.5 rounded-lg border border-slate-800 text-[10px]">
          {['ALL', 'RADAR', 'SENTIMENT', 'RISK', 'EXECUTION', 'SYSTEM'].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-2 py-0.5 rounded transition ${
                filter === tag
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Log Area */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px] leading-relaxed">
        {filtered.map((log) => {
          const time = new Date(log.timestamp).toLocaleTimeString();
          let levelClass = 'text-slate-300';
          let levelBadge = 'text-slate-400 bg-slate-800';

          if (log.level === 'success') {
            levelClass = 'text-emerald-300';
            levelBadge = 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30';
          } else if (log.level === 'warn') {
            levelClass = 'text-amber-300';
            levelBadge = 'text-amber-400 bg-amber-950/60 border border-amber-500/30';
          } else if (log.level === 'error') {
            levelClass = 'text-rose-300';
            levelBadge = 'text-rose-400 bg-rose-950/60 border border-rose-500/30';
          }

          return (
            <div key={log.id} className="flex items-start gap-2 py-0.5 hover:bg-slate-900/40 rounded px-1">
              <span className="text-slate-600 select-none">{time}</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${levelBadge}`}>
                {log.agent}
              </span>
              <span className={`${levelClass} break-all flex-1`}>{log.message}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Footer Status */}
      <div className="pt-2 border-t border-slate-800/80 mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>Logged Events: {logs.length} (Buffer: 200)</span>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-1 transition ${autoScroll ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <ArrowDown className="w-3 h-3" />
          <span>Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
};
