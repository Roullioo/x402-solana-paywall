#!/usr/bin/env node
import { Command } from 'commander';
import { loadOrGenerateKeypair, getBalance, airdrop } from './wallet.js';
import { sendPaymentWithMemo, waitForConfirmation } from './pay.js';
import { PaymentRequirementsSchema, base64Encode } from '@x402/shared';
import { config } from './config.js';
import { runAgent } from './agent.js';

const program = new Command();

program
  .name('x402-agent')
  .description('Agent CLI for Solana x402 paywall')
  .version('1.0.0');

program
  .command('keygen')
  .description('Generate a new keypair')
  .action(() => {
    const keypair = loadOrGenerateKeypair(true);
    console.log('[x402] Keypair generated!');
    console.log('[x402] Public Key:', keypair.publicKey.toBase58());
  });

program
  .command('balance')
  .description('Display wallet balance')
  .action(async () => {
    const keypair = loadOrGenerateKeypair();
    const balance = await getBalance(keypair.publicKey);
    console.log(`[x402] Balance: ${balance} SOL`);
    console.log(`[x402] Public Key: ${keypair.publicKey.toBase58()}`);
  });

program
  .command('airdrop <amount>')
  .description('Request devnet airdrop (in SOL)')
  .action(async (amount: string) => {
    const keypair = loadOrGenerateKeypair();
    const sol = parseFloat(amount);
    if (isNaN(sol) || sol <= 0) {
      console.error('[x402] Invalid amount');
      process.exit(1);
    }

    console.log(`[x402] Requesting airdrop of ${sol} SOL...`);
    try {
      const signature = await airdrop(keypair.publicKey, sol);
      console.log('[x402] Airdrop successful!');
      console.log('[x402] Signature:', signature);
      const balance = await getBalance(keypair.publicKey);
      console.log(`[x402] New balance: ${balance} SOL`);
    } catch (error) {
      console.error('[x402] Airdrop error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('pay <receiver> <lamports>')
  .description('Send SOL payment with memo')
  .option('-r, --reference <uuid>', 'UUID reference for memo')
  .action(async (receiver: string, lamportsStr: string, options: { reference?: string }) => {
    const keypair = loadOrGenerateKeypair();
    const lamports = parseInt(lamportsStr, 10);
    if (isNaN(lamports) || lamports <= 0) {
      console.error('[x402] Invalid amount');
      process.exit(1);
    }

    const reference = options.reference || 'no-reference';

    console.log(`[x402] Sending ${lamports} lamports to ${receiver}...`);
    console.log(`[x402] Memo: ${reference}`);

    try {
      const signature = await sendPaymentWithMemo(keypair, receiver, lamports, reference);
      console.log('[x402] Payment sent!');
      console.log('[x402] Signature:', signature);
    } catch (error) {
      console.error('[x402] Payment error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('run <goal> <url>')
  .description('Run autonomous agent with goal and target URL')
  .action(async (goal: string, url: string) => {
    const keypair = loadOrGenerateKeypair();
    const result = await runAgent({ goal, url }, keypair);
    process.exit(result.success ? 0 : 1);
  });

program
  .command('fetch <url>')
  .description('Fetch a resource protected by 402 paywall')
  .action(async (url: string) => {
    const keypair = loadOrGenerateKeypair();

    console.log(`[x402] Fetch: ${url}`);

    try {
      let response = await fetch(url);

      if (response.status !== 402) {
        console.log(`[x402] Status: ${response.status}`);
        const data = await response.text();
        console.log('[x402] Response:', data);
        return;
      }

      console.log(`[x402] Status 402 - Payment required`);
      const requirements = PaymentRequirementsSchema.parse(await response.json());

      console.log('[x402] Payment Requirements:');
      console.log(`[x402] Amount: ${requirements.amountLamports} lamports`);
      console.log(`[x402] Receiver: ${requirements.receiver}`);
      console.log(`[x402] Reference: ${requirements.reference}`);
      console.log(`[x402] Network: ${requirements.network}`);

      console.log(`[x402] Sending payment...`);
      const txSig = await sendPaymentWithMemo(
        keypair,
        requirements.receiver,
        requirements.amountLamports,
        requirements.reference
      );
      console.log('[x402] Payment sent!');
      console.log(`[x402] Signature: ${txSig}`);

      console.log(`[x402] Waiting for confirmation...`);
      await waitForConfirmation(txSig);
      console.log('[x402] Transaction confirmed!');

      const headerPayload = JSON.stringify({ txSig, reference: requirements.reference });
      const headerValue = base64Encode(headerPayload);

      console.log(`[x402] Re-fetching with ${config.X402_HEADER} header...`);
      response = await fetch(url, {
        headers: {
          [config.X402_HEADER]: headerValue,
        },
      });

      console.log(`[x402] Status: ${response.status}`);
      const data = await response.text();
      console.log('[x402] Response:', data);
    } catch (error) {
      console.error('[x402] Error:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse(process.argv);

