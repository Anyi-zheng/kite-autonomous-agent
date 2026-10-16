import React, { useState } from 'react';
import { ShieldCheck, X, Key, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { PassportSession } from '../types/index.ts';

interface PassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: PassportSession | null;
  onSubmitSession: (session: Omit<PassportSession, 'isActive' | 'spentTodayUsd'>) => Promise<void>;
  onRevokeSession: () => Promise<void>;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onSubmitSession,
  onRevokeSession,
}) => {
  const [walletAddress, setWalletAddress] = useState<string>(
    currentSession?.walletAddress || '0x71C8343e393746677722F7885C6894b34F080094'
  );
  const [dailyBudget, setDailyBudget] = useState<number>(
    currentSession?.maxDailyBudgetUsd || 500
  );
  const [durationHours, setDurationHours] = useState<number>(24);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthorize = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const authorizedAt = Date.now();
      const validUntil = authorizedAt + durationHours * 3600 * 1000;
      const sessionPublicKey = '0x2E234DAe75C793f67A35089C9d99245E1C58470b';
      const mockSignature = `0xmock_session_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;

      await onSubmitSession({
        walletAddress,
        sessionPublicKey,
        authorizedAt,
        validUntil,
        maxDailyBudgetUsd: dailyBudget,
        signature: mockSignature,
      });

      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Authorization failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    setIsSubmitting(true);
    try {
      await onRevokeSession();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Revocation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f1422] border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Kite Passport Session Key</h3>
            <p className="text-xs text-slate-400">Scoped EIP-712 non-custodial agent delegation</p>
          </div>
        </div>

        {currentSession && currentSession.isActive ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs font-mono space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Session Active &amp; Verified</span>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">Wallet:</span> {currentSession.walletAddress}
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">Daily Cap:</span> ${currentSession.maxDailyBudgetUsd} (Spent: ${currentSession.spentTodayUsd.toFixed(2)})
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">Expires:</span> {new Date(currentSession.validUntil).toLocaleString()}
              </div>
            </div>

            <button
              onClick={handleRevoke}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold text-xs hover:bg-rose-500/30 transition"
            >
              Revoke Session Key Delegation
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">DELEGATOR WALLET ADDRESS</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">DAILY BUDGET (USD)</label>
                <input
                  type="number"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">DURATION (HOURS)</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                >
                  <option value={6}>6 Hours</option>
                  <option value={24}>24 Hours</option>
                  <option value={72}>3 Days</option>
                  <option value={168}>7 Days</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans">
              <div className="flex items-center gap-1 text-slate-300 font-semibold mb-1">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Non-Custodial Scoped Security</span>
              </div>
              The AI Agent is granted authority to execute atomic arbitrage strictly within your specified daily spending limit. Private keys never leave your custody.
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleAuthorize}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-semibold text-xs hover:opacity-95 transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Signing Delegation...' : 'Authorize Kite Passport Session'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
