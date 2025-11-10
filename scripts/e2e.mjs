#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout as delay } from 'timers/promises';

const API_URL = 'http://localhost:3000/api/data';

async function exec(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit', shell: true });
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}: ${command} ${args.join(' ')}`));
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  console.log('[x402] E2E Test: x402 Solana Paywall\n');

  try {
    console.log('[x402] Step 1: Checking server...');
    const healthResponse = await fetch('http://localhost:3000/healthz').catch(() => null);
    if (!healthResponse || !healthResponse.ok) {
      console.error('[x402] Server not accessible. Start with: pnpm server:dev');
      process.exit(1);
    }
    console.log('[x402] Server OK\n');

    console.log('[x402] Step 2: Generating agent keypair...');
    await exec('pnpm', ['agent:keygen']);
    console.log('');

    console.log('[x402] Step 3: Airdrop 0.1 SOL...');
    await exec('pnpm', ['agent:airdrop', '0.1']);
    console.log('');

    await delay(2000);

    console.log('[x402] Step 4: Fetching resource with paywall...');
    await exec('pnpm', ['agent:fetch', API_URL]);
    console.log('');

    console.log('[x402] E2E Test successful!\n');
  } catch (error) {
    console.error('[x402] E2E Test failed:', error.message);
    process.exit(1);
  }
}

main();
