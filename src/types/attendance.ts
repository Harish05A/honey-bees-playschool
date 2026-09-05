import { Timestamp } from 'firebase/firestore';

export type AttendanceStatus = 'Present' | 'Absent' | 'N/A';

export interface StudentAttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

export interface ClassAttendance {
  id?: string;
  date: string; // YYYY-MM-DD
  class: string; // Can be 'ALL' or a specific class
  records: StudentAttendanceRecord[];
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}
