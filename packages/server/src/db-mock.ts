export interface PaymentRecord {
  reference: string;
  txSig: string | null;
  amount: number;
  payer: string | null;
  status: 'pending' | 'consumed';
  expiresAt: string;
  createdAt: string;
  consumedAt: string | null;
}

const payments = new Map<string, PaymentRecord>();

export function initDB() {
  console.log('[x402] Using mock in-memory DB (better-sqlite3 not compiled)');
  return {};
}

export function createPaymentRequirement(
  reference: string,
  amount: number,
  expiresAt: string
): void {
  payments.set(reference, {
    reference,
    txSig: null,
    amount,
    payer: null,
    status: 'pending',
    expiresAt,
    createdAt: new Date().toISOString(),
    consumedAt: null,
  });
}

export function findPaymentByReference(reference: string): PaymentRecord | null {
  return payments.get(reference) || null;
}

export function consumePayment(
  reference: string,
  txSig: string,
  payer: string,
  amount: number
): void {
  const payment = payments.get(reference);
  if (!payment) {
    throw new Error('Payment not found');
  }
  if (payment.status === 'consumed') {
    throw new Error('Payment already consumed or not found');
  }
  payment.status = 'consumed';
  payment.txSig = txSig;
  payment.payer = payer;
  payment.amount = amount;
  payment.consumedAt = new Date().toISOString();
}

export function isTransactionUsed(txSig: string): boolean {
  for (const payment of payments.values()) {
    if (payment.txSig === txSig) {
      return true;
    }
  }
  return false;
}

export function cleanExpiredReferences(): number {
  let count = 0;
  const now = new Date();
  for (const [ref, payment] of payments.entries()) {
    if (payment.status === 'pending' && new Date(payment.expiresAt) < now) {
      payments.delete(ref);
      count++;
    }
  }
  return count;
}

