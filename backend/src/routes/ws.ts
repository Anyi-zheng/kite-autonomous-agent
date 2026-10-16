import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { store } from '../store/state.js';

export function setupWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server });

  const broadcast = (type: string, data: unknown) => {
    const payload = JSON.stringify({ type, data });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  };

  wss.on('connection', (ws) => {
    // Send immediate snapshot on connect
    ws.send(JSON.stringify({ type: 'SNAPSHOT', data: store.getState() }));

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch {
        // Ignore malformed WS message
      }
    });
  });

  // Wire up store events to WebSocket broadcast
  store.on('log', (log) => broadcast('LOG', log));
  store.on('signal', (signal) => broadcast('SIGNAL', signal));
  store.on('opportunity', (opp) => broadcast('OPPORTUNITY', opp));
  store.on('opportunity_updated', (opp) => broadcast('OPPORTUNITY_UPDATED', opp));
  store.on('trade', (trade) => broadcast('TRADE', trade));
  store.on('update', (state) => broadcast('STATE_UPDATE', state));
  store.on('agent_update', (agent) => broadcast('AGENT_UPDATE', agent));

  return wss;
}
