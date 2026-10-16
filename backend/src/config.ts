import dotenv from 'dotenv';
import { z } from 'zod';
import { SystemConfig } from './types.js';

dotenv.config();

const configSchema = z.object({
  port: z.coerce.number().default(4000),
  kiteNetwork: z.enum(['mainnet', 'testnet']).default('testnet'),
  kiteRpcUrl: z.string().url().default('https://rpc-testnet.gokite.ai'),
  kiteChainId: z.coerce.number().default(2368),
  simulationMode: z
    .string()
    .optional()
    .transform((val) => val === undefined || val.toLowerCase() === 'true'),
  scanIntervalMs: z.coerce.number().min(1000).max(60000).default(3000),
  maxSlippageBps: z.coerce.number().min(1).max(500).default(50),
  maxGasLimit: z.coerce.number().min(21000).max(5000000).default(500000),
  maxDailyDrawdownUsd: z.coerce.number().min(10).default(500),
});

const rawConfig = {
  port: process.env.PORT,
  kiteNetwork: process.env.KITE_NETWORK,
  kiteRpcUrl: process.env.KITE_RPC_URL,
  kiteChainId: process.env.KITE_CHAIN_ID,
  simulationMode: process.env.SIMULATION_MODE,
  scanIntervalMs: process.env.AGENT_SCAN_INTERVAL_MS,
  maxSlippageBps: process.env.MAX_SLIPPAGE_BPS,
  maxGasLimit: process.env.MAX_GAS_LIMIT,
  maxDailyDrawdownUsd: process.env.MAX_DAILY_DRAWDOWN_USD,
};

export const config: SystemConfig = configSchema.parse(rawConfig);
