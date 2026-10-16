import { useState, useEffect, useCallback, useRef } from 'react';
import { GlobalDashboardState, TerminalLog, MarketSignal, ArbitrageOpportunity, TradeRecord, PassportSession } from '../types/index.ts';

const DEFAULT_STATE: GlobalDashboardState = {
  isRunning: true,
  totalPnlUsd: 1428.5,
  dailyPnlUsd: 184.2,
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
      currentTaskDescription: 'Scanning KiteSwap v2 vs Camelot DEX pools for KITE/USDT disparity',
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
  recentTrades: [],
  passportSession: null,
  terminalLogs: [],
  network: {
    connected: true,
    blockNumber: 1849420,
    gasPriceGwei: 0.15,
    network: 'testnet',
    chainId: 2368,
  },
};

export function useKiteAgent() {
  const [state, setState] = useState<GlobalDashboardState>(DEFAULT_STATE);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setState((prev) => ({ ...prev, ...json.data }));
        }
      }
    } catch {
      // Backend may be starting up
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connectWs = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const { type, data } = JSON.parse(event.data);
            switch (type) {
              case 'SNAPSHOT':
              case 'STATE_UPDATE':
                setState((prev) => ({ ...prev, ...data }));
                break;
              case 'LOG':
                setState((prev) => ({
                  ...prev,
                  terminalLogs: [...prev.terminalLogs.slice(-150), data as TerminalLog],
                }));
                break;
              case 'SIGNAL':
                setState((prev) => ({
                  ...prev,
                  latestSignals: [data as MarketSignal, ...prev.latestSignals.slice(0, 19)],
                }));
                break;
              case 'OPPORTUNITY':
                setState((prev) => ({
                  ...prev,
                  activeOpportunities: [data as ArbitrageOpportunity, ...prev.activeOpportunities.slice(0, 14)],
                }));
                break;
              case 'OPPORTUNITY_UPDATED':
                setState((prev) => ({
                  ...prev,
                  activeOpportunities: prev.activeOpportunities.map((o) =>
                    o.id === (data as ArbitrageOpportunity).id ? (data as ArbitrageOpportunity) : o
                  ),
                }));
                break;
              case 'TRADE':
                setState((prev) => ({
                  ...prev,
                  recentTrades: [data as TradeRecord, ...prev.recentTrades.slice(0, 49)],
                  totalTrades: prev.totalTrades + 1,
                  totalPnlUsd: Number((prev.totalPnlUsd + (data as TradeRecord).profitUsd).toFixed(2)),
                  dailyPnlUsd: Number((prev.dailyPnlUsd + (data as TradeRecord).profitUsd).toFixed(2)),
                  gasSpentUsd: Number((prev.gasSpentUsd + (data as TradeRecord).gasCostUsd).toFixed(2)),
                }));
                break;
              case 'AGENT_UPDATE':
                setState((prev) => ({
                  ...prev,
                  agents: {
                    ...prev.agents,
                    [(data as { role: string }).role]: (data as { agent: any }).agent,
                  },
                }));
                break;
            }
          } catch {
            // Ignore parse errors
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimer = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        reconnectTimer = setTimeout(connectWs, 3000);
      }
    };

    connectWs();

    // Polling fallback every 5s
    const pollInterval = setInterval(fetchStatus, 5000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchStatus]);

  const toggleSystem = async () => {
    try {
      const res = await fetch('/api/strategy/toggle', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setState((prev) => ({ ...prev, isRunning: json.data.isRunning }));
      }
    } catch (e) {
      console.error('Failed to toggle system', e);
    }
  };

  const triggerManualScan = async () => {
    try {
      await fetch('/api/simulate-tick', { method: 'POST' });
    } catch (e) {
      console.error('Failed to trigger scan', e);
    }
  };

  const submitPassportSession = async (session: Omit<PassportSession, 'isActive' | 'spentTodayUsd'>) => {
    const res = await fetch('/api/passport/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to authorize session');
    setState((prev) => ({ ...prev, passportSession: json.data }));
    return json.data;
  };

  const revokePassportSession = async () => {
    await fetch('/api/passport/session', { method: 'DELETE' });
    setState((prev) => ({ ...prev, passportSession: null }));
  };

  return {
    state,
    wsConnected,
    toggleSystem,
    triggerManualScan,
    submitPassportSession,
    revokePassportSession,
  };
}
