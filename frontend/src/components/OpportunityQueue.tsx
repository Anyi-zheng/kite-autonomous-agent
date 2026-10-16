import React from 'react';
import { ArbitrageOpportunity } from '../types/index.ts';
import { Crosshair, Check, AlertOctagon, Sparkles } from 'lucide-react';

interface OpportunityQueueProps {
  opportunities: ArbitrageOpportunity[];
}

export const OpportunityQueue: React.FC<OpportunityQueueProps> = ({ opportunities }) => {
  return (
    <div className="bg-[#0e1322] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            Active Opportunity Queue
          </h2>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Auto-Evaluated
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-[340px]">
        {opportunities.slice(0, 6).map((opp) => {
          const isExecuted = opp.status === 'executed' || opp.status === 'simulated';
          const isRejected = opp.status === 'risk_rejected';

          return (
            <div
              key={opp.id}
              className={`p-3 rounded-xl border transition-all ${
                isExecuted
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : isRejected
                  ? 'bg-rose-950/20 border-rose-500/20 opacity-70'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{opp.pair}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                    isExecuted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1'
                      : isRejected
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isExecuted && <Check className="w-3 h-3" />}
                  {isRejected && <AlertOctagon className="w-3 h-3" />}
                  {opp.status}
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <span>{opp.route.join(' ➔ ')}</span>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div className="text-slate-400 text-[11px]">
                  Cap: <span className="text-white">${opp.capitalUsd.toLocaleString()}</span>
                  <span className="mx-1.5">•</span>
                  Spread: <span className="text-cyan-400">+{opp.spreadBps} bps</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 mr-1">Net:</span>
                  <span className="font-bold text-emerald-400">
                    +${opp.netProfitUsd.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {opportunities.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
            <Sparkles className="w-6 h-6 text-slate-600 mb-2" />
            <span>Scanning pools... profitable opportunities will appear here</span>
          </div>
        )}
      </div>
    </div>
  );
};
