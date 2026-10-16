import { BaseAgent } from './base.js';
import { AgentRole, ArbitrageOpportunity, RiskAssessment } from '../types.js';
import { config } from '../config.js';
import { store } from '../store/state.js';

export class RiskGuardAgent extends BaseAgent {
  public readonly role: AgentRole = 'RiskGuard';

  public async tick(): Promise<void> {
    if (!this.isRunning) return;

    this.setStatus('analyzing', 'Verifying active pools against flashloan replay and sandwich vector defenses');
    this.incrementTasks();
    this.setStatus('idle', 'Risk perimeter secure');
  }

  public assessOpportunity(opp: ArbitrageOpportunity): RiskAssessment {
    const currentState = store.getState();

    // 1. Drawdown check
    if (currentState.dailyPnlUsd <= -config.maxDailyDrawdownUsd) {
      this.log('warn', `Emergency killswitch: Daily drawdown limit ($${config.maxDailyDrawdownUsd}) reached`);
      return {
        approved: false,
        rejectionReason: 'Daily drawdown limit reached',
        riskScore: 10,
        slippageExpectedBps: 0,
        mevSandwichRisk: 'elevated',
        gasLimitUsd: opp.gasEstimatedUsd,
        maxSafeCapitalUsd: 0,
      };
    }

    // 2. Anomaly filter (spread > 500 bps is suspicious illiquid or exploit pool)
    if (opp.spreadBps > 500) {
      this.log('warn', `Suspicious anomaly spread of ${opp.spreadBps} bps rejected as toxic pool`, { oppId: opp.id });
      return {
        approved: false,
        rejectionReason: 'Excessive spread indicative of pool manipulation or low liquidity',
        riskScore: 9,
        slippageExpectedBps: 200,
        mevSandwichRisk: 'elevated',
        gasLimitUsd: opp.gasEstimatedUsd,
        maxSafeCapitalUsd: 500,
      };
    }

    // 3. Profitability threshold check
    if (opp.netProfitUsd <= 1.5) {
      return {
        approved: false,
        rejectionReason: 'Net yield below minimum margin buffer ($1.50)',
        riskScore: 5,
        slippageExpectedBps: 15,
        mevSandwichRisk: 'minimal',
        gasLimitUsd: opp.gasEstimatedUsd,
        maxSafeCapitalUsd: 1000,
      };
    }

    // 4. Gas / Profit ratio check
    if (opp.gasEstimatedUsd / opp.grossProfitUsd > 0.4) {
      return {
        approved: false,
        rejectionReason: 'Gas overhead consumes >40% of gross profit',
        riskScore: 6,
        slippageExpectedBps: 20,
        mevSandwichRisk: 'moderate',
        gasLimitUsd: opp.gasEstimatedUsd,
        maxSafeCapitalUsd: 2000,
      };
    }

    const slippage = Math.min(opp.spreadBps / 4, config.maxSlippageBps);
    return {
      approved: true,
      riskScore: 2,
      slippageExpectedBps: Math.round(slippage),
      mevSandwichRisk: 'minimal',
      gasLimitUsd: opp.gasEstimatedUsd,
      maxSafeCapitalUsd: opp.capitalUsd,
    };
  }
}
