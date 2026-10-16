# 🪁 Kite AI Autonomous Trading & Research Agent Console

> **A full-stack, production-ready autonomous multi-agent research, market radar, and atomic arbitrage execution platform built for the Kite AI ecosystem.**

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Network](https://img.shields.io/badge/Network-Kite%20Testnet%20(2368)-emerald.svg)](https://testnet.kitescan.ai)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)

[English](#english) | [中文说明](#chinese)

---

<a name="english"></a>
## 🌟 Overview

The **Kite AI Autonomous Trading & Research Agent Console** is a specialized decentralized finance and AI agent operations console. Powered by the high-throughput **Kite AI Chain**, it coordinates four specialized sub-agents working in an autonomous pipeline to scan decentralized exchanges, evaluate on-chain market sentiment, enforce strict risk boundaries, and execute non-custodial atomic arbitrage transactions via **Kite Passport EIP-712 session key delegation**.

### 🤖 Multi-Agent Architecture

```mermaid
flowchart LR
    A["🛰️ MarketRadar Agent"] -->|"Price Spreads & Liquidity"| B["🧠 Sentiment Analyzer"]
    B -->|"Confidence & Momentum"| C["🛡️ RiskGuard Sentinel"]
    C -->|"Risk Check & Slippage Defense"| D["⚡ Execution Engine"]
    D -->|"Atomic Arbitrage (Kite Passport)"| E["⛓️ Kite Chain (RPC: 2368)"]
    
    style A fill:#0d1829,stroke:#00e5ff,stroke-width:2px
    style B fill:#170f29,stroke:#a855f7,stroke-width:2px
    style C fill:#24190c,stroke:#f59e0b,stroke-width:2px
    style D fill:#0b2118,stroke:#10b981,stroke-width:2px
    style E fill:#111827,stroke:#64748b,stroke-width:2px
```

1. **MarketRadar Agent (`MarketRadar`)**: Continuously scans DEX liquidity pools across Kite AI (KiteSwap v2, Camelot, Uniswap v3 bridge) for price divergences on pairs like `KITE/USDT`, `ETH/USDC`, `WBTC/KITE`, and `pieUSD/USDC`.
2. **Sentiment & Telemetry Agent (`SentimentAnalyzer`)**: Analyzes on-chain velocity, developer commit spikes, and Kite AI ecosystem grant distributions to compute real-time signal confidence.
3. **RiskGuard Sentinel (`RiskGuard`)**: Validates potential arbitrage paths against maximum slippage, anomalous pool manipulation, flashloan sandwich risks, and daily drawdown constraints.
4. **Execution Engine (`ExecutionEngine`)**: Constructs multi-hop atomic swap routes and signs transactions using non-custodial **Kite Passport delegated session keys**.

---

## 🚀 Key Features

- **Full-Stack Architecture**: Clean separation between a reactive TypeScript Node.js backend (REST + WebSocket stream) and a modern cyberpunk React + Tailwind CSS dashboard.
- **Kite Passport Session Key Delegation**: Users grant bounded EIP-712 session permissions (maximum daily budget and time expiry), allowing the agent to execute autonomous trades without risking private keys.
- **Real-Time WebSocket Telemetry**: Immediate streaming of agent state transitions, detected price spreads, approved routes, and block settlements.
- **Comprehensive Risk Controls**: Built-in killswitch, dynamic slippage tolerance sliders, and daily drawdown limits.
- **Simulation & Live Mode**: Supports zero-risk dry-run simulation mode as well as real Kite Testnet (Chain ID `2368`) execution.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, WebSocket (`ws`), Viem (EVM & Kite Chain client), Zod validation, TSX runner.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
- **Blockchain**: Kite AI Testnet / Mainnet (EVM-compatible, Chain ID `2368`, RPC: `https://rpc-testnet.gokite.ai`).

---

## 📦 Quick Start

### 1. Prerequisites
- Node.js `>= 20.0.0`
- npm or bun

### 2. Installation
```bash
# Clone or navigate to the project directory
cd kite-autonomous-agent

# Install dependencies for both backend and frontend
npm run install:all
```

### 3. Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default parameters are pre-configured for Kite AI Testnet out of the box.

### 4. Running the Console
Start both the backend server and frontend development dashboard concurrently:
```bash
# Start backend (Port 4000) & frontend (Port 3000)
npm run dev
```

Open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

### 5. Running Tests
```bash
npm run test
```

---

<a name="chinese"></a>
## 🇨🇳 中文说明

### 项目简介
**Kite AI 链上自主投研与套利 Agent 控制台** 是一套专为 Kite AI 生态定制的去中心化金融与自主智能体操作系统。基于高性能的 **Kite AI Chain**，系统编排 4 个专业级链上 Sub-Agent 形成全自动流水线：监听去中心化交易所价差、分析链上投研与开发者指标、进行严密风控校验，并通过 **Kite Passport EIP-712 会话授权** 实现非托管式链上原子套利执行。

### 核心功能
1. **多智能体自主流水线**：
   - **MarketRadar（市场雷达）**：毫秒级轮询 KiteSwap、Camelot 等 DEX 池子，识别基差点差（bps）；
   - **SentimentAnalyzer（舆情与开发者指标分析器）**：综合链上流动性异动与生态 Grants 动向计算置信度；
   - **RiskGuard（风控卫士）**：严格校验滑点上限、防范 MEV 夹子攻击与最大单日回撤；
   - **ExecutionEngine（执行引擎）**：构建多跳路由，结合 Kite Passport 委托凭证进行原子结算。
2. **Kite Passport 会话密钥委托**：支持 EIP-712 签名授权限定额度（如每日 $500）与时间窗口，无需暴露钱包主私钥即可让智能体自主交易。
3. **实时 WebSocket 全景大屏**：涵盖 Agent 心跳拓扑图、实时 DEX 价差表、待执行套利队列、已确认链上交易表与赛博朋克终端日志流。
4. **一键应急熔断机制**：支持随时通过前端按钮或 API 暂停/恢复智能体运行。

---

## 📡 API 参考

| 方法 | 路由 | 说明 |
| :--- | :--- | :--- |
| `GET` | `/api/status` | 获取仪表盘完整状态、网络指标与 Agent 遥测 |
| `GET` | `/api/signals` | 获取最新市场雷达价差与流动性指标 |
| `GET` | `/api/trades` | 获取最近结算交易记录及区块哈希 |
| `GET` | `/api/opportunities` | 获取当前活跃与待执行套利队列 |
| `POST` | `/api/strategy/toggle` | 紧急暂停或恢复自主执行引擎 |
| `POST` | `/api/passport/session` | 提交/激活 Kite Passport EIP-712 委托会话 |
| `DELETE` | `/api/passport/session` | 撤销 Kite Passport 会话委托 |
| `POST` | `/api/simulate-tick` | 触发一次即时扫描与套利评估循环 |

---

## 📄 License
This project is licensed under the [Apache-2.0 License](LICENSE).
