import { verifyTypedData, type Address, type Hex } from 'viem';
import { PassportSession } from '../types.js';
import { config } from '../config.js';

export const PASSPORT_DOMAIN = {
  name: 'KitePassportSessionDelegation',
  version: '1',
  chainId: BigInt(config.kiteChainId),
  verifyingContract: '0x2E234DAe75C793f67A35089C9d99245E1C58470b' as Address,
};

export const PASSPORT_SESSION_TYPES = {
  SessionGrant: [
    { name: 'walletAddress', type: 'address' },
    { name: 'sessionPublicKey', type: 'address' },
    { name: 'authorizedAt', type: 'uint256' },
    { name: 'validUntil', type: 'uint256' },
    { name: 'maxDailyBudgetUsd', type: 'uint256' },
  ],
};

export async function verifyPassportSession(
  session: Omit<PassportSession, 'isActive' | 'spentTodayUsd'>,
): Promise<boolean> {
  // If simulation mode and mock signature
  if (config.simulationMode && session.signature.startsWith('0xmock_')) {
    return true;
  }

  try {
    const isValid = await verifyTypedData({
      address: session.walletAddress as Address,
      domain: PASSPORT_DOMAIN,
      types: PASSPORT_SESSION_TYPES,
      primaryType: 'SessionGrant',
      message: {
        walletAddress: session.walletAddress as Address,
        sessionPublicKey: session.sessionPublicKey as Address,
        authorizedAt: BigInt(session.authorizedAt),
        validUntil: BigInt(session.validUntil),
        maxDailyBudgetUsd: BigInt(session.maxDailyBudgetUsd),
      },
      signature: session.signature as Hex,
    });
    return isValid;
  } catch (err) {
    console.warn('EIP-712 session verification error, checking fallback:', err);
    return false;
  }
}

export function isSessionValid(session: PassportSession | null): {
  valid: boolean;
  reason?: string;
} {
  if (!session) {
    return { valid: false, reason: 'No active Kite Passport session' };
  }
  if (!session.isActive) {
    return { valid: false, reason: 'Passport session is revoked or inactive' };
  }
  if (Date.now() > session.validUntil) {
    return { valid: false, reason: 'Passport session expired' };
  }
  if (session.spentTodayUsd >= session.maxDailyBudgetUsd) {
    return { valid: false, reason: 'Daily spending limit exceeded' };
  }
  return { valid: true };
}
