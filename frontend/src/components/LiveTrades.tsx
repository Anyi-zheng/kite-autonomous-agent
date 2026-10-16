import React from 'react';
import { TradeRecord } from '../types/index.ts';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

interface LiveTradesProps {
  trades: TradeRecord[];
}

export const LiveTrades: React.FC<LiveTradesProps> = ({ trades }) => {
  return (
    <div className="bg-[#0e1322] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Confirmed On-Chain Arbitrage Trades
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Atomic settlement transactions executed via Kite Passport delegated session
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Total Settled: <span className="text-emerald-400 font-bold">{trades.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800/80 pb-2">
              <th className="py-2.5 font-medium">TIMESTAMP</th>
              <th className="py-2.5 font-medium">PAIR</th>
              <th className="py-2.5 font-medium">ATOMIC ROUTE</th>
              <th className="py-2.5 font-medium text-right">CAPITAL</th>
              <th className="py-2.5 font-medium text-right">NET PROFIT</th>
              <th className="py-2.5 font-medium text-right">GAS COST</th>
              <th className="py-2.5 font-medium text-right">BLOCK / TX HASH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {trades.slice(0, 10).map((t) => {
              const timeStr = new Date(t.timestamp).toLocaleTimeString();
              return (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-slate-400">{timeStr}</td>
                  <td className="py-3 font-bold text-white">{t.pair}</td>
                  <td className="py-3 text-slate-300">{t.route}</td>
                  <td className="py-3 text-right text-slate-300">${t.amountInUsd.toLocaleString()}</td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    +${t.profitUsd.toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-slate-400">${t.gasCostUsd.toFixed(2)}</td>
                  <td className="py-3 text-right">
                    <a
                      href={`https://testnet.kitescan.ai/tx/${t.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition"
                    >
                      <span>#{t.blockNumber}</span>
                      <span className="text-slate-500">({t.txHash.slice(0, 6)}...{t.txHash.slice(-4)})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              );
            })}
            {trades.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                  No trades recorded in current session yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
