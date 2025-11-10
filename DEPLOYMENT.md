# x402 Solana Paywall Deployment

## 🚀 Deployment Options

### Option 1: Fly.io (Recommended)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy server
cd packages/server
flyctl launch --name x402-server --region cdg
flyctl secrets set RECEIVER_PUBKEY=<your_pubkey>
flyctl secrets set PRICE_LAMPORTS=5000
flyctl secrets set RPC_URL=https://api.devnet.solana.com
flyctl deploy

# Check health
curl https://x402-server.fly.dev/healthz
```

### Option 2: Render

1. Create an account sur [render.com](https://render.com)
2. New "Web Service"
3. Connect your GitHub repo GitHub
4. Configuration:
   - **Build Command:** `pnpm install && pnpm --filter @x402/server build`
   - **Start Command:** `cd packages/server && node dist/index.js`
   - **Environment Variables:**
     - `RECEIVER_PUBKEY`: Your receiver public key
     - `PRICE_LAMPORTS`: 5000
     - `RPC_URL`: https://api.devnet.solana.com
     - `STORE_DRIVER`: file
     - `STORE_FILE`: /data/store.json

### Option 3: Docker Local

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Check
curl http://localhost:3000/healthz
```

## 🔐 Required Environment Variables

### Server (required)
- `RECEIVER_PUBKEY`: Receiver public key (generate with `pnpm receiver:keygen`)
- `PRICE_LAMPORTS`: Price per request (default: 5000)
- `RPC_URL`: Solana RPC URL (default: devnet)

### Server (optional)
- `OPENAI_API_KEY`: For real AI API
- `OPENWEATHER_API_KEY`: For real weather API
- `STORE_DRIVER`: `file` ou `memory` (default: file)
- `STORE_FILE`: Store file path (default: ./data/store.json)

### Agent
- `AGENT_MAX_LAMPORTS_PER_TASK`: Max budget (default: 500000)
- `AGENT_WHITELIST_HOSTS`: Allowed hosts (default: localhost:3000)
- `OPENAI_API_KEY`: For LLM reasoning (optional)

## 📊 Healthcheck

All deployments expose `/healthz`:

```bash
curl https://your-deployment.com/healthz
# → {"ok":true}
```

## 🔄 Update

```bash
# Fly.io
flyctl deploy

# Render
git push origin main  # Auto-deploy

# Docker
docker-compose down
docker-compose build
docker-compose up -d
```

## 📝 Logs

```bash
# Fly.io
flyctl logs

# Render
# # Via dashboard

# Docker
docker-compose logs -f server
```

## ⚠️  Production Limitations

- **Devnet only**: Do not use in mainnet production without audit
- **Unencrypted keys**: Use secrets management (Vault, AWS KMS)
- **Rate limiting**: Add rate limiting per IP
- **Monitoring**: Add Sentry, DataDog, etc.
- **Backup**: Configure automatic store backup

