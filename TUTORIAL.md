# x402 Solana Paywall - Installation & Usage Tutorial

## Devnet vs Mainnet

**Yes, the system works on both devnet and mainnet!**

### Automatic Network Detection

The system automatically detects the network from the `RPC_URL`:
- `https://api.devnet.solana.com` → `devnet`
- `https://api.mainnet-beta.solana.com` → `mainnet-beta`
- Custom RPC URLs are detected by checking for "devnet" or "mainnet" in the URL

### Configuration

**For Devnet (Testing):**
```bash
# packages/server/.env
RPC_URL=https://api.devnet.solana.com
# or use a custom devnet RPC
RPC_URL=https://your-devnet-rpc.com
```

**For Mainnet (Production):**
```bash
# packages/server/.env
RPC_URL=https://api.mainnet-beta.solana.com
# or use a custom mainnet RPC (recommended for production)
RPC_URL=https://your-mainnet-rpc.com
```

**Important Notes:**
- ⚠️ **Mainnet uses real SOL** - transactions cost real money
- ✅ **Devnet uses fake SOL** - free for testing
- 🔒 Use a dedicated receiver wallet for mainnet (separate from devnet)
- 📊 Consider using a custom RPC provider (Helius, QuickNode, etc.) for better performance

### Agent Configuration

The agent uses the same `RPC_URL` configuration:

```bash
# packages/agent/.env
RPC_URL=https://api.devnet.solana.com  # For testing
# or
RPC_URL=https://api.mainnet-beta.solana.com  # For production
```

**Important:** The agent and server must use the **same network** (devnet or mainnet) for payments to work.

---

## Server Installation

### Prerequisites
- Node.js LTS >= 20
- pnpm (package manager)
- A Solana wallet (for receiving payments)

### Step 1: Clone and Install

```bash
cd /path/to/project
pnpm install
```

### Step 2: Generate Receiver Keypair

The receiver is the wallet that will receive payments from agents.

```bash
cd packages/server
pnpm receiver:keygen
```

This will:
- Generate `receiver-keypair.json` in `packages/server/`
- Display the public key (e.g., `HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8`)

**⚠️ Important**: Keep `receiver-keypair.json` secure! Never commit it to version control.

### Step 3: Configure Environment

Create `packages/server/.env`:

```bash
# Solana RPC endpoint
RPC_URL=https://api.devnet.solana.com

# Receiver public key (from step 2)
RECEIVER_PUBKEY=HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8

# Price per request (in lamports, 1 SOL = 1e9 lamports)
PRICE_LAMPORTS=5000

# X402 header name (default: X-Payment)
X402_HEADER=X-Payment

# Storage (file-based or memory)
STORE_DRIVER=file
STORE_FILE=./data/store.json

# Optional: API keys for external services
OPENAI_API_KEY=sk-...
OPENWEATHER_API_KEY=...
```

### Step 4: Start the Server

```bash
# From project root
pnpm server:dev

# Or from packages/server
cd packages/server
pnpm dev
```

The server will start on `http://localhost:3000` by default.

### Step 5: Verify Server is Running

```bash
curl http://localhost:3000/healthz
```

Expected response:
```json
{"status":"ok"}
```

---

## Client API Usage

### Overview

The x402 protocol works as follows:

1. **Client requests resource** → Server responds with `402 Payment Required` + `PaymentRequirements`
2. **Client pays** → Sends SOL transaction with memo containing the reference
3. **Client re-requests with header** → Server verifies payment and returns `200 OK` + resource

### Endpoints

#### Available APIs

1. **Main Protected Resource**: `GET /api/data`
   - This is the primary x402-protected endpoint
   - Returns `402 Payment Required` without payment
   - Returns resource data after successful payment verification

2. **Demo Endpoints** (examples only, require external API keys):
   - `GET /api/ai/summarize?url=<url>` - AI summarization (requires `OPENAI_API_KEY`)
   - `GET /api/weather?city=<city>` - Weather data (requires `OPENWEATHER_API_KEY`)
   - `GET /api/crypto?asset=<asset>` - Crypto prices (uses CoinGecko API, may be rate-limited)

3. **Free Demo Endpoint** (no payment required):
   - `GET /api/demo/sol-price` - SOL price from CoinGecko (for demo purposes)

**Note:** The demo endpoints (`/api/ai/*`, `/api/weather`, `/api/crypto`) are provided as examples of how to protect any API with the x402 paywall. The main endpoint `/api/data` is the core implementation.

---

## Examples

### Example 1: JavaScript/TypeScript Client

```typescript
const API_BASE = 'http://localhost:3000';

async function fetchWithPayment(endpoint: string) {
  // Step 1: Initial request (will get 402)
  const response1 = await fetch(`${API_BASE}${endpoint}`);
  
  if (response1.status !== 402) {
    // Resource is free or error
    return await response1.json();
  }
  
  // Step 2: Parse PaymentRequirements
  const requirements = await response1.json();
  console.log('Payment required:', requirements);
  /*
  {
    amountLamports: 5000,
    receiver: "HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8",
    reference: "f78bcc22-0873-46b0-9f39-95e984cb92a0",
    network: "devnet",
    mint: null,
    expiresAt: "2025-11-06T01:00:00.000Z"
  }
  */
  
  // Step 3: Send payment (using Solana web3.js)
  const { sendPaymentWithMemo, waitForConfirmation } = await import('./solana-payment.js');
  const txSig = await sendPaymentWithMemo(
    wallet, // Your wallet Keypair
    requirements.receiver,
    requirements.amountLamports,
    requirements.reference
  );
  
  // Step 4: Wait for confirmation
  await waitForConfirmation(txSig);
  
  // Step 5: Re-request with X-Payment header
  const headerPayload = JSON.stringify({
    txSig,
    reference: requirements.reference,
  });
  const headerValue = btoa(headerPayload); // base64 encode
  
  const response2 = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'X-Payment': headerValue,
    },
  });
  
  if (response2.ok) {
    const data = await response2.json();
    console.log('Resource received:', data);
    return data;
  } else {
    throw new Error(`Payment verification failed: ${response2.statusText}`);
  }
}

// Usage
const data = await fetchWithPayment('/api/data');
```

### Example 2: Using the Agent CLI

The easiest way to interact with x402 APIs is using the built-in agent CLI. This section provides a complete guide on how to make requests using the CLI.

#### Step 1: Setup the Agent Wallet

First, you need to generate a wallet for the agent and fund it:

```bash
# Generate a new keypair for the agent
pnpm agent:keygen

# Output:
# [x402] Keypair generated!
# [x402] Public Key: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

# Check your balance
pnpm agent:balance

# Output:
# [x402] Balance: 0 SOL
# [x402] Public Key: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

# Request airdrop on devnet (free SOL for testing)
pnpm agent:airdrop 0.1

# Output:
# [x402] Requesting airdrop of 0.1 SOL...
# [x402] Airdrop successful!
# [x402] Signature: 5j7xK...
# [x402] New balance: 0.1 SOL
```

**Note:** Airdrops only work on devnet. For mainnet, you need to transfer SOL from another wallet.

#### Step 2: Configure the Agent

Create or edit `packages/agent/.env`:

```bash
# Solana RPC endpoint (must match server network)
RPC_URL=https://api.devnet.solana.com

# X402 header name (default: X-Payment)
X402_HEADER=X-Payment

# Policy configuration
AGENT_MAX_LAMPORTS_PER_TASK=500000  # Max budget per request
AGENT_WHITELIST_HOSTS=localhost:3000  # Allowed hosts

# Optional: LLM for payment justification
OPENAI_API_KEY=sk-...  # Or use local LLM
USE_LOCAL_LLM=true
LLM_LOCAL_URL=http://127.0.0.1:1234
AGENT_MODEL=qwen/qwen3-coder-30b
```

#### Step 3: Make Requests with the CLI

The agent CLI provides two main commands for making requests:

##### Option A: Using `agent:run` (Recommended - with AI agent)

The `run` command uses the autonomous AI agent with policy checks and optional LLM justification:

```bash
# Basic usage
pnpm agent:run "get protected resource" "http://localhost:3000/api/data"

# Example output:
# [x402] Agent starting task: "get protected resource"
# [x402] Target: http://localhost:3000/api/data
# [x402] Wallet: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
# [x402] Policy loaded
# [x402] Max budget: 500000 lamports
# [x402] Whitelist: localhost:3000
# [x402] PLAN: Fetch resource at http://localhost:3000/api/data
# [x402] ACT: Executing fetch...
# [x402] Status 402 - Payment required
# [x402] Payment Requirements:
# [x402] Amount: 5000 lamports
# [x402] Receiver: HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8
# [x402] Reference: 550e8400-e29b-41d4-a716-446655440000
# [x402] Network: devnet
# [x402] Policy loaded - Checking authorization...
# [x402] Payment authorized by policy
# [x402] Sending payment...
# [x402] Payment sent!
# [x402] Signature: 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy
# [x402] Waiting for confirmation...
# [x402] Transaction confirmed!
# [x402] Re-fetching with X-Payment header...
# [x402] Status: 200
# [x402] Response: {"data":"Secret resource for paid users","paid":true,"reference":"550e8400-e29b-41d4-a716-446655440000","txSig":"3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"}
# [x402] OBSERVE: Task completed
# [x402] Status: 200
# [x402] Paid: true
# [x402] TxSig: 3J98t1W...
```

**More examples:**

```bash
# Get protected data (main endpoint)
pnpm agent:run "get protected data" "http://localhost:3000/api/data"

# Note: The following endpoints are demo examples only and require external API keys:
# - /api/weather?city=Paris (requires OPENWEATHER_API_KEY)
# - /api/ai/summarize?url=... (requires OPENAI_API_KEY)
# - /api/crypto?asset=SOL (uses CoinGecko API, may be rate-limited)
```

##### Option B: Using `agent:fetch` (Simple - without AI agent)

The `fetch` command is simpler and doesn't use policy checks or LLM. It directly handles the payment flow:

```bash
# Basic usage
pnpm agent:fetch "http://localhost:3000/api/data"

# Example output:
# [x402] Fetch: http://localhost:3000/api/data
# [x402] Status 402 - Payment required
# [x402] Payment Requirements:
# [x402] Amount: 5000 lamports
# [x402] Receiver: HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8
# [x402] Reference: 550e8400-e29b-41d4-a716-446655440000
# [x402] Network: devnet
# [x402] Sending payment...
# [x402] Payment sent!
# [x402] Signature: 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy
# [x402] Waiting for confirmation...
# [x402] Transaction confirmed!
# [x402] Re-fetching with X-Payment header...
# [x402] Status: 200
# [x402] Response: {"data":"Secret resource for paid users","paid":true,"reference":"550e8400-e29b-41d4-a716-446655440000","txSig":"3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"}
```

**When to use `fetch` vs `run`:**
- Use `run` when you want policy checks, budget limits, and LLM justification
- Use `fetch` for simple, direct requests without policy validation

#### Step 4: Manual Payment (Optional)

You can also send payments manually using the `pay` command:

```bash
# Send payment with memo
pnpm agent:pay HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8 5000 --reference "550e8400-e29b-41d4-a716-446655440000"

# Output:
# [x402] Sending 5000 lamports to HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8...
# [x402] Memo: 550e8400-e29b-41d4-a716-446655440000
# [x402] Payment sent!
# [x402] Signature: 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy
```

#### Complete Example: Full Workflow

Here's a complete example showing the full workflow:

```bash
# 1. Start the server (in another terminal)
cd packages/server
pnpm dev
# Server running on http://localhost:3000

# 2. Setup agent wallet
pnpm agent:keygen
pnpm agent:airdrop 0.1

# 3. Check balance
pnpm agent:balance
# [x402] Balance: 0.1 SOL

# 4. Make a request
pnpm agent:run "get protected data" "http://localhost:3000/api/data"

# 5. Check balance again (should be slightly less due to fees)
pnpm agent:balance
# [x402] Balance: 0.099995 SOL
```

#### Troubleshooting CLI Requests

**Error: "Payment denied by policy"**
- Check that the host is in `AGENT_WHITELIST_HOSTS`
- Verify the amount is within `AGENT_MAX_LAMPORTS_PER_TASK`

**Error: "Insufficient funds"**
- Check balance: `pnpm agent:balance`
- Request airdrop: `pnpm agent:airdrop 0.1` (devnet only)
- For mainnet, transfer SOL from another wallet

**Error: "Network mismatch"**
- Ensure `RPC_URL` in agent config matches server config
- Both must be on devnet or both on mainnet

**Error: "Transaction failed"**
- Check Solana network status
- Verify RPC endpoint is accessible
- Check transaction on Solana Explorer using the txSig

### Example 3: cURL (Manual)

```bash
# Step 1: Get payment requirements
curl -i http://localhost:3000/api/data
# Response: 402 Payment Required
# Body: {"amountLamports":5000,"receiver":"...","reference":"...","network":"devnet","mint":null,"expiresAt":"..."}

# Step 2: Pay via Solana CLI (or your wallet)
# ... send SOL transaction with memo=reference ...

# Step 3: Re-request with header
REFERENCE="f78bcc22-0873-46b0-9f39-95e984cb92a0"
TX_SIG="5j7xK..."
HEADER_VALUE=$(echo -n "{\"txSig\":\"$TX_SIG\",\"reference\":\"$REFERENCE\"}" | base64)

curl -H "X-Payment: $HEADER_VALUE" http://localhost:3000/api/data
# Response: 200 OK
# Body: {"data":"Secret resource for paid users","paid":true,"reference":"...","txSig":"..."}
```

### Example 4: Python Client

```python
import requests
import base64
import json
from solders.keypair import Keypair
from solders.transaction import Transaction
from solders.system_program import transfer, TransferParams
from solders.rpc.api import Client
from solders.pubkey import Pubkey

API_BASE = "http://localhost:3000"

def fetch_with_payment(endpoint: str, wallet: Keypair):
    # Step 1: Initial request
    response = requests.get(f"{API_BASE}{endpoint}")
    
    if response.status_code != 402:
        return response.json()
    
    # Step 2: Parse requirements
    requirements = response.json()
    print(f"Payment required: {requirements['amountLamports']} lamports")
    
    # Step 3: Send payment (using solders)
    # ... implement payment logic ...
    
    # Step 4: Re-request with header
    header_payload = json.dumps({
        "txSig": tx_sig,
        "reference": requirements["reference"],
    })
    header_value = base64.b64encode(header_payload.encode()).decode()
    
    response2 = requests.get(
        f"{API_BASE}{endpoint}",
        headers={"X-Payment": header_value}
    )
    
    return response2.json()
```

### Example 5: React/Next.js Client

```typescript
'use client';

import { useState } from 'react';

export default function X402Client() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  
  const fetchResource = async () => {
    setLoading(true);
    
    try {
      // Step 1: Get 402
      const res1 = await fetch('http://localhost:3000/api/data');
      
      if (res1.status !== 402) {
        setData(await res1.json());
        return;
      }
      
      const requirements = await res1.json();
      
      // Step 2: Pay (you would integrate with your Solana wallet here)
      // For example, using @solana/wallet-adapter-react
      const txSig = await payWithWallet(requirements);
      
      // Step 3: Re-fetch with header
      const headerPayload = JSON.stringify({
        txSig,
        reference: requirements.reference,
      });
      const headerValue = btoa(headerPayload);
      
      const res2 = await fetch('http://localhost:3000/api/data', {
        headers: {
          'X-Payment': headerValue,
        },
      });
      
      if (res2.ok) {
        setData(await res2.json());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={fetchResource} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Resource'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

---

## Payment Flow Diagram

```
┌─────────┐                    ┌─────────┐
│ Client  │                    │ Server  │
└────┬────┘                    └────┬────┘
     │                              │
     │  1. GET /api/data            │
     ├─────────────────────────────>│
     │                              │
     │  2. 402 Payment Required     │
     │  {amount, receiver, ref}     │
     │<─────────────────────────────┤
     │                              │
     │  3. Send SOL + Memo(ref)     │
     │  (on Solana blockchain)      │
     │                              │
     │  4. GET /api/data            │
     │  Header: X-Payment           │
     ├─────────────────────────────>│
     │                              │
     │  5. Verify on-chain          │
     │                              │
     │  6. 200 OK + Resource        │
     │<─────────────────────────────┤
     │                              │
```

---

## Troubleshooting

### Server won't start
- Check that `RECEIVER_PUBKEY` is set in `.env`
- Verify port 3000 is not in use
- Check logs for errors

### Payment verification fails
- Ensure transaction is confirmed on-chain
- Verify the memo contains the exact reference UUID
- Check that payment amount matches (or exceeds for rent exemption)
- Verify receiver address is correct

### 402 after payment
- Each click generates a new reference
- Use the agent CLI or store the reference for re-use
- Payment is tied to a specific reference UUID

---

## Next Steps

- Read `README.md` for full project documentation
- Check `ARCHITECTURE.md` for technical details
- See `AGENT_EXPLICATION.md` for agent usage
- Review `PAIEMENT_EXPLICATION.md` for payment flow details

---

## Support

For issues or questions:
- Check existing documentation files
- Review code comments
- Open an issue on GitHub (if applicable)

