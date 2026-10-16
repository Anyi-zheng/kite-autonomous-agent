export type AgentRole = 
  | 'MarketRadar' 
  | 'SentimentAnalyzer' 
  | 'RiskGuard' 
  | 'ExecutionEngine';

export type AgentStatus = 
  | 'idle' 
  | 'scanning' 
  | 'analyzing' 
  | 'executing' 
  | 'cooldown' 
  | 'error';

export interface AgentTelemetry {
  role: AgentRole;
  status: AgentStatus;
  lastActive: number;
  tasksCompleted: number;
  memoryUsageMb: number;
  currentTaskDescription: string;
}

export interface MarketSignal {
  id: string;
  timestamp: number;
  pair: string;
  dexA: string;
  dexB: string;
  priceA: number;
  priceB: number;
  spreadBps: number;
  liquidityUsd: number;
  volatility24h: number;
}

export interface ArbitrageOpportunity {
  id: string;
  timestamp: number;
  pair: string;
  route: string[];
  spreadBps: number;
  capitalUsd: number;
  grossProfitUsd: number;
  gasEstimatedUsd: number;
  netProfitUsd: number;
  status: 'detected' | 'risk_rejected' | 'approved' | 'executed' | 'simulated';
  txHash?: string;
}

export interface TradeRecord {
  id: string;
  timestamp: number;
  pair: string;
  route: string;
  amountInUsd: number;
  amountOutUsd: number;
  profitUsd: number;
  gasCostUsd: number;
  txHash: string;
  blockNumber: number;
  status: 'confirmed' | 'simulated' | 'reverted';
}

export interface PassportSession {
  walletAddress: string;
  sessionPublicKey: string;
  authorizedAt: number;
  validUntil: number;
  maxDailyBudgetUsd: number;
  spentTodayUsd: number;
  signature: string;
  isActive: boolean;
}

export interface TerminalLog {
  id: string;
  timestamp: number;
  agent: AgentRole | 'System';
  level: 'info' | 'warn' | 'success' | 'error';
  message: string;
  meta?: Record<string, unknown>;
}

export interface NetworkInfo {
  connected: boolean;
  blockNumber: number;
  gasPriceGwei: number;
  network: string;
  chainId: number;
}

export interface GlobalDashboardState {
  isRunning: boolean;
  totalPnlUsd: number;
  dailyPnlUsd: number;
  winRate: number;
  totalTrades: number;
  gasSpentUsd: number;
  agents: Record<AgentRole, AgentTelemetry>;
  latestSignals: MarketSignal[];
  activeOpportunities: ArbitrageOpportunity[];
  recentTrades: TradeRecord[];
  passportSession: PassportSession | null;
  terminalLogs: TerminalLog[];
  network?: NetworkInfo;
}
