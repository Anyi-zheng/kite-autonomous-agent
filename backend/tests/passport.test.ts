import test from 'node:test';
import assert from 'node:assert/strict';
import { isSessionValid, verifyPassportSession } from '../src/chain/passport.js';
import { PassportSession } from '../src/types.js';

test('isSessionValid validates active, unexpired session within budget', () => {
  const validSession: PassportSession = {
    walletAddress: '0x71C8343e393746677722F7885C6894b34F080094',
    sessionPublicKey: '0x2E234DAe75C793f67A35089C9d99245E1C58470b',
    authorizedAt: Date.now() - 1000,
    validUntil: Date.now() + 86400000,
    maxDailyBudgetUsd: 500,
    spentTodayUsd: 12.5,
    signature: '0xmock_sig_123',
    isActive: true,
  };

  const check = isSessionValid(validSession);
  assert.equal(check.valid, true);

  // Expired session
  const expiredSession: PassportSession = {
    ...validSession,
    validUntil: Date.now() - 1000,
  };
  assert.equal(isSessionValid(expiredSession).valid, false);

  // Exceeded budget
  const overBudgetSession: PassportSession = {
    ...validSession,
    spentTodayUsd: 600,
  };
  assert.equal(isSessionValid(overBudgetSession).valid, false);
});

test('verifyPassportSession handles mock session verification in simulation mode', async () => {
  const mockSession = {
    walletAddress: '0x71C8343e393746677722F7885C6894b34F080094',
    sessionPublicKey: '0x2E234DAe75C793f67A35089C9d99245E1C58470b',
    authorizedAt: Date.now(),
    validUntil: Date.now() + 86400000,
    maxDailyBudgetUsd: 500,
    signature: '0xmock_valid_signature',
  };

  const verified = await verifyPassportSession(mockSession);
  assert.equal(verified, true);
});
