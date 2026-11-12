import { Timestamp } from 'firebase/firestore';
import { PaymentMethod } from './fee';

export type SalaryStatus = 'Paid' | 'Pending';

export interface SalaryRecord {
  id?: string;
  teacherId: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  targetMonth: string; // YYYY-MM
  status: SalaryStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export type SalaryRecordInput = Omit<SalaryRecord, 'id' | 'createdAt' | 'updatedAt'>;

