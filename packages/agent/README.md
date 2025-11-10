# @x402/agent - Autonomous AI Agent for x402 Paywall

Autonomous CLI agent capable of automatically paying for resources protected by HTTP 402 paywall on Solana.

## 🚀 Installation & Linking

### In the monorepo

```bash
# Build
pnpm agent:build

# Direct usage
pnpm agent:run "goal" "http://localhost:3000/api/data"
```

### Local linking (global usage)

```bash
# Build first
pnpm agent:build

# Link globally
pnpm agent:link

# Or manually
cd packages/agent
pnpm link --global

# Usage
x402-agent run "get resource" "http://localhost:3000/api/data"
# or
x402 run "get resource" "http://localhost:3000/api/data"
```

### Usage comme dépendance in another project

```bash
# In your project
pnpm add /path/to/HACKATHON_SOL/packages/agent

# Or via workspace
pnpm add @x402/agent@workspace:*
```

## 📝 Commands

### `agent run <goal> <url>`

Executes the autonomous AI agent with a goal and URL.

```bash
pnpm agent:run "summarize solana website" "http://localhost:3000/api/ai/summarize?url=https://solana.com"
```

**Flow:**
1. Plan: Analyzes the goal
2. Act: Fetch URL → If 402, decides according to policy → Pays → Waits for confirmation
3. Observe: Verifies the result (200 OK)

### `agent keygen`

Generates a new keypair for the agent.

```bash
pnpm agent:keygen
```

Stored in: `~/.x402-agent/keypair.json`

### `agent balance`

Displays wallet balance du wallet.

```bash
pnpm agent:balance
```

### `agent airdrop <amount>`

Requests a devnet airdrop.

```bash
pnpm agent:airdrop 0.1
```

### `agent fetch <url>` (legacy)

Direct fetch without goal (compatibility).

```bash
pnpm agent:fetch "http://localhost:3000/api/data"
```

## 🔧 Configuration

Environment variables (`.env` ou `packages/agent/.env`):

```bash
RPC_URL=https://api.devnet.solana.com
X402_HEADER=X-Payment

# Policy
AGENT_MAX_LAMPORTS_PER_TASK=500000
AGENT_WHITELIST_HOSTS=localhost:3000

# Optional: LLM (OpenAI or Local)
OPENAI_API_KEY=
AGENT_MODEL=gpt-4o-mini

# Local LLM (recommended for development)
USE_LOCAL_LLM=true
LLM_LOCAL_URL=http://127.0.0.1:1234
AGENT_MODEL=qwen/qwen3-coder-30b  # or autre modèle disponible
```

### Local LLM Configuration

The agent supports local LLMs compatible OpenAI API (e.g., LM Studio, Ollama, etc.):

1. **Start your local LLM** on `http://127.0.0.1:1234` (or other port)
2. **Load a model** in your LLM server
3. **Configure the agent**:
   ```bash
   export USE_LOCAL_LLM=true
   export LLM_LOCAL_URL=http://127.0.0.1:1234
   export AGENT_MODEL=<model-name>
   ```

The agent automatically detects available models if the specified model is not loaded.

## 🎯 Policy

The agent applies a strict policy:

- **Max budget**: `AGENT_MAX_LAMPORTS_PER_TASK` (default: 500000 lamports)
- **Whitelist hosts**: Only hosts in `AGENT_WHITELIST_HOSTS` are allowed

If a payment is denied by the policy, the agent stops with an error.

## 📦 Exports

The package exports reusable modules:

```typescript
import { runAgent } from '@x402/agent/agent';
import { fetchWithX402 } from '@x402/agent/tools';
import { shouldPay, loadPolicyConfig } from '@x402/agent/policy';
```

## 🧪 Tests

```bash
pnpm --filter @x402/agent test
```

## 📚 Examples

### Example 1: Simple resource

```bash
pnpm agent:run "get protected resource" "http://localhost:3000/api/data"
```

### Example 2: AI Summarize

```bash
pnpm agent:run "summarize solana website" \
  "http://localhost:3000/api/ai/summarize?url=https://solana.com"
```

### Example 3: Weather

```bash
pnpm agent:run "get Paris weather" \
  "http://localhost:3000/api/weather?city=Paris"
```

### Example 4: Crypto price

```bash
pnpm agent:run "get SOL price" \
  "http://localhost:3000/api/crypto?asset=SOL"
```

## 🔐 Security

- Keypair stored in plain text dans `~/.x402-agent/keypair.json` (POC)
- Policy budget + whitelist to limit risks
- See `SECURITY.md` for details

## 📝 Notes

- The agent works only on **Solana devnet** (POC)
- Requires a funded wallet to pay fees + amount
- Automatic retry on network error
- Structured logs with abbreviated txSig

