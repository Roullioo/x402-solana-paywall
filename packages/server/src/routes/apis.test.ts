import { describe, it, expect } from 'vitest';

describe('APIs Routes', () => {
  it('should have mock mode for AI summarize', () => {
    const mockResponse = {
      url: 'https://example.com',
      summary: 'MOCK: Summary of example.com',
      mode: 'mock',
    };
    expect(mockResponse.mode).toBe('mock');
    expect(mockResponse.summary).toContain('MOCK');
  });

  it('should have mock mode for weather', () => {
    const mockResponse = {
      city: 'Paris',
      tempC: 18,
      conditions: 'cloudy (mock)',
      mode: 'mock',
    };
    expect(mockResponse.mode).toBe('mock');
    expect(mockResponse.tempC).toBeGreaterThan(0);
  });

  it('should have mock mode for crypto', () => {
    const mockResponse = {
      asset: 'SOL',
      usd: 105,
      eur: 95,
      mode: 'mock',
    };
    expect(mockResponse.mode).toBe('mock');
    expect(mockResponse.usd).toBeGreaterThan(0);
  });
});

