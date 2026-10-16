import { BaseAgent } from './base.js';
import { AgentRole, MarketSignal, ArbitrageOpportunity } from '../types.js';
import { store } from '../store/state.js';

interface MonitoredPair {
  pair: string;
  basePrice: number;
  dexA: string;
  dexB: string;
  liquidityUsd: number;
}

const MONITORED_PAIRS: MonitoredPair[] = [
  { pair: 'KITE / USDT', basePrice: 1.25, dexA: 'KiteSwap v2', dexB: 'Camelot DEX', liquidityUsd: 850000 },
  { pair: 'ETH / USDC', basePrice: 3150.0, dexA: 'Kite Bridge Pool', dexB: 'Uniswap v3', liquidityUsd: 3200000 },
  { pair: 'WBTC / KITE', basePrice: 68400.0, dexA: 'KiteSwap v2', dexB: 'TraderJoe', liquidityUsd: 1450000 },
  { pair: 'pieUSD / USDC', basePrice: 0.9992, dexA: 'Kite Passport Curve', dexB: 'KiteSwap v2', liquidityUsd: 2100000 },
];

export class MarketRadarAgent extends BaseAgent {
  public readonly role: AgentRole = 'MarketRadar';

  public async tick(): Promise<void> {
    if (!this.isRunning) return;

    this.setStatus('scanning', 'Polling Kite Chain DEX liquidity pools for price divergence...');

    for (const item of MONITORED_PAIRS) {
      // Simulate micro price fluctuation with occasional arbitrage spread
      const noise = (Math.random() - 0.48) * 0.012; // slight positive drift
      const spreadFactor = Math.random() < 0.35 ? (0.006 + Math.random() * 0.012) : (Math.random() * 0.003);
      
      const priceA = Number((item.basePrice * (1 + noise)).toFixed(4));
      const priceB = Number((priceA * (1 + spreadFactor)).toFixed(4));
      const spreadBps = Math.round((Math.abs(priceB - priceA) / priceA) * 10000);

      const signal: MarketSignal = {
        id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        pair: item.pair,
        dexA: item.dexA,
        dexB: item.dexB,
        priceA,
        priceB,
        spreadBps,
        liquidityUsd: Math.round(item.liquidityUsd * (0.95 + Math.random() * 0.1)),
        volatility24h: Number((2.4 + Math.random() * 3.8).toFixed(2)),
      };

      store.addSignal(signal);

      // If spread exceeds threshold (>= 40 bps = 0.40%), register opportunity
      if (spreadBps >= 40) {
        const capital = item.pair.includes('ETH') || item.pair.includes('WBTC') ? 5000 : 2500;
        const grossProfit = Number(((capital * spreadBps) / 10000).toFixed(2));
        const gasEstimated = Number((0.15 + Math.random() * 0.15).toFixed(2));
        const netProfit = Number((grossProfit - gasEstimated).toFixed(2));

        if (netProfit > 2.0) {
          const opp: ArbitrageOpportunity = {
            id: `opp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: Date.now(),
            pair: item.pair,
            route: [item.dexA, item.dexB],
            spreadBps,
            capitalUsd: capital,
            grossProfitUsd: grossProfit,
            gasEstimatedUsd: gasEstimated,
            netProfitUsd: netProfit,
            status: 'detected',
          };

          store.addOpportunity(opp);
          this.log(
            'info',
            `Radar identified spread of ${spreadBps} bps on ${item.pair} (${item.dexA} -> ${item.dexB}). Est. profit: $${netProfit}`,
            { spreadBps, netProfit },
          );
        }
      }
    }

    this.incrementTasks();
    this.setStatus('idle', 'Resting between scan cycles');
  }
}
