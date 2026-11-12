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

const SCHOOL_ATTENDANCE_COLLECTION = 'schoolAttendance';

export const getSchoolAttendanceDocId = (date: string, groupName: string = 'ALL'): string => {
  const safeGroup = (groupName || 'ALL').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${date}_${safeGroup}`;
};

export const saveSchoolAttendance = async (attendance: ClassAttendance): Promise<void> => {
  const groupName = attendance.class || 'ALL';
  const docId = getSchoolAttendanceDocId(attendance.date, groupName);
  const docRef = doc(db, SCHOOL_ATTENDANCE_COLLECTION, docId);

  const payload = {
    date: attendance.date,
    class: groupName,
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

export const getSchoolAttendanceByDate = async (
  date: string,
  groupName: string = 'ALL'
): Promise<ClassAttendance | null> => {
  const docId = getSchoolAttendanceDocId(date, groupName);
  const docRef = doc(db, SCHOOL_ATTENDANCE_COLLECTION, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ClassAttendance;
  }
  return null;
};

export const subscribeToSchoolAttendance = (
  callback: (data: ClassAttendance[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, SCHOOL_ATTENDANCE_COLLECTION), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ClassAttendance[];
      callback(records);
    },
    (err) => {
      console.error('Firestore SchoolAttendance error:', err);
      if (onError) onError(err);
    }
  );
};

