import { Timestamp } from 'firebase/firestore';

export interface TuitionStudent {
  id?: string;
  studentName: string;
  class: string;
  dateOfBirth: string;
  schoolName: string;
  guardianName: string;
  whatsapp: string;
  joiningDate: string;
  monthlyFee?: number;
  remarks: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export type TuitionStudentInput = Omit<TuitionStudent, 'id' | 'createdAt' | 'updatedAt'>;
