import { Timestamp } from 'firebase/firestore';

export interface GeneralSettings {
  centerName: string;
  contactNumber: string;
  address: string;
  academicYearClosed?: boolean;
  academicYearName?: string;
  updatedAt?: Timestamp | Date | null;
}
