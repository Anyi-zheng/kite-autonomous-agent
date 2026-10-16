import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config.js';
import { apiRouter } from './routes/api.js';
import { setupWebSocketServer } from './routes/ws.js';
import { orchestrator } from './agents/orchestrator.js';
import { store } from './store/state.js';

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/healthz', (_req, res) => {
  res.json({
    status: 'healthy',
    network: config.kiteNetwork,
    chainId: config.kiteChainId,
    timestamp: Date.now(),
  });
});

const server = createServer(app);
setupWebSocketServer(server);

server.listen(config.port, async () => {
  console.log(`====================================================`);
  console.log(`🪁 Kite Autonomous Agent Backend Online`);
  console.log(`📡 HTTP & WS Server: http://localhost:${config.port}`);
  console.log(`⛓️  Target Network:   ${config.kiteNetwork} (Chain ID: ${config.kiteChainId})`);
  console.log(`🤖 Multi-Agent Loop: ACTIVE (Polling every ${config.scanIntervalMs}ms)`);
  console.log(`====================================================`);

  // Start orchestrator loop
  await orchestrator.start();
});

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}, gracefully shutting down agent loop...`);
  await orchestrator.stop();
  server.close(() => {
    console.log('HTTP & WebSocket server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    process.exit(0);
  }, 3000);
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
