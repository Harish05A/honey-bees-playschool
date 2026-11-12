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
import { FeeRecord, FeeRecordInput } from '../types/fee';
import { SchoolStudent } from '../types/schoolStudent';
import { formatMonthKey, generateMonthKeysFromDate } from './feeService';

const SCHOOL_FEES_COLLECTION = 'schoolFeeRecords';

export const createSchoolFeeRecord = async (input: FeeRecordInput): Promise<string> => {
  const colRef = collection(db, SCHOOL_FEES_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateSchoolFeeRecord = async (
  id: string,
  input: Partial<FeeRecordInput>
): Promise<void> => {
  const docRef = doc(db, SCHOOL_FEES_COLLECTION, id);
  await updateDoc(docRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSchoolFeeRecord = async (id: string): Promise<void> => {
  const docRef = doc(db, SCHOOL_FEES_COLLECTION, id);
  await deleteDoc(docRef);
};

export const subscribeToSchoolFeeRecords = (
  callback: (data: FeeRecord[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, SCHOOL_FEES_COLLECTION), orderBy('paymentDate', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as FeeRecord[];
      callback(records);
    },
    (err) => {
      console.error('Firestore SchoolFeeRecords error:', err);
      if (onError) onError(err);
    }
  );
};

export interface SchoolStudentMonthFeeStatus {
  monthKey: string;
  monthName: string;
  monthlyFee: number;
  paidAmount: number;
  dueAmount: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  records: FeeRecord[];
}

export interface SchoolStudentFeeLedger {
  student: SchoolStudent;
  totalMonthlyFee: number;
  totalPaidAllTime: number;
  totalDueAllTime: number;
  monthsCount: number;
  unpaidMonthsCount: number;
  monthStatuses: SchoolStudentMonthFeeStatus[];
}

export const calculateSchoolStudentLedger = (
  student: SchoolStudent,
  allFeeRecords: FeeRecord[]
): SchoolStudentFeeLedger => {
  const monthlyFee = student.monthlyFee ?? 2500;
  const monthKeys = generateMonthKeysFromDate(student.joiningDate);
  const studentRecords = allFeeRecords.filter((r) => r.studentId === student.id);

  let totalPaidAllTime = 0;
  let totalDueAllTime = 0;
  let unpaidMonthsCount = 0;

  const monthStatuses: SchoolStudentMonthFeeStatus[] = monthKeys.map((monthKey) => {
    const matchingRecords = studentRecords.filter((r) => {
      if (r.targetMonth) return r.targetMonth === monthKey;
      return (r.paymentDate || '').startsWith(monthKey);
    });

    const paidAmount = matchingRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
    totalPaidAllTime += paidAmount;

    let status: 'Paid' | 'Partial' | 'Unpaid' = 'Unpaid';
    let dueAmount = monthlyFee;

    if (paidAmount >= monthlyFee) {
      status = 'Paid';
      dueAmount = 0;
    } else if (paidAmount > 0) {
      status = 'Partial';
      dueAmount = monthlyFee - paidAmount;
      unpaidMonthsCount++;
    } else {
      status = 'Unpaid';
      dueAmount = monthlyFee;
      unpaidMonthsCount++;
    }

    totalDueAllTime += dueAmount;

    return {
      monthKey,
      monthName: formatMonthKey(monthKey),
      monthlyFee,
      paidAmount,
      dueAmount,
      status,
      records: matchingRecords,
    };
  });

  return {
    student,
    totalMonthlyFee: monthlyFee,
    totalPaidAllTime,
    totalDueAllTime,
    monthsCount: monthKeys.length,
    unpaidMonthsCount,
    monthStatuses,
  };
};

