import { Router, Request, Response } from 'express';
import { store } from '../store/state.js';
import { getNetworkStats } from '../chain/client.js';
import { verifyPassportSession } from '../chain/passport.js';
import { PassportSession } from '../types.js';

export const apiRouter = Router();

// GET /api/status - Complete dashboard state & chain telemetry
apiRouter.get('/status', async (_req: Request, res: Response) => {
  const state = store.getState();
  const network = await getNetworkStats();
  res.json({
    success: true,
    data: {
      ...state,
      network,
    },
  });
});

// GET /api/signals - Market radar signals
apiRouter.get('/signals', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.getState().latestSignals,
  });
});

// GET /api/trades - Execution history
apiRouter.get('/trades', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.getState().recentTrades,
  });
});

// GET /api/opportunities - Arbitrage opportunities
apiRouter.get('/opportunities', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.getState().activeOpportunities,
  });
});

// POST /api/strategy/toggle - Emergency pause / resume
apiRouter.post('/strategy/toggle', (req: Request, res: Response) => {
  const { running } = req.body ?? {};
  const isRunning = store.toggleSystem(typeof running === 'boolean' ? running : undefined);
  res.json({
    success: true,
    data: { isRunning },
  });
});

// POST /api/passport/session - Delegate session key to agents
apiRouter.post('/passport/session', async (req: Request, res: Response) => {
  try {
    const { walletAddress, sessionPublicKey, authorizedAt, validUntil, maxDailyBudgetUsd, signature } = req.body;

    if (!walletAddress || !sessionPublicKey || !signature) {
      res.status(400).json({ success: false, error: 'Missing mandatory session parameters' });
      return;
    }

    const sessionPayload = {
      walletAddress,
      sessionPublicKey,
      authorizedAt: Number(authorizedAt) || Date.now(),
      validUntil: Number(validUntil) || Date.now() + 86400000,
      maxDailyBudgetUsd: Number(maxDailyBudgetUsd) || 500,
      signature,
    };

    const isValid = await verifyPassportSession(sessionPayload);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Invalid EIP-712 session signature' });
      return;
    }

    const fullSession: PassportSession = {
      ...sessionPayload,
      spentTodayUsd: 0,
      isActive: true,
    };

    store.setPassportSession(fullSession);
    res.json({ success: true, data: fullSession });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// DELETE /api/passport/session - Revoke session
apiRouter.delete('/passport/session', (_req: Request, res: Response) => {
  store.setPassportSession(null);
  res.json({ success: true, message: 'Session revoked successfully' });
});

// POST /api/simulate-tick - Trigger manual scan tick
apiRouter.post('/simulate-tick', (_req: Request, res: Response) => {
  store.addLog('System', 'info', 'Manual scan cycle invoked via API');
  res.json({ success: true, message: 'Scan cycle triggered' });
});
