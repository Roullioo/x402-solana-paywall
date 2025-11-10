import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withRetry } from '@x402/shared';

describe('Pay - Retry Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have withRetry function available', () => {
    expect(typeof withRetry).toBe('function');
  });

  it('should retry on failure', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Temporary error');
      }
      return 'success';
    };

    const result = await withRetry(fn, { maxRetries: 3, initialDelay: 10 });
    
    expect(result).toBe('success');
    expect(attempts).toBe(2);
  });

  it('should throw after max retries', async () => {
    const fn = async () => {
      throw new Error('Permanent error');
    };

    await expect(withRetry(fn, { maxRetries: 2, initialDelay: 10 })).rejects.toThrow('Permanent error');
  });
});

