import { Timestamp } from 'firebase/firestore';

export type SchoolGroup = 'Playgroup' | 'Pre-KG' | 'LKG' | 'UKG';

export const SCHOOL_GROUPS: SchoolGroup[] = ['Playgroup', 'Pre-KG', 'LKG', 'UKG'];

export interface SchoolStudent {
  id?: string;
  studentName: string;
  group: SchoolGroup;
  dateOfBirth: string;
  gender?: 'Boy' | 'Girl' | 'Other' | '';
  guardianName: string;
  whatsapp: string;
  address?: string;
  joiningDate: string;
  monthlyFee?: number;
  assignedTeacherId?: string;
  assignedTeacherName?: string;
  remarks: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export type SchoolStudentInput = Omit<SchoolStudent, 'id' | 'createdAt' | 'updatedAt'>;

