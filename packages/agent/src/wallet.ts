import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { resolve } from 'path';
import { config } from './config.js';

const WALLET_DIR = resolve(homedir(), '.x402-agent');
const KEYPAIR_PATH = resolve(WALLET_DIR, 'keypair.json');

/**
 * Charge ou génère une keypair
 */
export function loadOrGenerateKeypair(generate = false): Keypair {
  if (!existsSync(WALLET_DIR)) {
    mkdirSync(WALLET_DIR, { recursive: true });
  }

  if (generate || !existsSync(KEYPAIR_PATH)) {
    const keypair = Keypair.generate();
    const secretKeyArray = Array.from(keypair.secretKey);
    writeFileSync(KEYPAIR_PATH, JSON.stringify(secretKeyArray, null, 2));
    return keypair;
  }

  const secretKeyArray = JSON.parse(readFileSync(KEYPAIR_PATH, 'utf-8'));
  return Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
}

/**
 * Récupère le solde
 */
export async function getBalance(pubkey: PublicKey): Promise<number> {
  const connection = new Connection(config.RPC_URL, 'confirmed');
  const lamports = await connection.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Airdrop devnet
 */
export async function airdrop(pubkey: PublicKey, sol: number): Promise<string> {
  const connection = new Connection(config.RPC_URL, 'confirmed');
  const lamports = sol * LAMPORTS_PER_SOL;
  const signature = await connection.requestAirdrop(pubkey, lamports);
  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
}

