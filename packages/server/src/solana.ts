import {
  Connection,
  PublicKey,
  VersionedTransactionResponse,
  Message,
  VersionedMessage,
} from '@solana/web3.js';
import { config } from './config.js';
import { withRetry } from '@x402/shared';

const connection = new Connection(config.RPC_URL, 'confirmed');

export interface VerifyPaymentParams {
  txSig: string;
  reference: string;
  receiver: string;
  amountLamports: number;
  mint?: string | null;
}

export interface VerifyPaymentResult {
  ok: boolean;
  payer?: string;
  amountLamports?: number;
  reason?: string;
}

/**
 * Récupère une transaction on-chain avec retry
 */
export async function getTransaction(
  signature: string
): Promise<VersionedTransactionResponse | null> {
  return withRetry(
    async () => {
      const tx = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });
      return tx;
    },
    { maxRetries: 5, initialDelay: 500, maxDelay: 3000 }
  );
}

export async function verifyPayment(
  params: VerifyPaymentParams
): Promise<VerifyPaymentResult> {
  const { txSig, reference, receiver, amountLamports, mint } = params;

  let tx: VersionedTransactionResponse | null;
  try {
    tx = await getTransaction(txSig);
  } catch (error) {
    return { ok: false, reason: `Transaction fetch error: ${(error as Error).message}` };
  }

  if (!tx) {
    return { ok: false, reason: 'Transaction not found or not confirmed' };
  }

  if (tx.meta?.err) {
    return { ok: false, reason: 'Transaction failed on-chain' };
  }

  if (mint) {
    return { ok: false, reason: 'SPL token support not yet implemented in this POC' };
  }

  const receiverPubkey = new PublicKey(receiver);

  const preBalance = tx.meta?.preBalances || [];
  const postBalance = tx.meta?.postBalances || [];
  
  const message = tx.transaction.message;
  const accountKeys = getAccountKeys(message);

  let receiverIndex = -1;
  for (let i = 0; i < accountKeys.length; i++) {
    if (accountKeys[i].equals(receiverPubkey)) {
      receiverIndex = i;
      break;
    }
  }

  if (receiverIndex === -1) {
    return { ok: false, reason: 'Receiver not found in transaction' };
  }

  const receivedLamports = postBalance[receiverIndex] - preBalance[receiverIndex];
  
  if (receivedLamports < amountLamports) {
    return {
      ok: false,
      reason: `Amount mismatch: expected at least ${amountLamports}, got ${receivedLamports}`,
    };
  }

  const memoFound = findMemoWithReference(tx, reference);
  if (!memoFound) {
    return { ok: false, reason: 'Memo with reference not found' };
  }

  const payer = accountKeys[0].toBase58();

  return { ok: true, payer, amountLamports: receivedLamports };
}

function getAccountKeys(message: Message | VersionedMessage): PublicKey[] {
  if ('accountKeys' in message) {
    return message.accountKeys;
  } else {
    return message.staticAccountKeys;
  }
}

function findMemoWithReference(tx: VersionedTransactionResponse, reference: string): boolean {
  const instructions = tx.transaction.message.compiledInstructions || [];

  const message = tx.transaction.message;
  const accountKeys = getAccountKeys(message);
  const memoProgramId = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

  for (const ix of instructions) {
    const programIdIndex = ix.programIdIndex;
    const programId = accountKeys[programIdIndex];
    
    if (programId && programId.toBase58() === memoProgramId) {
      const memoData = Buffer.from(ix.data as unknown as number[]).toString('utf-8');
      if (memoData.includes(reference)) {
        return true;
      }
    }
  }

  return false;
}

