#!/usr/bin/env node
/**
 * Wrapper pour agent:run qui passe correctement les arguments
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: pnpm agent:run <goal> <url>');
  process.exit(1);
}

const [goal, url] = args;

// Exécuter le CLI de l'agent
const child = spawn('pnpm', ['--filter', '@x402/agent', 'exec', 'tsx', 'src/cli.ts', 'run', goal, url], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: false,
});

child.on('close', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

