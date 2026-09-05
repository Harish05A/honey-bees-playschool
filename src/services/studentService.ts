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
import { TuitionStudent, TuitionStudentInput } from '../types/student';

const COLLECTION_NAME = 'tuitionStudents';

export const createStudent = async (data: TuitionStudentInput): Promise<string> => {
  const colRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getStudents = async (): Promise<TuitionStudent[]> => {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
  return snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
    id: d.id,
    ...d.data()
  } as TuitionStudent));
};

export const subscribeToStudents = (
  callback: (students: TuitionStudent[]) => void, 
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
      } as TuitionStudent));
      callback(students);
    },
    (error: Error) => {
      console.error("Firestore subscription error:", error);
      if (onError) onError(error);
    }
  );
};

export const getStudent = async (id: string): Promise<TuitionStudent | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...snapshot.data()
  } as TuitionStudent;
};

export const updateStudent = async (id: string, data: Partial<TuitionStudentInput>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteStudent = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
