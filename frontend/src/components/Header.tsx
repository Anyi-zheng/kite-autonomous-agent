import React from 'react';
import { ShieldCheck, Play, Pause, Activity, Zap } from 'lucide-react';
import { GlobalDashboardState } from '../types/index.ts';

interface HeaderProps {
  state: GlobalDashboardState;
  wsConnected: boolean;
  onToggle: () => void;
  onOpenPassportModal: () => void;
  onManualScan: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  wsConnected,
  onToggle,
  onOpenPassportModal,
  onManualScan,
}) => {
  const isPassportActive = state.passportSession && state.passportSession.isActive;

  return (
    <header className="border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1px] flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <div className="w-full h-full bg-[#0d121f] rounded-[11px] flex items-center justify-center">
              <span className="text-xl">🪁</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base lg:text-lg text-white tracking-wide">
                Kite AI <span className="text-emerald-400">Autonomous Agent</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v1.0 Testnet
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Chain ID: {state.network?.chainId || 2368}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {wsConnected ? 'WS Stream Active' : 'Polling Sync'}
              </span>
              <span>•</span>
              <span>Block: #{state.network?.blockNumber || 1849420}</span>
            </p>
          </div>
        </div>

        {/* Real-time KPI Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60">
          <div className="px-3 py-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Total PnL</span>
            <div className="text-sm lg:text-base font-bold font-mono text-emerald-400">
              +${state.totalPnlUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="px-3 py-1 border-l border-slate-800/60">
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Daily Net</span>
            <div className="text-sm lg:text-base font-bold font-mono text-emerald-400">
              +${state.dailyPnlUsd.toFixed(2)}
            </div>
          </div>
          <div className="px-3 py-1 border-l border-slate-800/60">
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Win Rate</span>
            <div className="text-sm lg:text-base font-bold font-mono text-cyan-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              {state.winRate}%
            </div>
          </div>
          <div className="px-3 py-1 border-l border-slate-800/60">
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Gas Spent</span>
            <div className="text-sm lg:text-base font-bold font-mono text-slate-300">
              ${state.gasSpentUsd.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Manual scan tick button */}
          <button
            onClick={onManualScan}
            title="Trigger immediate scan cycle"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition"
          >
            <Zap className="w-4 h-4 text-amber-400" />
          </button>

          {/* Passport Delegation Button */}
          <button
            onClick={onOpenPassportModal}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border ${
              isPassportActive
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                : 'bg-indigo-950/40 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>
              {isPassportActive
                ? `${state.passportSession?.walletAddress.slice(0, 6)}... (Passport OK)`
                : 'Kite Passport Auth'}
            </span>
          </button>

          {/* Engine Killswitch */}
          <button
            onClick={onToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
              state.isRunning
                ? 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {state.isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Running</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Paused</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
