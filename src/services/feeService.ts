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
import { FeeRecord, FeeRecordInput, PaymentStatus } from '../types/fee';
import { TuitionStudent } from '../types/student';

const FEES_COLLECTION = 'feeRecords';

/**
 * Add a new fee payment record to Cloud Firestore
 */
export const createFeeRecord = async (input: FeeRecordInput): Promise<string> => {
  const colRef = collection(db, FEES_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Update an existing fee payment record
 */
export const updateFeeRecord = async (id: string, input: Partial<FeeRecordInput>): Promise<void> => {
  const docRef = doc(db, FEES_COLLECTION, id);
  await updateDoc(docRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a fee record from Cloud Firestore
 */
export const deleteFeeRecord = async (id: string): Promise<void> => {
  const docRef = doc(db, FEES_COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Subscribe to all fee payment records in real-time
 */
export const subscribeToFeeRecords = (
  callback: (data: FeeRecord[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, FEES_COLLECTION), orderBy('paymentDate', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FeeRecord[];
      callback(records);
    },
    (err) => {
      console.error('Firestore FeeRecords error:', err);
      if (onError) onError(err);
    }
  );
};

export interface StudentMonthFeeStatus {
  monthKey: string; // e.g. "2026-09"
  monthName: string; // e.g. "September 2026"
  monthlyFee: number;
  paidAmount: number;
  dueAmount: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  records: FeeRecord[];
}

export interface StudentFeeLedger {
  student: TuitionStudent;
  totalMonthlyFee: number;
  totalPaidAllTime: number;
  totalDueAllTime: number;
  monthsCount: number;
  unpaidMonthsCount: number;
  monthStatuses: StudentMonthFeeStatus[];
}

/**
 * Generate YYYY-MM month keys from start date string (joiningDate) to current month.
 */
export const generateMonthKeysFromDate = (joiningDateStr?: string, maxMonthKey?: string): string[] => {
  const months: string[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  let startYear = currentYear;
  let startMonth = currentMonth;

  if (joiningDateStr) {
    const parsed = new Date(joiningDateStr);
    if (!isNaN(parsed.getTime())) {
      startYear = parsed.getFullYear();
      startMonth = parsed.getMonth() + 1;
    }
  }

  // Cap start to maximum 24 months back to prevent runaway loops if date is invalid
  const twoYearsAgo = currentYear - 2;
  if (startYear < twoYearsAgo) startYear = twoYearsAgo;

  const targetEndKey = maxMonthKey || `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  let y = startYear;
  let m = startMonth;

  while (true) {
    const monthKey = `${y}-${String(m).padStart(2, '0')}`;
    months.push(monthKey);

    if (monthKey >= targetEndKey) break;

    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  return months;
};

/**
 * Format YYYY-MM key to "September 2026"
 */
export const formatMonthKey = (monthKey: string): string => {
  const [yearStr, monthStr] = monthKey.split('-');
  const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Calculate complete fee ledger for a student against all feeRecords.
 */
export const calculateStudentLedger = (
  student: TuitionStudent, 
  allFeeRecords: FeeRecord[],
  isAcademicYearClosed?: boolean
): StudentFeeLedger => {
  const monthlyFee = student.monthlyFee || 1500;
  const monthKeys = generateMonthKeysFromDate(student.joiningDate);

  const studentRecords = allFeeRecords.filter((r) => r.studentId === student.id);

  let totalPaidAllTime = 0;
  let totalDueAllTime = 0;
  let unpaidMonthsCount = 0;

  const monthStatuses: StudentMonthFeeStatus[] = monthKeys.map((monthKey) => {
    // Find records that specifically target this month, or match paymentDate YYYY-MM
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
