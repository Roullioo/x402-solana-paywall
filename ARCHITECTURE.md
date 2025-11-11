# x402 Solana Paywall Architecture

## Overview

This project implements an **HTTP 402 paywall** (Payment Required) on the Solana devnet blockchain. The complete flow is fully autonomous: a CLI agent detects the 402, pays on-chain, waits for confirmation, and refetches with a payment header.

## Flow Diagram

```
┌─────────────┐                 ┌──────────────┐                 ┌─────────────┐
│   Client    │                 │   Server      │                 │   Solana    │
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
       │                               │  10. transaction data         │
       │                               │<────────────────────────────────│
       │                               │                                │
       │                               │  11. Verifications:            │
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

**Responsibilities:**
- Exposes HTTP endpoints (Fastify)
- Generates PaymentRequirements (402) with unique reference UUID
- Verifies on-chain payments (receiver, amount, memo/reference)
- Manages idempotence/anti-replay (SQLite)

**Stack:**
- Fastify (HTTP)
- @solana/web3.js (RPC)
- better-sqlite3 (DB)
- Zod (validation)

**Database:**

Table `payments`:
```sql
CREATE TABLE payments (
  reference TEXT PRIMARY KEY,        -- Unique UUID v4
  txSig TEXT,                        -- Transaction signature
  amount INTEGER NOT NULL,           -- Amount in lamports
  payer TEXT,                        -- Payer public key
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'consumed'
  expiresAt TEXT NOT NULL,           -- ISO datetime
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  consumedAt TEXT                    -- ISO datetime when consumed
);
CREATE INDEX idx_txSig ON payments(txSig);
CREATE INDEX idx_status ON payments(status);
```

**Endpoints:**

| Method | Path          | Description                          |
|--------|---------------|--------------------------------------|
| GET    | /healthz      | Health check                        |
| GET    | /api/data     | Protected resource (402 or 200)      |
| POST   | /api/verify   | Manual payment verification         |

**On-chain verification:**
1. `getTransaction(txSig)` with commitment `confirmed`
2. Verify `tx.meta.err === null` (success)
3. Verify receiver is in accountKeys
4. Calculate `postBalance - preBalance` for receiver
5. Verify `amount === PRICE_LAMPORTS` (exact)
6. Find Memo instruction containing `reference`
7. Verify idempotence: `status === 'pending'` in DB
8. Verify global anti-replay: `txSig` not used elsewhere
9. Mark as `consumed` in DB

### 2. Packages/Agent (CLI)

**Responsibilities:**
- Wallet management (~/.x402-agent/keypair.json)
- 402 detection and PaymentRequirements parsing
- Send SOL payment + Memo(reference)
- Wait for on-chain confirmation
- Refetch with X-Payment header

**Stack:**
- Commander (CLI)
- @solana/web3.js
- @x402/shared (types)

**Commands:**

| Command                   | Description                         |
|---------------------------|-------------------------------------|
| `keygen`                  | Generate keypair                    |
| `balance`                 | Display balance                     |
| `airdrop <sol>`           | Devnet airdrop                      |
| `pay <receiver> <lamports>` | Manual payment with memo           |
| `fetch <url>`             | Fetch resource with paywall        |

**Flow `fetch <url>`:**
1. `GET <url>` without header
2. If 402: parse `PaymentRequirements`
3. `sendPaymentWithMemo(receiver, amountLamports, reference)`
   - Transaction = SystemProgram.transfer + Memo(reference)
4. `waitForConfirmation(txSig)` (polling `getSignatureStatuses`)
5. `GET <url>` with header `X-Payment: base64(JSON { txSig, reference })`
6. Display response (200)

### 3. Packages/Shared

**Exports:**
- Zod schemas: `PaymentRequirementsSchema`, `X402HeaderPayloadSchema`, etc.
- Utils: `generateUUID()`, `base64Encode()`, `base64Decode()`, `withRetry()`, `sleep()`

### 4. Apps/Web (Next.js)

**Responsibilities:**
- Demo interface
- "Request resource" button → fetch API
- Display PaymentRequirements if 402
- "Copy agent command" button to facilitate testing

**Stack:**
- Next.js 14 (App Router)
- Tailwind CSS
- @x402/shared (types)

## Security

### Applied Verifications

| Verification           | Implementation                                      |
|------------------------|-----------------------------------------------------|
| Correct receiver        | `accountKeys.includes(receiverPubkey)`             |
| Exact amount           | `postBalance - preBalance === PRICE_LAMPORTS`      |
| Memo/reference         | Find Memo instruction containing `reference`      |
| Finality               | `commitment: 'confirmed'`                          |
| Idempotence            | `status === 'pending'` in DB                        |
| Global anti-replay     | `txSig` not present elsewhere in DB                |
| Expiration             | `expiresAt` verified (optional, manual cleanup)    |

### Known Limitations (POC)

- **Unencrypted keys**: keypairs in plain JSON
- **No rate limiting**: 402 spam possible
- **Local SQLite**: No HA, no auto backup
- **SPL token not implemented**: Native SOL only
- **No auto cleanup**: Expired references remain in DB
- **Devnet only**: Never use in production without audit

## Performance

**Goal:** 402 → pay → 200 loop < 3 seconds on devnet

**Optimizations:**
- Retry with exponential backoff (`withRetry`)
- Polling `getSignatureStatuses` every 1s (timeout 30s)
- Commitment `confirmed` (faster than `finalized`)

**Expected E2E metrics:**
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
│ txSig         │ "2ZE7R..." (or NULL if pending)            │
│ amount        │ 5000 (lamports)                             │
│ payer         │ "Abc123..." (or NULL if pending)            │
│ status        │ "pending" | "consumed"                      │
│ expiresAt     │ "2025-11-05T12:05:00.000Z"                  │
│ createdAt     │ "2025-11-05T12:00:00.000Z"                  │
│ consumedAt    │ "2025-11-05T12:00:15.000Z" (or NULL)        │
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
