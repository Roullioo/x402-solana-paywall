#!/usr/bin/env node

import { callLLM } from '../packages/agent/src/llm.js';

const testPaymentRequirements = {
  amountLamports: 5000,
  receiver: 'HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8',
  reference: 'test-uuid',
  network: 'devnet',
};

const testPolicyDecision = {
  allow: true,
  reason: 'Payment authorized by policy',
};

console.log('[x402] Testing Agent with Local LLM\n');

try {
  const result = await callLLM(
    'get protected resource',
    testPaymentRequirements,
    testPolicyDecision
  );
  
  console.log('[x402] LLM called successfully!');
  console.log(`\n[x402] LLM Response:\n${result}\n`);
} catch (error) {
  console.error('[x402] Error:', error.message);
  process.exit(1);
}
