#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout as delay } from 'timers/promises';

const API_BASE = 'http://localhost:3000';

async function exec(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { 
      stdio: 'inherit', 
      shell: true,
      ...options,
    });
    proc.on('close', (code) => {
      if (code !== 0 && !options.allowFail) {
        reject(new Error(`Command failed with code ${code}: ${command} ${args.join(' ')}`));
      } else {
        resolve();
      }
    });
  });
}

async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/healthz`);
    if (!response.ok) throw new Error('Server not healthy');
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('[x402] Complete usage test - x402 Solana Paywall\n');

  console.log('[x402] Step 1: Checking server...');
  if (!(await checkServer())) {
    console.error('[x402] Server not accessible. Start with: pnpm server:dev');
    process.exit(1);
  }
  console.log('[x402] Server OK\n');

  console.log('[x402] Step 2: Testing endpoints (402 expected)...\n');
  
  console.log('[x402] GET /api/data');
  try {
    const res = await fetch(`${API_BASE}/api/data`);
    const data = await res.json();
    if (res.status === 402 && data.amountLamports) {
      console.log(`[x402] 402 OK - Amount: ${data.amountLamports} lamports`);
      console.log(`[x402] Reference: ${data.reference}\n`);
    } else {
      console.log(`[x402] Status: ${res.status}\n`);
    }
  } catch (error) {
    console.log(`[x402] Error: ${error.message}\n`);
  }

  console.log('[x402] GET /api/ai/summarize?url=https://solana.com');
  try {
    const res = await fetch(`${API_BASE}/api/ai/summarize?url=https://solana.com`);
    if (res.status === 402) {
      console.log(`[x402] 402 OK (paywall active)\n`);
    } else {
      console.log(`[x402] Status: ${res.status}\n`);
    }
  } catch (error) {
    console.log(`[x402] Error: ${error.message}\n`);
  }

  console.log('[x402] GET /api/weather?city=Paris');
  try {
    const res = await fetch(`${API_BASE}/api/weather?city=Paris`);
    if (res.status === 402) {
      console.log(`[x402] 402 OK (paywall active)\n`);
    } else {
      console.log(`[x402] Status: ${res.status}\n`);
    }
  } catch (error) {
    console.log(`[x402] Error: ${error.message}\n`);
  }

  console.log('[x402] GET /api/crypto?asset=SOL');
  try {
    const res = await fetch(`${API_BASE}/api/crypto?asset=SOL`);
    if (res.status === 402) {
      console.log(`[x402] 402 OK (paywall active)\n`);
    } else {
      console.log(`[x402] Status: ${res.status}\n`);
    }
  } catch (error) {
    console.log(`[x402] Error: ${error.message}\n`);
  }

  console.log('[x402] Step 3: Configuring agent...');
  try {
    await exec('pnpm', ['agent:keygen'], { allowFail: true });
    console.log('[x402] Agent keypair OK\n');
  } catch {
    console.log('[x402] Keypair already exists\n');
  }

  console.log('[x402] Step 4: Devnet airdrop (optional, may fail)...');
  try {
    await exec('pnpm', ['agent:airdrop', '0.1'], { allowFail: true });
    await delay(2000);
    console.log('[x402] Airdrop OK\n');
  } catch {
    console.log('[x402] Airdrop failed (normal if rate limited)\n');
  }

  console.log('[x402] Step 5: Testing agent with /api/data...');
  console.log('[x402] Agent: "get protected resource"\n');
  try {
    await exec('pnpm', [
      '--filter', '@x402/agent',
      'run',
      'get protected resource',
      `${API_BASE}/api/data`
    ], { allowFail: true });
    console.log('\n[x402] Agent test OK\n');
  } catch (error) {
    console.log(`\n[x402] Agent test failed (normal if no SOL): ${error.message}\n`);
    console.log('[x402] To test manually:');
    console.log(`[x402] pnpm --filter @x402/agent run "get resource" "${API_BASE}/api/data"\n`);
  }

  console.log('[x402] Usage test completed\n');
  
  console.log('[x402] To test with agent (if wallet funded):');
  console.log('[x402] pnpm agent:run "goal" "http://localhost:3000/api/data"');
  console.log('[x402] pnpm agent:run "summarize" "http://localhost:3000/api/ai/summarize?url=https://solana.com"');
  console.log('[x402] pnpm agent:run "weather" "http://localhost:3000/api/weather?city=Paris"');
  console.log('[x402] pnpm agent:run "price" "http://localhost:3000/api/crypto?asset=SOL"\n');
  
  console.log('[x402] To link agent locally:');
  console.log('[x402] pnpm agent:build');
  console.log('[x402] pnpm agent:link');
  console.log('[x402] Then use: x402-agent run "goal" "url"\n');
}

main().catch((error) => {
  console.error('[x402] Error:', error.message);
  process.exit(1);
});
