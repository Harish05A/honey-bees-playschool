import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ClassAttendance } from '../types/attendance';

const ATTENDANCE_COLLECTION = 'attendance';

/**
 * Generate a document ID for a specific date and class combination.
 * Defaults to 'all' when no class filter is applied.
 */
export const getAttendanceDocId = (date: string, className: string = 'ALL'): string => {
  const safeClass = (className || 'ALL').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${date}_${safeClass}`;
};

/**
 * Save or update daily attendance in Cloud Firestore
 */
export const saveAttendance = async (attendance: ClassAttendance): Promise<void> => {
  const className = attendance.class || 'ALL';
  const docId = getAttendanceDocId(attendance.date, className);
  const docRef = doc(db, ATTENDANCE_COLLECTION, docId);

  const payload = {
    date: attendance.date,
    class: className,
    records: attendance.records,
    updatedAt: serverTimestamp(),
  };

  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    await setDoc(docRef, {
      ...payload,
      createdAt: serverTimestamp(),
    });
  } else {
    await setDoc(docRef, payload, { merge: true });
  }
};

/**
 * Get attendance for a specific date (and optional class)
 */
export const getAttendanceByDateAndClass = async (
  date: string, 
  className: string = 'ALL'
): Promise<ClassAttendance | null> => {
  const docId = getAttendanceDocId(date, className);
  const docRef = doc(db, ATTENDANCE_COLLECTION, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ClassAttendance;
  }
  return null;
};

/**
 * Subscribe to all attendance records in real-time
 */
export const subscribeToAttendance = (
  callback: (data: ClassAttendance[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, ATTENDANCE_COLLECTION), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ClassAttendance[];
      callback(records);
    },
    (err) => {
      console.error('Firestore Attendance error:', err);
      if (onError) onError(err);
    }
  );
};
