#!/usr/bin/env tsx
import { Keypair } from '@solana/web3.js';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const keypair = Keypair.generate();
const secretKeyArray = Array.from(keypair.secretKey);

const outputPath = resolve(process.cwd(), 'receiver-keypair.json');
writeFileSync(outputPath, JSON.stringify(secretKeyArray, null, 2));

console.log('[x402] Receiver keypair generated!');
console.log('[x402] Path:', outputPath);
console.log('[x402] Public Key:', keypair.publicKey.toBase58());
console.log('[x402] Add this to packages/server/.env:');
console.log(`[x402] RECEIVER_PUBKEY=${keypair.publicKey.toBase58()}`);

