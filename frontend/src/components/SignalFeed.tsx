import React from 'react';
import { MarketSignal } from '../types/index.ts';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

interface SignalFeedProps {
  signals: MarketSignal[];
}

export const SignalFeed: React.FC<SignalFeedProps> = ({ signals }) => {
  return (
    <div className="bg-[#0e1322] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            Live DEX Market Signals
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Showing last {Math.min(signals.length, 10)} ticks
        </span>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800/80 pb-2">
              <th className="py-2 font-medium">PAIR</th>
              <th className="py-2 font-medium">DEX A (PRICE)</th>
              <th className="py-2 font-medium">DEX B (PRICE)</th>
              <th className="py-2 font-medium text-right">SPREAD</th>
              <th className="py-2 font-medium text-right">LIQUIDITY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {signals.slice(0, 8).map((sig) => {
              const isHighSpread = sig.spreadBps >= 40;
              return (
                <tr key={sig.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {sig.pair}
                  </td>
                  <td className="py-2.5 text-slate-300">
                    <span className="text-slate-400 text-[10px] block">{sig.dexA}</span>
                    ${sig.priceA.toFixed(4)}
                  </td>
                  <td className="py-2.5 text-slate-300">
                    <span className="text-slate-400 text-[10px] block">{sig.dexB}</span>
                    ${sig.priceB.toFixed(4)}
                  </td>
                  <td className="py-2.5 text-right font-bold">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] ${
                        isHighSpread
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-400'
                      }`}
                    >
                      +{sig.spreadBps} bps
                      {isHighSpread && <ArrowUpRight className="w-3 h-3 ml-0.5" />}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-slate-400">
                    ${(sig.liquidityUsd / 1000).toFixed(0)}k
                  </td>
                </tr>
              );
            })}
            {signals.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                  Awaiting initial telemetry tick from MarketRadar agent...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
