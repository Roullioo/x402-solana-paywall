# x402 Solana Paywall

> Autonomous AI agent for HTTP 402 micropayments on Solana

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195)](https://solana.com/)

## 🎯 Overview

**x402 Solana Paywall** is an open-source implementation of the HTTP 402 Payment Required protocol on Solana, featuring an autonomous AI agent that automatically detects payment requirements, makes micropayments, and retrieves protected resources.

### 🌐 Live Demo

**👉 [Try it live at https://x402.julientruffier.dev](https://x402.julientruffier.dev)**

The live demo includes:
- Interactive payment flow visualization
- Real-time blockchain transaction logs
- Complete documentation
- Working examples on Solana Devnet

## ✨ Features

### x402 Protocol Implementation
- ✅ Complete HTTP 402 flow: Request → Payment Requirements → Payment → Verification → Resource
- ✅ On-chain verification: receiver, amount, memo/reference validation
- ✅ Idempotence & anti-replay protection
- ✅ Reusable middleware for protecting any API route
- ✅ Automatic cleanup of expired payment references
- ✅ Rate limiting protection

### Autonomous AI Agent
- ✅ Plan-Act-Observe loop architecture
- ✅ Policy-based decisions: budget limits & host whitelisting
- ✅ Optional LLM integration (OpenAI or Local) for payment justification
- ✅ Automatic 402 detection and payment flow
- ✅ Retry logic with exponential backoff
- ✅ Network resilience for RPC calls

### Infrastructure
- ✅ TypeScript monorepo (ESM)
- ✅ Pure JavaScript store (no native dependencies)
- ✅ Comprehensive test suite
- ✅ Docker support
- ✅ CI/CD with GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Solana CLI (optional, for airdrops)

### Installation

```bash
# Clone the repository
git clone https://github.com/Roullioo/x402-solana-paywall.git
cd x402-solana-paywall

# Install dependencies
pnpm install

# Generate receiver keypair
cd packages/server
pnpm receiver:keygen
# Copy RECEIVER_PUBKEY to packages/server/.env

# Generate agent keypair
cd ../..
pnpm agent:keygen

# Get devnet SOL
pnpm agent:airdrop 0.1
```

### Development

```bash
# Start server and web interface
pnpm dev

# Server: http://localhost:3000
# Web UI: http://localhost:3001
```

### Run the Agent

```bash
# Test with protected resource
pnpm agent:run "get protected resource" "http://localhost:3000/api/data"

# Test with AI summarization
pnpm agent:run "summarize solana website" "http://localhost:3000/api/ai/summarize?url=https://solana.com"
```

## 📖 Documentation

- **[Live Documentation](https://x402.julientruffier.dev/docs)** - Complete technical documentation
- **[Architecture](./ARCHITECTURE.md)** - System architecture and flow diagrams
- **[Tutorial](./TUTORIAL.md)** - Step-by-step usage guide
- **[Security](./SECURITY.md)** - Security considerations and best practices
- **[Deployment](./DEPLOYMENT.md)** - Production deployment guide

## 🏗️ Architecture

```
Client Request
    ↓
Server (402 Payment Required)
    ↓
Payment Requirements { amount, receiver, reference, expiresAt }
    ↓
AI Agent (Policy Check → Payment Decision)
    ↓
Solana Transaction (SystemProgram.transfer + Memo)
    ↓
On-chain Confirmation
    ↓
Re-fetch with X-Payment Header
    ↓
Server Verification (receiver, amount, memo, idempotence)
    ↓
200 OK + Resource
```

## 🛠️ Project Structure

```
x402-solana-paywall/
├── packages/
│   ├── shared/          # Shared types & utilities (Zod schemas)
│   ├── server/          # Fastify API + on-chain verification
│   └── agent/           # Autonomous CLI agent
├── apps/
│   └── web/             # Next.js demo interface
└── scripts/             # E2E tests and utilities
```

## 📡 API Endpoints

### `GET /api/data`

Protected resource requiring payment.

**Without X-Payment header:**
```bash
curl http://localhost:3000/api/data
```
→ `402 Payment Required` with payment requirements

**With X-Payment header (after payment):**
```bash
curl -H "X-Payment: <base64_json>" http://localhost:3000/api/data
```
→ `200 OK` with resource data

### `POST /api/agent/execute`

Execute agent programmatically.

```bash
curl -X POST http://localhost:3000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"goal": "get resource", "url": "http://localhost:3000/api/data"}'
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests (requires running server)
pnpm server:dev &
pnpm e2e
```

## 🐳 Docker

```bash
docker-compose up --build
```

## 🔐 Security

⚠️ **This is a hackathon project. Do not use in production without a security audit.**

Key security features:
- On-chain verification of all payments
- Idempotence protection (one reference = one payment)
- Anti-replay protection (one transaction signature = one use)
- Rate limiting
- Automatic expiration handling

See [SECURITY.md](./SECURITY.md) for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🎓 Hackathon Submission

This project was created for the **x402 Solana Hackathon** and demonstrates:

- ✅ Autonomous AI agent with Solana wallet management
- ✅ HTTP 402 Payment Required protocol implementation
- ✅ On-chain payment verification
- ✅ Policy-based autonomous decision making
- ✅ Complete open-source codebase
- ✅ Deployed on Solana Devnet
- ✅ Comprehensive documentation

### Bounty Categories

- **Best Agent Without Trust** - Autonomous agent with identity/reputation
- **Best x402 API Integration** - Payments and micropayments between agents
- **Best Dev Tool** - SDK, libraries, frameworks

## 🔗 Resources

- [Live Demo](https://x402.julientruffier.dev)
- [Documentation](https://x402.julientruffier.dev/docs)
- [Solana Documentation](https://docs.solana.com/)
- [HTTP 402 Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402)

## 👥 Authors

Developed for the x402 Solana Hackathon 2025 🚀

---

**⭐ If you find this project useful, please star it on GitHub!**
