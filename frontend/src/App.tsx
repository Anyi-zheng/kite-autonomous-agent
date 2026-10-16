import { useState } from 'react';
import { useKiteAgent } from './hooks/useKiteAgent.ts';
import { Header } from './components/Header.tsx';
import { AgentNetwork } from './components/AgentNetwork.tsx';
import { SignalFeed } from './components/SignalFeed.tsx';
import { OpportunityQueue } from './components/OpportunityQueue.tsx';
import { LiveTrades } from './components/LiveTrades.tsx';
import { TerminalLogs } from './components/TerminalLogs.tsx';
import { StrategyControls } from './components/StrategyControls.tsx';
import { PassportModal } from './components/PassportModal.tsx';

export function App() {
  const {
    state,
    wsConnected,
    toggleSystem,
    triggerManualScan,
    submitPassportSession,
    revokePassportSession,
  } = useKiteAgent();

  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        state={state}
        wsConnected={wsConnected}
        onToggle={toggleSystem}
        onOpenPassportModal={() => setIsPassportModalOpen(true)}
        onManualScan={triggerManualScan}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Top: Multi-Agent Network Topology */}
        <AgentNetwork agents={state.agents} />

        {/* Middle: 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <SignalFeed signals={state.latestSignals} />
            <LiveTrades trades={state.recentTrades} />
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-6">
            <OpportunityQueue opportunities={state.activeOpportunities} />
            <StrategyControls isRunning={state.isRunning} onToggle={toggleSystem} />
          </div>
        </div>

        {/* Bottom: Realtime Terminal Stream */}
        <TerminalLogs logs={state.terminalLogs} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        Kite AI Autonomous Trading &amp; Research Agent Console • Built for Kite AI Ecosystem • Kite Testnet Chain ID: 2368
      </footer>

      {/* Kite Passport Authorization Modal */}
      <PassportModal
        isOpen={isPassportModalOpen}
        onClose={() => setIsPassportModalOpen(false)}
        currentSession={state.passportSession}
        onSubmitSession={async (session) => {
          await submitPassportSession(session);
        }}
        onRevokeSession={async () => {
          await revokePassportSession();
        }}
      />
    </div>
  );
}

export default App;
