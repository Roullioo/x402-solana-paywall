import { describe, it, expect } from 'vitest';
import { shouldPay } from './policy.js';

describe('Policy', () => {
  it('should allow payment within budget and whitelist', () => {
    const decision = shouldPay('localhost:3000', 5000, {
      maxLamportsPerTask: 500000,
      whitelistHosts: ['localhost:3000'],
    });
    expect(decision.allow).toBe(true);
  });

  it('should deny payment exceeding budget', () => {
    const decision = shouldPay('localhost:3000', 600000, {
      maxLamportsPerTask: 500000,
      whitelistHosts: ['localhost:3000'],
    });
    expect(decision.allow).toBe(false);
    expect(decision.reason).toContain('exceeds max budget');
  });

  it('should deny payment to non-whitelisted host', () => {
    const decision = shouldPay('evil.com', 5000, {
      maxLamportsPerTask: 500000,
      whitelistHosts: ['localhost:3000'],
    });
    expect(decision.allow).toBe(false);
    expect(decision.reason).toContain('not in whitelist');
  });
});

