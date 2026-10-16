import { MarketRadarAgent } from './marketRadar.js';
import { SentimentAnalyzerAgent } from './sentiment.js';
import { RiskGuardAgent } from './riskGuard.js';
import { ExecutionEngineAgent } from './execution.js';
import { store } from '../store/state.js';
import { config } from '../config.js';
import { ArbitrageOpportunity } from '../types.js';

export class AgentOrchestrator {
  public readonly radar: MarketRadarAgent;
  public readonly sentiment: SentimentAnalyzerAgent;
  public readonly riskGuard: RiskGuardAgent;
  public readonly execution: ExecutionEngineAgent;

  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    this.radar = new MarketRadarAgent();
    this.sentiment = new SentimentAnalyzerAgent();
    this.riskGuard = new RiskGuardAgent();
    this.execution = new ExecutionEngineAgent();
  }

  public async start(): Promise<void> {
    await Promise.all([
      this.radar.start(),
      this.sentiment.start(),
      this.riskGuard.start(),
      this.execution.start(),
    ]);

    // Hook store opportunity pipeline
    store.on('opportunity', (opp: ArbitrageOpportunity) => {
      this.handleOpportunityPipeline(opp).catch((err) => {
        store.addLog('System', 'error', `Pipeline execution error: ${err.message}`);
      });
    });

    // Start background scan ticker
    this.timer = setInterval(() => {
      if (store.getState().isRunning) {
        this.step().catch((err) => {
          store.addLog('System', 'error', `Scan tick error: ${err.message}`);
        });
      }
    }, config.scanIntervalMs);

    store.addLog(
      'System',
      'info',
      `Orchestrator online with 4 active agents. Polling every ${config.scanIntervalMs}ms`,
    );
  }

  public async stop(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    await Promise.all([
      this.radar.stop(),
      this.sentiment.stop(),
      this.riskGuard.stop(),
      this.execution.stop(),
    ]);
  }

  private async step(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    try {
      await this.radar.tick();
      await this.sentiment.tick();
      await this.riskGuard.tick();
    } finally {
      this.isProcessing = false;
    }
  }

  private async handleOpportunityPipeline(opp: ArbitrageOpportunity): Promise<void> {
    // 1. Sentiment confirmation
    const { confidence } = this.sentiment.analyzeSignal(opp.pair);
    if (confidence < 0.6) {
      store.updateOpportunityStatus(opp.id, 'risk_rejected');
      store.addLog('SentimentAnalyzer', 'warn', `Signal on ${opp.pair} dropped due to low sentiment confidence (${confidence})`);
      return;
    }

    // 2. Risk check
    const assessment = this.riskGuard.assessOpportunity(opp);
    if (!assessment.approved) {
      store.updateOpportunityStatus(opp.id, 'risk_rejected');
      store.addLog('RiskGuard', 'warn', `Opportunity ${opp.id} rejected by RiskGuard: ${assessment.rejectionReason}`);
      return;
    }

    // 3. Approved -> pass to execution
    store.updateOpportunityStatus(opp.id, 'approved');
    await this.execution.executeArbitrage(opp);
  }
}

export const orchestrator = new AgentOrchestrator();
