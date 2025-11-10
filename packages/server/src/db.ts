import Database from 'better-sqlite3';
import { config } from './config.js';

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

let db: Database.Database | null = null;

/**
 * Initialise la base SQLite
 */
export function initDB(): Database.Database {
  if (db) return db;

  db = new Database(config.SQLITE_PATH);

  // Table des paiements
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      reference TEXT PRIMARY KEY,
      txSig TEXT,
      amount INTEGER NOT NULL,
      payer TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      consumedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_txSig ON payments(txSig);
    CREATE INDEX IF NOT EXISTS idx_status ON payments(status);
  `);

  return db;
}

/**
 * Crée un payment requirement pending
 */
export function createPaymentRequirement(
  reference: string,
  amount: number,
  expiresAt: string
): void {
  const db = initDB();
  const stmt = db.prepare(
    'INSERT INTO payments (reference, amount, expiresAt, status) VALUES (?, ?, ?, ?)'
  );
  stmt.run(reference, amount, expiresAt, 'pending');
}

/**
 * Vérifie si une référence existe et n'est pas consommée
 */
export function findPaymentByReference(reference: string): PaymentRecord | null {
  const db = initDB();
  const stmt = db.prepare('SELECT * FROM payments WHERE reference = ?');
  return stmt.get(reference) as PaymentRecord | null;
}

/**
 * Marque un payment comme consommé
 */
export function consumePayment(
  reference: string,
  txSig: string,
  payer: string,
  amount: number
): void {
  const db = initDB();
  const stmt = db.prepare(
    `UPDATE payments 
     SET status = 'consumed', txSig = ?, payer = ?, amount = ?, consumedAt = datetime('now')
     WHERE reference = ? AND status = 'pending'`
  );
  const result = stmt.run(txSig, payer, amount, reference);
  if (result.changes === 0) {
    throw new Error('Payment already consumed or not found');
  }
}

/**
 * Vérifie si un txSig a déjà été utilisé (anti-replay global)
 */
export function isTransactionUsed(txSig: string): boolean {
  const db = initDB();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM payments WHERE txSig = ?');
  const row = stmt.get(txSig) as { count: number };
  return row.count > 0;
}

/**
 * Nettoie les références expirées (optionnel)
 */
export function cleanExpiredReferences(): number {
  const db = initDB();
  const stmt = db.prepare(
    "DELETE FROM payments WHERE status = 'pending' AND datetime(expiresAt) < datetime('now')"
  );
  const result = stmt.run();
  return result.changes;
}

