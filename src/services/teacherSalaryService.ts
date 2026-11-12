import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SalaryRecord, SalaryRecordInput } from '../types/salary';
import { Teacher } from '../types/teacher';
import { formatMonthKey, generateMonthKeysFromDate } from './feeService';

const TEACHER_SALARIES_COLLECTION = 'teacherSalaryRecords';

export const createSalaryRecord = async (input: SalaryRecordInput): Promise<string> => {
  const colRef = collection(db, TEACHER_SALARIES_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateSalaryRecord = async (
  id: string,
  input: Partial<SalaryRecordInput>
): Promise<void> => {
  const docRef = doc(db, TEACHER_SALARIES_COLLECTION, id);
  await updateDoc(docRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSalaryRecord = async (id: string): Promise<void> => {
  const docRef = doc(db, TEACHER_SALARIES_COLLECTION, id);
  await deleteDoc(docRef);
};

export const subscribeToSalaryRecords = (
  callback: (data: SalaryRecord[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, TEACHER_SALARIES_COLLECTION), orderBy('paymentDate', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as SalaryRecord[];
      callback(records);
    },
    (err) => {
      console.error('Firestore SalaryRecords error:', err);
      if (onError) onError(err);
    }
  );
};

export interface TeacherMonthSalaryStatus {
  monthKey: string;
  monthName: string;
  monthlySalary: number;
  paidAmount: number;
  dueAmount: number;
  status: 'Paid' | 'Partial' | 'Pending';
  records: SalaryRecord[];
}

export interface TeacherSalaryLedger {
  teacher: Teacher;
  monthlySalary: number;
  totalPaidAllTime: number;
  totalPendingAllTime: number;
  pendingMonthsCount: number;
  monthStatuses: TeacherMonthSalaryStatus[];
}

export const calculateTeacherSalaryLedger = (
  teacher: Teacher,
  allSalaryRecords: SalaryRecord[]
): TeacherSalaryLedger => {
  const monthlySalary = teacher.monthlySalary ?? 0;
  const monthKeys = generateMonthKeysFromDate(teacher.joiningDate);
  const teacherRecords = allSalaryRecords.filter((r) => r.teacherId === teacher.id);

  let totalPaidAllTime = 0;
  let totalPendingAllTime = 0;
  let pendingMonthsCount = 0;

  const monthStatuses: TeacherMonthSalaryStatus[] = monthKeys.map((monthKey) => {
    const matchingRecords = teacherRecords.filter((r) => {
      if (r.targetMonth) return r.targetMonth === monthKey;
      return (r.paymentDate || '').startsWith(monthKey);
    });

    const paidAmount = matchingRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
    totalPaidAllTime += paidAmount;

    let status: 'Paid' | 'Partial' | 'Pending' = 'Pending';
    let dueAmount = monthlySalary;

    if (monthlySalary <= 0) {
      status = paidAmount > 0 ? 'Paid' : 'Pending';
      dueAmount = 0;
    } else if (paidAmount >= monthlySalary) {
      status = 'Paid';
      dueAmount = 0;
    } else if (paidAmount > 0) {
      status = 'Partial';
      dueAmount = monthlySalary - paidAmount;
      pendingMonthsCount++;
    } else {
      status = 'Pending';
      dueAmount = monthlySalary;
      pendingMonthsCount++;
    }

    totalPendingAllTime += dueAmount;

    return {
      monthKey,
      monthName: formatMonthKey(monthKey),
      monthlySalary,
      paidAmount,
      dueAmount,
      status,
      records: matchingRecords,
    };
  });

  return {
    teacher,
    monthlySalary,
    totalPaidAllTime,
    totalPendingAllTime,
    pendingMonthsCount,
    monthStatuses,
  };
};

