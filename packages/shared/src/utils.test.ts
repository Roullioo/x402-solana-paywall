import { describe, it, expect } from 'vitest';
import { generateUUID, base64Encode, base64Decode, addMinutes, sleep } from './utils.js';

describe('Utils', () => {
  it('generateUUID should return a valid UUID v4', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('base64Encode/Decode should work correctly', () => {
    const data = 'Hello, Solana!';
    const encoded = base64Encode(data);
    const decoded = base64Decode(encoded);
    expect(decoded).toBe(data);
  });

  it('addMinutes should add minutes correctly', () => {
    const date = new Date('2025-01-01T00:00:00.000Z');
    const result = addMinutes(date, 5);
    expect(result.toISOString()).toBe('2025-01-01T00:05:00.000Z');
  });

  it('sleep should wait for specified time', async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90); // Allow some variance
  });
});

