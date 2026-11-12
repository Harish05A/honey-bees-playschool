import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SchoolStudent, SchoolStudentInput } from '../types/schoolStudent';

const COLLECTION_NAME = 'schoolStudents';

const sanitizePayload = <T extends Record<string, any>>(data: T): Record<string, any> => {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
};

export const createSchoolStudent = async (data: SchoolStudentInput): Promise<string> => {
  const colRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(colRef, {
    ...sanitizePayload(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getSchoolStudents = async (): Promise<SchoolStudent[]> => {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
  return snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
    id: d.id,
    ...d.data()
  } as SchoolStudent));
};

export const subscribeToSchoolStudents = (
  callback: (students: SchoolStudent[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const students = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
        id: d.id,
        ...d.data()
      } as SchoolStudent));
      callback(students);
    },
    (error: Error) => {
      console.error('Firestore subscription error (schoolStudents):', error);
      if (onError) onError(error);
    }
  );
};

export const getSchoolStudent = async (id: string): Promise<SchoolStudent | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...snapshot.data()
  } as SchoolStudent;
};

export const updateSchoolStudent = async (
  id: string,
  data: Partial<SchoolStudentInput>
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...sanitizePayload(data),
    updatedAt: serverTimestamp(),
  });
};

export const deleteSchoolStudent = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

