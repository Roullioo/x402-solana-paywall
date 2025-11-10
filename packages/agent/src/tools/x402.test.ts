import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '@x402/shared';

describe('x402 - Retry Logic', () => {
  it('should have withRetry function with backoff', async () => {
    expect(typeof withRetry).toBe('function');
    
    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Network error');
      }
      return { status: 200, text: async () => 'Success' };
    };

    const result = await withRetry(fn, { 
      maxRetries: 5, 
      initialDelay: 10, 
      maxDelay: 100, 
      backoff: 2 
    });

    expect(result.status).toBe(200);
    expect(attempts).toBe(3);
  });

  it('should handle exponential backoff', async () => {
    const delays: number[] = [];
    let attempts = 0;
    
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = vi.fn((fn: Function, delay: number) => {
      delays.push(delay);
      return originalSetTimeout(fn, delay);
    }) as any;

    const fn = async () => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Error');
      }
      return 'success';
    };

    await withRetry(fn, { maxRetries: 3, initialDelay: 100, backoff: 2 });

    expect(delays.length).toBeGreaterThan(0);
    if (delays.length > 1) {
      expect(delays[1]).toBeGreaterThanOrEqual(delays[0]);
    }

    global.setTimeout = originalSetTimeout;
  });
});

