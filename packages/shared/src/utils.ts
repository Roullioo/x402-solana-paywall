import { randomUUID } from 'crypto';

/**
 * Génère un UUID v4
 */
export function generateUUID(): string {
  return randomUUID();
}

/**
 * Encode en base64
 */
export function base64Encode(data: string): string {
  return Buffer.from(data, 'utf-8').toString('base64');
}

/**
 * Décode depuis base64
 */
export function base64Decode(data: string): string {
  return Buffer.from(data, 'base64').toString('utf-8');
}

/**
 * Ajoute des minutes à une date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Retry avec backoff exponentiel
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000, backoff = 2 } = options;

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * backoff, maxDelay);
      }
    }
  }

  throw lastError;
}

/**
 * Sleep pour délai
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

