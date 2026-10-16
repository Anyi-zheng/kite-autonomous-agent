import test from 'node:test';
import assert from 'node:assert/strict';
import { MarketRadarAgent } from '../src/agents/marketRadar.js';
import { SentimentAnalyzerAgent } from '../src/agents/sentiment.js';
import { RiskGuardAgent } from '../src/agents/riskGuard.js';
import { ExecutionEngineAgent } from '../src/agents/execution.js';
import { ArbitrageOpportunity } from '../src/types.js';
import { store } from '../src/store/state.js';

test('MarketRadarAgent initializes and performs scan tick', async () => {
  const radar = new MarketRadarAgent();
  await radar.start();
  await radar.tick();
  
  const signals = store.getState().latestSignals;
  assert.ok(signals.length > 0, 'Should generate at least one market signal');
  assert.ok(signals[0].spreadBps >= 0, 'Spread bps should be non-negative');
  await radar.stop();
});

test('SentimentAnalyzerAgent computes confidence boost for KITE pairs', async () => {
  const sentiment = new SentimentAnalyzerAgent();
  await sentiment.start();
  const res = sentiment.analyzeSignal('KITE / USDT');
  assert.ok(res.confidence >= 0.8, 'Kite pair should have high confidence');
  await sentiment.stop();
});

test('RiskGuardAgent approves valid opportunities and rejects toxic ones', () => {
  const riskGuard = new RiskGuardAgent();

  const validOpp: ArbitrageOpportunity = {
    id: 'test-opp-1',
    timestamp: Date.now(),
    pair: 'KITE / USDT',
    route: ['KiteSwap v2', 'Camelot DEX'],
    spreadBps: 80,
    capitalUsd: 2500,
    grossProfitUsd: 20.0,
    gasEstimatedUsd: 0.2,
    netProfitUsd: 19.8,
    status: 'detected',
  };

  const assessment = riskGuard.assessOpportunity(validOpp);
  assert.equal(assessment.approved, true, 'Valid opportunity should be approved');
  assert.equal(assessment.riskScore, 2);

  const toxicOpp: ArbitrageOpportunity = {
    ...validOpp,
    id: 'test-opp-toxic',
    spreadBps: 1500, // excessively large anomaly
  };

  const toxicAssessment = riskGuard.assessOpportunity(toxicOpp);
  assert.equal(toxicAssessment.approved, false, 'Manipulated pool should be rejected');
});

test('ExecutionEngineAgent records simulated trades when executed', async () => {
  const exec = new ExecutionEngineAgent();
  await exec.start();

  const opp: ArbitrageOpportunity = {
    id: 'test-opp-exec',
    timestamp: Date.now(),
    pair: 'KITE / USDT',
    route: ['KiteSwap v2', 'Camelot DEX'],
    spreadBps: 65,
    capitalUsd: 2000,
    grossProfitUsd: 13.0,
    gasEstimatedUsd: 0.15,
    netProfitUsd: 12.85,
    status: 'approved',
  };

  const initialTrades = store.getState().totalTrades;
  const success = await exec.executeArbitrage(opp);
  assert.equal(success, true);
  assert.equal(store.getState().totalTrades, initialTrades + 1);

  await exec.stop();
});
