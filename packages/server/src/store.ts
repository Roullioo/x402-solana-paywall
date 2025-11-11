/**
 * Store abstraction for persistence without native dependencies
 * Supports: file-store (prod) and memory-store (tests)
 */

import Keyv from 'keyv';
import { KeyvFile } from 'keyv-file';
import { mkdir, readFile } from 'fs/promises';
import { dirname } from 'path';
import { existsSync } from 'fs';

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

export interface Store {
  createRef(reference: string, amount: number, expiresAt: string): Promise<void>;
  consumeRef(reference: string, txSig: string, payer: string, amount: number): Promise<void>;
  findByReference(reference: string): Promise<PaymentRecord | null>;
  isTransactionUsed(txSig: string): Promise<boolean>;
  cleanExpired(): Promise<number>;
  getAllPending(): Promise<PaymentRecord[]>;
}

class FileStore implements Store {
  private keyv: Keyv;
  private txIndex: Keyv;
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
    this.keyv = new Keyv({ store: new KeyvFile({ filename }) });
    this.txIndex = new Keyv({ store: new KeyvFile({ filename: filename.replace('.json', '-tx.json') }) });
  }

  async createRef(reference: string, amount: number, expiresAt: string): Promise<void> {
    const record: PaymentRecord = {
      reference,
      txSig: null,
      amount,
      payer: null,
      status: 'pending',
      expiresAt,
      createdAt: new Date().toISOString(),
      consumedAt: null,
    };
    await this.keyv.set(reference, record);
  }

  async consumeRef(reference: string, txSig: string, payer: string, amount: number): Promise<void> {
    const record = await this.findByReference(reference);
    if (!record) {
      throw new Error('Payment not found');
    }
    if (record.status === 'consumed') {
      throw new Error('Payment already consumed or not found');
    }
    
    record.status = 'consumed';
    record.txSig = txSig;
    record.payer = payer;
    record.amount = amount;
    record.consumedAt = new Date().toISOString();
    
    await this.keyv.set(reference, record);
    await this.txIndex.set(txSig, reference);
  }

  async findByReference(reference: string): Promise<PaymentRecord | null> {
    return await this.keyv.get(reference) || null;
  }

  async isTransactionUsed(txSig: string): Promise<boolean> {
    const ref = await this.txIndex.get(txSig);
    return ref !== undefined;
  }

  async cleanExpired(): Promise<number> {
    let cleaned = 0;
    const now = new Date();
    
    if (!existsSync(this.filename)) {
      return 0;
    }

    try {
      const content = await readFile(this.filename, 'utf-8');
      const data = JSON.parse(content);
      
      for (const [key, value] of Object.entries(data)) {
        const record = value as PaymentRecord;
        if (record && record.status === 'pending' && new Date(record.expiresAt) < now) {
          await this.keyv.delete(key);
          cleaned++;
        }
      }
    } catch {
      return 0;
    }

    return cleaned;
  }

  async getAllPending(): Promise<PaymentRecord[]> {
    const records: PaymentRecord[] = [];
    
    if (!existsSync(this.filename)) {
      return [];
    }

    try {
      const content = await readFile(this.filename, 'utf-8');
      const data = JSON.parse(content);
      
      for (const value of Object.values(data)) {
        const record = value as PaymentRecord;
        if (record && record.status === 'pending') {
          records.push(record);
        }
      }
    } catch {
      return [];
    }

    return records;
  }
}

class MemoryStore implements Store {
  private payments = new Map<string, PaymentRecord>();
  private txIndex = new Map<string, string>();

  async createRef(reference: string, amount: number, expiresAt: string): Promise<void> {
    const record: PaymentRecord = {
      reference,
      txSig: null,
      amount,
      payer: null,
      status: 'pending',
      expiresAt,
      createdAt: new Date().toISOString(),
      consumedAt: null,
    };
    this.payments.set(reference, record);
  }

  async consumeRef(reference: string, txSig: string, payer: string, amount: number): Promise<void> {
    const record = this.payments.get(reference);
    if (!record) {
      throw new Error('Payment not found');
    }
    if (record.status === 'consumed') {
      throw new Error('Payment already consumed or not found');
    }
    
    record.status = 'consumed';
    record.txSig = txSig;
    record.payer = payer;
    record.amount = amount;
    record.consumedAt = new Date().toISOString();
    
    this.txIndex.set(txSig, reference);
  }

  async findByReference(reference: string): Promise<PaymentRecord | null> {
    return this.payments.get(reference) || null;
  }

  async isTransactionUsed(txSig: string): Promise<boolean> {
    return this.txIndex.has(txSig);
  }

  async cleanExpired(): Promise<number> {
    const now = new Date();
    let cleaned = 0;

    for (const [key, record] of this.payments.entries()) {
      if (record.status === 'pending' && new Date(record.expiresAt) < now) {
        this.payments.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  async getAllPending(): Promise<PaymentRecord[]> {
    return Array.from(this.payments.values()).filter(r => r.status === 'pending');
  }
}

let storeInstance: Store | null = null;

export async function getStore(): Promise<Store> {
  if (storeInstance) return storeInstance;

  const driver = process.env.STORE_DRIVER || 'file';

  if (driver === 'memory') {
    storeInstance = new MemoryStore();
  } else {
    const filename = process.env.STORE_FILE || './data/store.json';
    await mkdir(dirname(filename), { recursive: true });
    storeInstance = new FileStore(filename);
  }

  return storeInstance;
}

export function resetStore(): void {
  storeInstance = null;
}

