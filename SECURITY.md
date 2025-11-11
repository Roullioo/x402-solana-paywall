# Security - x402 Solana Paywall

## 🔐 Secret Management

### ⚠️  NEVER commit
- Private keys (receiver-keypair.json, ~/.x402-agent/keypair.json)
- API keys (OPENAI_API_KEY, OPENWEATHER_API_KEY)
- `.env` files

### ✅ Best Practices
- Use `.env.example` as template
- Store secrets in dedicated services (Vault, AWS Secrets Manager)
- Regular key rotation
- Encrypt keypairs at rest

## 🛡️  Agent Policy

### Budget Control
```bash
AGENT_MAX_LAMPORTS_PER_TASK=500000  # Max 0.0005 SOL per task
```

### Whitelist Hosts
```bash
AGENT_WHITELIST_HOSTS=localhost:3000,api.trusted.com
```

**Why?**
- Prevents agent from paying unauthorized services
- Limits losses in case of compromise
- Audit trail of contacted hosts

## 🔒 On-Chain Verifications

### Implemented ✅
1. **Exact receiver**: Verifies recipient is RECEIVER_PUBKEY
2. **Exact amount**: Verifies amount is PRICE_LAMPORTS (not more, not less)
3. **Memo/Reference**: Verifies memo contains reference UUID
4. **Finality**: Minimum `confirmed` commitment
5. **Idempotence**: A reference can only be consumed once
6. **Anti-replay**: A txSig can only be used once

### Not Implemented ⚠️  (POC)
- Automatic reference expiration
- Rate limiting per IP
- Multi-factor authentication
- Persistent audit logs
- Real-time monitoring

## 🚨 Known Risks (POC)

### Critical
1. **Unencrypted keys**: Keypairs stored unencrypted
2. **No rate limiting**: Vulnerable to spam
3. **Devnet only**: Do not use on mainnet without audit

### Medium
1. **File-based store**: No replication, no automatic backup
2. **No automatic expiration**: Expired references remain in DB
3. **Non-persistent logs**: No long-term audit trail

### Low
1. **SPL token not supported**: Native SOL only
2. **No multi-sig**: Single-key receiver
3. **No monitoring**: No alerts on anomalies

## 🔧 Production Recommendations

### Immediate
- [ ] Encrypt keypairs (argon2, scrypt)
- [ ] Add rate limiting (express-rate-limit)
- [ ] Configure monitoring (Sentry, DataDog)
- [ ] Automatic store backup

### Short Term
- [ ] Complete security audit
- [ ] Penetration testing
- [ ] Multi-sig for receiver
- [ ] Automatic reference expiration

### Long Term
- [ ] Migration to hardware wallet (Ledger)
- [ ] On-chain reputation system
- [ ] Loss insurance
- [ ] Regulatory compliance

## 📞 Reporting

To report a vulnerability:
- Telegram: @Roullio
- PGP: [public key]
- Bug bounty: [program]

**Response time:** 48 hours
**Patch time:** 7 days (critical), 30 days (medium)

---

**⚠️  DISCLAIMER**: This project is a POC for hackathon. Do not use in production without a complete security audit.

