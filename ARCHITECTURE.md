# x402 Solana Paywall Architecture

## Overview

This project implements an **HTTP 402 paywall** (Payment Required) on the Solana devnet blockchain. The complete flow is fully autonomous: a CLI agent detects the 402, pays on-chain, waits for confirmation, and refetches with a payment header.

## Flow Diagram

```
┌─────────────┐                 ┌──────────────┐                 ┌─────────────┐
│   Client    │                 │   Serveur    │                 │   Solana    │
│   (Agent)   │                 │   (Fastify)  │                 │   Devnet    │
└──────┬──────┘                 └──────┬───────┘                 └──────┬──────┘
       │                               │                                │
       │  1. GET /api/data             │                                │
       │──────────────────────────────>│                                │
       │                               │                                │
       │  2. 402 PaymentRequirements   │                                │
       │<──────────────────────────────│                                │
       │  {                            │                                │
       │    amountLamports: 5000,      │  3. createPaymentRequirement   │
       │    receiver: "Abc...",        │     (SQLite: reference UUID)   │
       │    reference: "uuid-v4",      │                                │
       │    expiresAt: "..."           │                                │
       │  }                            │                                │
       │                               │                                │
       │  4. SystemProgram.transfer    │                                │
       │     + Memo(reference)         │                                │
       │───────────────────────────────────────────────────────────────>│
       │                               │                                │
       │  5. txSig                     │                                │
       │<───────────────────────────────────────────────────────────────│
       │                               │                                │
       │  6. waitForConfirmation       │                                │
       │───────────────────────────────────────────────────────────────>│
       │     (getSignatureStatuses)    │                                │
       │                               │                                │
       │  7. confirmed                 │                                │
       │<───────────────────────────────────────────────────────────────│
       │                               │                                │
       │  8. GET /api/data             │                                │
       │     + header X-Payment        │                                │
       │     (base64 JSON)             │                                │
       │──────────────────────────────>│                                │
       │                               │                                │
       │                               │  9. verifyPayment              │
       │                               │────────────────────────────────>│
       │                               │     (getTransaction)           │
       │                               │                                │
       │                               │  10. transaction data          │
       │                               │<────────────────────────────────│
       │                               │                                │
       │                               │  11. Vérifications:            │
       │                               │      - receiver OK?            │
       │                               │      - amount exact?           │
       │                               │      - memo/reference OK?      │
       │                               │      - idempotence OK?         │
       │                               │      - anti-replay OK?         │
       │                               │                                │
       │                               │  12. consumePayment            │
       │                               │      (mark as consumed)        │
       │                               │                                │
       │  13. 200 OK + resource        │                                │
       │<──────────────────────────────│                                │
       │  {                            │                                │
       │    data: "Secret...",         │                                │
       │    paid: true,                │                                │
       │    reference: "uuid-v4",      │                                │
       │    txSig: "signature..."      │                                │
       │  }                            │                                │
       │                               │                                │
```

## Components

### 1. Packages/Server (API)

**Responsabilités:**
- Exposes HTTP endpoints HTTP (Fastify)
- Generates PaymentRequirements (402) avec reference UUID unique
- Verifies on-chain payments on-chain (receiver, amount, memo/reference)
- Manages idempotence/anti-replay (SQLite)

**Stack:**
- Fastify (HTTP)
- @solana/web3.js (RPC)
- better-sqlite3 (DB)
- Zod (validation)

**Base de données:**

Table `payments`:
```sql
CREATE TABLE payments (
  reference TEXT PRIMARY KEY,        -- UUID v4 unique
  txSig TEXT,                        -- Signature de transaction
  amount INTEGER NOT NULL,           -- Montant en lamports
  payer TEXT,                        -- Public key du payeur
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'consumed'
  expiresAt TEXT NOT NULL,           -- ISO datetime
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  consumedAt TEXT                    -- ISO datetime quand consommé
);
CREATE INDEX idx_txSig ON payments(txSig);
CREATE INDEX idx_status ON payments(status);
```

**Endpoints:**

| Method | Path          | Description                          |
|--------|---------------|--------------------------------------|
| GET    | /healthz      | Health check                        |
| GET    | /api/data     | Protected resource (402 ou 200)     |
| POST   | /api/verify   | Manual payment verification d'un paiement |

**Vérification on-chain:**
1. `getTransaction(txSig)` avec commitment `confirmed`
2. Vérifier `tx.meta.err === null` (succès)
3. Vérifier que receiver est dans accountKeys
4. Calculer `postBalance - preBalance` pour receiver
5. Vérifier `amount === PRICE_LAMPORTS` (exact)
6. Chercher instruction Memo contenant `reference`
7. Vérifier idempotence: `status === 'pending'` dans DB
8. Vérifier anti-replay global: `txSig` non utilisé ailleurs
9. Marquer comme `consumed` dans DB

### 2. Packages/Agent (CLI)

**Responsabilités:**
- Wallet management (~/.x402-agent/keypair.json)
- 402 detection et parsing PaymentRequirements
- Send SOL payment SOL + Memo(reference)
- Wait for on-chain confirmation on-chain
- Refetch with X-Payment header X-Payment

**Stack:**
- Commander (CLI)
- @solana/web3.js
- @x402/shared (types)

**Commandes:**

| Commande                   | Description                         |
|----------------------------|-------------------------------------|
| `keygen`                   | Generate keypair                      |
| `balance`                  | Display balance                       |
| `airdrop <sol>`            | Devnet airdrop                      |
| `pay <receiver> <lamports>` | Manual payment avec memo          |
| `fetch <url>`              | Fetch resource avec paywall       |

**Flow `fetch <url>`:**
1. `GET <url>` sans header
2. Si 402: parse `PaymentRequirements`
3. `sendPaymentWithMemo(receiver, amountLamports, reference)`
   - Transaction = SystemProgram.transfer + Memo(reference)
4. `waitForConfirmation(txSig)` (polling `getSignatureStatuses`)
5. `GET <url>` avec header `X-Payment: base64(JSON { txSig, reference })`
6. Afficher response (200)

### 3. Packages/Shared

**Exports:**
- Schemas Zod: `PaymentRequirementsSchema`, `X402HeaderPayloadSchema`, etc.
- Utils: `generateUUID()`, `base64Encode()`, `base64Decode()`, `withRetry()`, `sleep()`

### 4. Apps/Web (Next.js)

**Responsabilités:**
- Demo interface
- "Request resource" button la ressource" → fetch API
- Display PaymentRequirements si 402
- "Copy agent command" button commande agent" to facilitate testing

**Stack:**
- Next.js 14 (App Router)
- Tailwind CSS
- @x402/shared (types)

## Security

### Applied Verifications

| Vérification           | Implémentation                                      |
|------------------------|-----------------------------------------------------|
| Correct receiver       | `accountKeys.includes(receiverPubkey)`             |
| Exact amount           | `postBalance - preBalance === PRICE_LAMPORTS`      |
| Memo/reference         | Chercher instruction Memo contenant `reference`    |
| Finality               | `commitment: 'confirmed'`                          |
| Idempotence            | `status === 'pending'` dans DB                     |
| Global anti-replay     | `txSig` non présent ailleurs dans DB               |
| Expiration             | `expiresAt` vérifié (optionnel, nettoyage manuel)  |

### Known Limitations (POC)

- **Unencrypted keys**: keypairs en JSON clair
- **No rate limiting**: Spam de 402 possible
- **Local SQLite**: No HA, no auto backup
- **SPL token not implemented**: Native SOL only
- **No auto cleanup**: Expired references remain en DB
- **Devnet only**: Never use in production without audit

## Performance

**Objectif:** 402 loop → pay → 200 < 3 seconds on devnet

**Optimisations:**
- Retry with exponential backoff (`withRetry`)
- Polling `getSignatureStatuses` every 1s (timeout 30s)
- Commitment `confirmed` (faster than `finalized`)

**Métriques E2E attendues:**
- Initial GET (402): ~200ms
- Payment + confirmation: ~2-3s (depends on devnet)
- GET with header (200): ~200ms
- **Total:** ~3-4s

## Data Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       SQLite Database                        │
├─────────────────────────────────────────────────────────────┤
│                      TABLE payments                          │
├───────────────┬─────────────────────────────────────────────┤
│ reference     │ "550e8400-e29b-41d4-a716-446655440000"      │
│ txSig         │ "2ZE7R..." (ou NULL si pending)             │
│ amount        │ 5000 (lamports)                             │
│ payer         │ "Abc123..." (ou NULL si pending)            │
│ status        │ "pending" | "consumed"                      │
│ expiresAt     │ "2025-11-05T12:05:00.000Z"                  │
│ createdAt     │ "2025-11-05T12:00:00.000Z"                  │
│ consumedAt    │ "2025-11-05T12:00:15.000Z" (ou NULL)        │
└───────────────┴─────────────────────────────────────────────┘
```

## Possible Extensions (out of MVP scope)

- [ ] SPL token support (mint, tokenAccount, getTokenAccountBalance)
- [ ] Webhook after confirmed payment
- [ ] Admin dashboard to view payments
- [ ] Rate limiting per IP
- [ ] Auto cleanup of expired references (cron)
- [ ] Multi-tenant (multiple receivers)
- [ ] Mainnet-beta support (with complete audit)
- [ ] Keypair encryption (argon2, scrypt)
- [ ] Solana Pay integration (QR codes)
- [ ] Partial payment support (payment by installments)

---

**Version:** 1.0.0  
**Date:** 2025-11-05

