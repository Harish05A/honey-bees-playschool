import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GeneralSettings } from '../types/settings';

const SETTINGS_COLLECTION = 'settings';
const GENERAL_DOC_ID = 'general';

/**
 * Fetch general tuition center settings from Cloud Firestore
 */
export const getGeneralSettings = async (): Promise<GeneralSettings | null> => {
  const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as GeneralSettings;
  }
  return null;
};

/**
 * Save general tuition center settings to Cloud Firestore
 */
export const saveGeneralSettings = async (settings: Omit<GeneralSettings, 'updatedAt'>): Promise<void> => {
  const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
  await setDoc(docRef, {
    ...settings,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};
