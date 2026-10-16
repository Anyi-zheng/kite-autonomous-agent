import { EventEmitter } from 'events';
import {
  GlobalDashboardState,
  AgentRole,
  AgentTelemetry,
  MarketSignal,
  ArbitrageOpportunity,
  TradeRecord,
  TerminalLog,
  PassportSession,
} from '../types.js';
import { config } from '../config.js';

class StateStore extends EventEmitter {
  private state: GlobalDashboardState;

  constructor() {
    super();
    this.state = {
      isRunning: true,
      config,
      totalPnlUsd: 1428.50,
      dailyPnlUsd: 184.20,
      winRate: 94.2,
      totalTrades: 38,
      gasSpentUsd: 12.85,
      agents: {
        MarketRadar: {
          role: 'MarketRadar',
          status: 'scanning',
          lastActive: Date.now(),
          tasksCompleted: 420,
          memoryUsageMb: 42.5,
          currentTaskDescription: 'Scanning KiteSwap v2 vs Camelot DEX pools for KITE/USDT price disparity',
        },
        SentimentAnalyzer: {
          role: 'SentimentAnalyzer',
          status: 'analyzing',
          lastActive: Date.now(),
          tasksCompleted: 156,
          memoryUsageMb: 38.1,
          currentTaskDescription: 'Evaluating Kite AI social sentiment and ecosystem grant signals',
        },
        RiskGuard: {
          role: 'RiskGuard',
          status: 'idle',
          lastActive: Date.now(),
          tasksCompleted: 98,
          memoryUsageMb: 31.4,
          currentTaskDescription: 'Monitoring slippage, MEV sandwich blocks & gas spikes on Kite Chain',
        },
        ExecutionEngine: {
          role: 'ExecutionEngine',
          status: 'idle',
          lastActive: Date.now(),
          tasksCompleted: 38,
          memoryUsageMb: 48.9,
          currentTaskDescription: 'Awaiting verified profitable arbitrage signals with Passport session auth',
        },
      },
      latestSignals: [],
      activeOpportunities: [],
      recentTrades: [
        {
          id: 'tr-001',
          timestamp: Date.now() - 3600000 * 2,
          pair: 'KITE / USDT',
          route: 'KiteSwap -> Uniswap v3',
          amountInUsd: 2500,
          amountOutUsd: 2538.4,
          profitUsd: 38.4,
          gasCostUsd: 0.18,
          txHash: '0x8f2a1b9c4d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f01',
          blockNumber: 1849201,
          status: 'confirmed',
        },
        {
          id: 'tr-002',
          timestamp: Date.now() - 3600000 * 1,
          pair: 'ETH / USDC',
          route: 'Kite Bridge Pool -> Camelot',
          amountInUsd: 5000,
          amountOutUsd: 5064.2,
          profitUsd: 64.2,
          gasCostUsd: 0.22,
          txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
          blockNumber: 1849450,
          status: 'confirmed',
        },
      ],
      passportSession: null,
      terminalLogs: [
        {
          id: 'log-001',
          timestamp: Date.now() - 10000,
          agent: 'System',
          level: 'info',
          message: `Kite Autonomous Multi-Agent Console initialized on ${config.kiteNetwork} (Chain ID: ${config.kiteChainId})`,
        },
      ],
    };
  }

  public getState(): GlobalDashboardState {
    return this.state;
  }

  public toggleSystem(running?: boolean): boolean {
    this.state.isRunning = running !== undefined ? running : !this.state.isRunning;
    this.addLog(
      'System',
      this.state.isRunning ? 'info' : 'warn',
      `Autonomous execution engine ${this.state.isRunning ? 'RESUMED' : 'PAUSED'} by operator`,
    );
    this.emit('update', this.state);
    return this.state.isRunning;
  }

  public updateAgent(role: AgentRole, updates: Partial<AgentTelemetry>): void {
    if (this.state.agents[role]) {
      this.state.agents[role] = {
        ...this.state.agents[role],
        ...updates,
        lastActive: Date.now(),
      };
      this.emit('agent_update', { role, agent: this.state.agents[role] });
    }
  }

  public addLog(
    agent: AgentRole | 'System',
    level: TerminalLog['level'],
    message: string,
    meta?: Record<string, unknown>,
  ): TerminalLog {
    const log: TerminalLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      agent,
      level,
      message,
      meta,
    };
    this.state.terminalLogs.push(log);
    if (this.state.terminalLogs.length > 200) {
      this.state.terminalLogs.shift();
    }
    this.emit('log', log);
    return log;
  }

  public addSignal(signal: MarketSignal): void {
    this.state.latestSignals.unshift(signal);
    if (this.state.latestSignals.length > 20) {
      this.state.latestSignals.pop();
    }
    this.emit('signal', signal);
  }

  public addOpportunity(opp: ArbitrageOpportunity): void {
    this.state.activeOpportunities.unshift(opp);
    if (this.state.activeOpportunities.length > 15) {
      this.state.activeOpportunities.pop();
    }
    this.emit('opportunity', opp);
  }

  public updateOpportunityStatus(
    id: string,
    status: ArbitrageOpportunity['status'],
    txHash?: string,
  ): void {
    const opp = this.state.activeOpportunities.find((o) => o.id === id);
    if (opp) {
      opp.status = status;
      if (txHash) opp.txHash = txHash;
      this.emit('opportunity_updated', opp);
    }
  }

  public recordTrade(trade: TradeRecord): void {
    this.state.recentTrades.unshift(trade);
    if (this.state.recentTrades.length > 50) {
      this.state.recentTrades.pop();
    }
    this.state.totalTrades += 1;
    this.state.totalPnlUsd += trade.profitUsd;
    this.state.dailyPnlUsd += trade.profitUsd;
    this.state.gasSpentUsd += trade.gasCostUsd;

    const wins = this.state.recentTrades.filter((t) => t.profitUsd > 0).length;
    this.state.winRate = Number(
      ((wins / this.state.recentTrades.length) * 100).toFixed(1),
    );

    this.emit('trade', trade);
    this.emit('update', this.state);
  }

  public setPassportSession(session: PassportSession | null): void {
    this.state.passportSession = session;
    if (session) {
      this.addLog(
        'System',
        'success',
        `Kite Passport session key connected for wallet: ${session.walletAddress.slice(0, 6)}...${session.walletAddress.slice(-4)} (Daily limit: $${session.maxDailyBudgetUsd})`,
      );
    } else {
      this.addLog('System', 'warn', 'Kite Passport session disconnected');
    }
    this.emit('update', this.state);
  }
}

export const store = new StateStore();
