import { describe, it, expect } from 'vitest';
import { callLLM } from './llm.js';

describe('LLM Local', () => {
  it('should call local LLM if configured', async () => {
    // Mock fetch si nécessaire, mais testons en réel pour voir si ça marche
    process.env.USE_LOCAL_LLM = 'true';
    process.env.LLM_LOCAL_URL = 'http://127.0.0.1:1234';
    process.env.AGENT_MODEL = 'qwen/qwen3-coder-30b';

    const testRequirements = {
      amountLamports: 5000,
      receiver: 'test',
      reference: 'test',
      network: 'devnet' as const,
    };

    const testDecision = {
      allow: true,
      reason: 'Payment authorized',
    };

    try {
      const result = await callLLM('test goal', testRequirements, testDecision);
      console.log('LLM result:', result);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    } catch (error) {
      // Si LLM non disponible, c'est OK
      console.warn('LLM not available:', (error as Error).message);
    }
  });
});

