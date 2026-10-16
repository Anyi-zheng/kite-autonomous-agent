import { createPublicClient, http, defineChain } from 'viem';
import { config } from '../config.js';

export const kiteTestnet = defineChain({
  id: config.kiteChainId,
  name: 'Kite AI Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Kite',
    symbol: 'KITE',
  },
  rpcUrls: {
    default: {
      http: [config.kiteRpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: 'KiteScan',
      url: 'https://testnet.kitescan.ai',
    },
  },
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: kiteTestnet,
  transport: http(),
});

export async function getNetworkStats() {
  try {
    const blockNumber = await publicClient.getBlockNumber();
    const gasPrice = await publicClient.getGasPrice();
    return {
      connected: true,
      blockNumber: Number(blockNumber),
      gasPriceGwei: Number(gasPrice) / 1e9,
      network: config.kiteNetwork,
      chainId: config.kiteChainId,
    };
  } catch (err) {
    return {
      connected: false,
      blockNumber: 1849500,
      gasPriceGwei: 0.15,
      network: config.kiteNetwork,
      chainId: config.kiteChainId,
      error: err instanceof Error ? err.message : 'RPC unreachable',
    };
  }
}
