import { describe, it, expect, beforeEach } from 'vitest';
import { getStore, resetStore } from './store.js';
import { addMinutes } from '@x402/shared';

describe('Store - Clean Expired', () => {
  beforeEach(async () => {
    process.env.STORE_DRIVER = 'memory';
    resetStore();
  });

  it('should clean expired references', async () => {
    const store = await getStore();
    const now = new Date();
    const expired = addMinutes(now, -10);
    const valid = addMinutes(now, 10);

    await store.createRef('expired-1', 5000, expired.toISOString());
    await store.createRef('expired-2', 5000, expired.toISOString());
    await store.createRef('valid-1', 5000, valid.toISOString());

    const cleaned = await store.cleanExpired();

    expect(cleaned).toBe(2);

    const expired1 = await store.findByReference('expired-1');
    const expired2 = await store.findByReference('expired-2');
    const valid1 = await store.findByReference('valid-1');

    expect(expired1).toBeNull();
    expect(expired2).toBeNull();
    expect(valid1).not.toBeNull();
  });

  it('should not clean consumed references', async () => {
    const store = await getStore();
    const expired = addMinutes(new Date(), -10);

    await store.createRef('ref-1', 5000, expired.toISOString());
    await store.consumeRef('ref-1', 'tx-sig-1', 'payer-1', 5000);

    const cleaned = await store.cleanExpired();

    expect(cleaned).toBe(0);

    const ref = await store.findByReference('ref-1');
    expect(ref).not.toBeNull();
    expect(ref?.status).toBe('consumed');
  });

  it('should return all pending references', async () => {
    const store = await getStore();
    const now = new Date();
    const future1 = addMinutes(now, 5);
    const future2 = addMinutes(now, 10);

    await store.createRef('pending-1', 5000, future1.toISOString());
    await store.createRef('pending-2', 5000, future2.toISOString());
    await store.createRef('pending-3', 5000, future1.toISOString());
    await store.consumeRef('pending-3', 'tx-sig-3', 'payer-3', 5000);

    const pending = await store.getAllPending();

    expect(pending.length).toBe(2);
    expect(pending.every(r => r.status === 'pending')).toBe(true);
    expect(pending.some(r => r.reference === 'pending-1')).toBe(true);
    expect(pending.some(r => r.reference === 'pending-2')).toBe(true);
  });
});

