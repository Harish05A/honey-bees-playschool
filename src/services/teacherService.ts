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
import { Teacher, TeacherInput } from '../types/teacher';

const COLLECTION_NAME = 'teachers';

const sanitizePayload = <T extends Record<string, any>>(data: T): Record<string, any> => {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
};

export const createTeacher = async (data: TeacherInput): Promise<string> => {
  const colRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(colRef, {
    ...sanitizePayload(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getTeachers = async (): Promise<Teacher[]> => {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
  return snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
    id: d.id,
    ...d.data()
  } as Teacher));
};

export const subscribeToTeachers = (
  callback: (teachers: Teacher[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const teachers = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
        id: d.id,
        ...d.data()
      } as Teacher));
      callback(teachers);
    },
    (error: Error) => {
      console.error('Firestore subscription error (teachers):', error);
      if (onError) onError(error);
    }
  );
};

export const getTeacher = async (id: string): Promise<Teacher | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...snapshot.data()
  } as Teacher;
};

export const updateTeacher = async (
  id: string,
  data: Partial<TeacherInput>
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...sanitizePayload(data),
    updatedAt: serverTimestamp(),
  });
};

export const deleteTeacher = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

