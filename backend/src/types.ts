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

export interface SentimentMetric {
  pair: string;
  sentimentScore: number; // 0 - 100
  momentumScore: number;  // -1.0 to 1.0
  socialVolumeIndex: number;
  developerActivityScore: number;
  signalConfidence: number; // 0.0 to 1.0
}

export interface RiskAssessment {
  approved: boolean;
  rejectionReason?: string;
  riskScore: number; // 1 to 10
  slippageExpectedBps: number;
  mevSandwichRisk: 'minimal' | 'moderate' | 'elevated';
  gasLimitUsd: number;
  maxSafeCapitalUsd: number;
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

export interface SystemConfig {
  port: number;
  kiteNetwork: 'mainnet' | 'testnet';
  kiteRpcUrl: string;
  kiteChainId: number;
  simulationMode: boolean;
  scanIntervalMs: number;
  maxSlippageBps: number;
  maxGasLimit: number;
  maxDailyDrawdownUsd: number;
}

export interface GlobalDashboardState {
  isRunning: boolean;
  config: SystemConfig;
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
}

export interface TerminalLog {
  id: string;
  timestamp: number;
  agent: AgentRole | 'System';
  level: 'info' | 'warn' | 'success' | 'error';
  message: string;
  meta?: Record<string, unknown>;
}
