import { Timestamp } from 'firebase/firestore';
import { SchoolGroup } from './schoolStudent';

export type TeacherStatus = 'Active' | 'Inactive';

export interface Teacher {
  id?: string;
  teacherName: string;
  phone: string;
  email?: string;
  assignedGroups: SchoolGroup[];
  qualification?: string;
  joiningDate: string;
  monthlySalary?: number;
  status: TeacherStatus;
  remarks: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export type TeacherInput = Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>;

