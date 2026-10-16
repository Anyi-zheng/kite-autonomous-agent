import React, { useState } from 'react';
import { Sliders, ShieldCheck, AlertTriangle } from 'lucide-react';

interface StrategyControlsProps {
  isRunning: boolean;
  onToggle: () => void;
}

export const StrategyControls: React.FC<StrategyControlsProps> = ({ isRunning, onToggle }) => {
  const [slippage, setSlippage] = useState<number>(50); // 50 bps = 0.5%
  const [minProfit, setMinProfit] = useState<number>(2.0); // $2.00
  const [riskFactor, setRiskFactor] = useState<string>('CONSERVATIVE');

  return (
    <div className="bg-[#0e1322] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Agent Risk &amp; Strategy Controls
            </h2>
          </div>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            Realtime
          </span>
        </div>

        <div className="space-y-4 text-xs font-mono">
          {/* Max Slippage Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400">MAX SLIPPAGE TOLERANCE</span>
              <span className="text-cyan-400 font-bold">{slippage} BPS ({slippage / 100}%)</span>
            </div>
            <input
              type="range"
              min={10}
              max={200}
              step={5}
              value={slippage}
              onChange={(e) => setSlippage(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Min Profit Buffer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400">MIN NET PROFIT THRESHOLD</span>
              <span className="text-emerald-400 font-bold">${minProfit.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={10.0}
              step={0.5}
              value={minProfit}
              onChange={(e) => setMinProfit(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Risk Appetite Selection */}
          <div>
            <span className="text-slate-400 block mb-1.5">RISK GUARD PROFILE</span>
            <div className="grid grid-cols-3 gap-2">
              {['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setRiskFactor(mode)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition ${
                    riskFactor === mode
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Killswitch Button */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <button
          onClick={onToggle}
          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
            isRunning
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {isRunning ? (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>EMERGENCY PAUSE ALL AGENTS</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>RESUME AGENT ARBITRAGE LOOP</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
