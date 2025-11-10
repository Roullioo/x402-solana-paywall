import { describe, it, expect } from 'vitest';
import { Keypair } from '@solana/web3.js';

describe('Wallet', () => {
  it('should create a valid keypair', () => {
    const keypair = Keypair.generate();
    expect(keypair.publicKey).toBeDefined();
    expect(keypair.secretKey).toBeDefined();
    expect(keypair.secretKey.length).toBe(64);
  });
});

