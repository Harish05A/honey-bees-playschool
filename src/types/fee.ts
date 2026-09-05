import { Timestamp } from 'firebase/firestore';

export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';
export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';

export interface FeeRecord {
  id?: string;
  studentId: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  targetMonth?: string; // e.g. "2026-09" (YYYY-MM)
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export type FeeRecordInput = Omit<FeeRecord, 'id' | 'createdAt' | 'updatedAt'>;
