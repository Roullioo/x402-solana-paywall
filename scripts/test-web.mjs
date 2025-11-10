#!/usr/bin/env node

const API_BASE = 'http://localhost:3000';
const WEB_BASE = 'http://localhost:3001';

async function check(url, name) {
  try {
    const res = await fetch(url);
    if (res.ok || res.status === 402) {
      console.log(`[x402] ${name}: OK (${res.status})`);
      return true;
    } else {
      console.log(`[x402] ${name}: ${res.status}`);
      return false;
    }
  } catch (error) {
    console.log(`[x402] ${name}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('[x402] Testing Web Interface\n');

  const results = await Promise.all([
    check(`${API_BASE}/healthz`, 'Server healthcheck'),
    check(`${API_BASE}/api/data`, 'API /api/data'),
    check(`${API_BASE}/api/ai/summarize?url=https://solana.com`, 'API /api/ai/summarize'),
    check(`${API_BASE}/api/weather?city=Paris`, 'API /api/weather'),
    check(`${API_BASE}/api/crypto?asset=SOL`, 'API /api/crypto'),
    check(`${WEB_BASE}`, 'Web interface'),
  ]);

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\n[x402] ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n[x402] Everything works!');
    console.log(`\n[x402] Web interface: ${WEB_BASE}`);
    console.log(`[x402] API server: ${API_BASE}`);
  } else {
    console.log('\n[x402] Some services are not started');
    console.log('[x402] Start with: pnpm server:dev & pnpm web:dev');
  }
}

main();
