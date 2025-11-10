import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { config } from './config.js';
import { sleep, withRetry } from '@x402/shared';

async function calculateRequiredAmount(
  connection: Connection,
  receiverPubkey: PublicKey,
  requestedAmount: number
): Promise<number> {
  const balance = await withRetry(
    () => connection.getBalance(receiverPubkey),
    { maxRetries: 3, initialDelay: 500 }
  );
  
  if (balance > 0) {
    return requestedAmount;
  }

  const rentExemption = await withRetry(
    () => connection.getMinimumBalanceForRentExemption(0),
    { maxRetries: 3, initialDelay: 500 }
  );
  return rentExemption + requestedAmount;
}

export async function sendPaymentWithMemo(
  payer: Keypair,
  receiver: string,
  lamports: number,
  reference: string
): Promise<string> {
  const connection = new Connection(config.RPC_URL, 'confirmed');
  const receiverPubkey = new PublicKey(receiver);

  const actualAmount = await calculateRequiredAmount(connection, receiverPubkey, lamports);
  
  if (actualAmount > lamports) {
    console.log(`[x402] Receiver account doesn't exist. Adding rent exemption: ${actualAmount - lamports} lamports`);
    console.log(`[x402] Total amount: ${actualAmount} lamports (${(actualAmount / LAMPORTS_PER_SOL).toFixed(6)} SOL)`);
  }

  const transaction = new Transaction();

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: receiverPubkey,
      lamports: actualAmount,
    })
  );

  const memoProgramId = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
  const memoData = Buffer.from(reference, 'utf-8');
  transaction.add(
    new TransactionInstruction({
      keys: [],
      programId: memoProgramId,
      data: memoData,
    })
  );

  const signature = await withRetry(
    () => sendAndConfirmTransaction(connection, transaction, [payer], {
      commitment: 'confirmed',
    }),
    { maxRetries: 3, initialDelay: 1000, maxDelay: 5000 }
  );

  return signature;
}
export async function waitForConfirmation(
  signature: string,
  timeoutMs = 30000
): Promise<boolean> {
  const connection = new Connection(config.RPC_URL, 'confirmed');
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const statuses = await withRetry(
        () => connection.getSignatureStatuses([signature]),
        { maxRetries: 2, initialDelay: 500 }
      );
      const status = statuses?.value[0];

      if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
        return true;
      }

      if (status?.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
      }
    } catch (error) {
      if (Date.now() - start >= timeoutMs) {
        throw new Error('Transaction confirmation timeout');
      }
    }

    await sleep(1000);
  }

  throw new Error('Transaction confirmation timeout');
}

