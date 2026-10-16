import React from 'react';
import { Radar, BrainCircuit, ShieldAlert, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AgentRole, AgentTelemetry } from '../types/index.ts';

interface AgentNetworkProps {
  agents: Record<AgentRole, AgentTelemetry>;
}

const AGENT_CONFIGS: Record<
  AgentRole,
  {
    title: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    border: string;
    glow: string;
  }
> = {
  MarketRadar: {
    title: 'Market Radar Agent',
    sub: 'DEX Liquidity & Spread Scanner',
    icon: Radar,
    accent: 'text-cyan-400',
    border: 'border-cyan-500/30',
    glow: 'from-cyan-500/10 to-transparent',
  },
  SentimentAnalyzer: {
    title: 'Sentiment & Telemetry',
    sub: 'Kite Ecosystem Signal Synthesis',
    icon: BrainCircuit,
    accent: 'text-purple-400',
    border: 'border-purple-500/30',
    glow: 'from-purple-500/10 to-transparent',
  },
  RiskGuard: {
    title: 'Risk Guard Sentinel',
    sub: 'Slippage, MEV & Gas Defense',
    icon: ShieldAlert,
    accent: 'text-amber-400',
    border: 'border-amber-500/30',
    glow: 'from-amber-500/10 to-transparent',
  },
  ExecutionEngine: {
    title: 'Execution Engine',
    sub: 'Atomic Route Settlement',
    icon: Zap,
    accent: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'from-emerald-500/10 to-transparent',
  },
};

export const AgentNetwork: React.FC<AgentNetworkProps> = ({ agents }) => {
  const roles: AgentRole[] = ['MarketRadar', 'SentimentAnalyzer', 'RiskGuard', 'ExecutionEngine'];

  return (
    <div className="bg-[#0e1322] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Autonomous Multi-Agent Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            4 coordinated on-chain sub-agents executing non-custodial arbitrage on Kite Chain
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          State: <span className="text-emerald-400 font-semibold">SYNCHRONIZED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {roles.map((role, idx) => {
          const agent = agents[role];
          const conf = AGENT_CONFIGS[role];
          const Icon = conf.icon;
          const isScanning = agent?.status === 'scanning' || agent?.status === 'analyzing' || agent?.status === 'executing';

          return (
            <div key={role} className="relative group">
              <div
                className={`h-full bg-gradient-to-b ${conf.glow} bg-slate-900/60 rounded-xl border ${conf.border} p-4 transition-all duration-300 hover:border-slate-600 hover:shadow-lg`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg bg-slate-800/80 ${conf.accent} border border-slate-700/50`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${
                      isScanning
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 animate-pulse'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/50'
                    }`}
                  >
                    {agent?.status || 'idle'}
                  </span>
                </div>

                {/* Agent Titles */}
                <div className="mt-3">
                  <h3 className="text-sm font-bold text-white tracking-tight">{conf.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{conf.sub}</p>
                </div>

                {/* Metrics */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500">Tasks</span>
                    <div className="text-slate-200 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {agent?.tasksCompleted ?? 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Memory</span>
                    <div className="text-slate-300">{agent?.memoryUsageMb ?? 0} MB</div>
                  </div>
                </div>

                {/* Current Action Tooltip Box */}
                <div className="mt-3 p-2 bg-[#090d16] rounded-lg border border-slate-800 text-[10px] text-slate-400 font-mono line-clamp-2">
                  <span className="text-slate-600">&gt; </span>
                  {agent?.currentTaskDescription || 'Standing by for next block cycle'}
                </div>
              </div>

              {/* Connecting arrow (desktop only) */}
              {idx < 3 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 items-center justify-center text-slate-400 shadow-md">
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
