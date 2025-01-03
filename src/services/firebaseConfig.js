import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const saveTranslation = async (translationData) => {
  try {
    const translationsRef = collection(db, "translations");

    const docRef = await addDoc(translationsRef, {
      originalText: translationData.originalText,
      translatedText: translationData.translatedText,
      sourceLanguage: translationData.sourceLanguage,
      targetLanguage: "da",
      timestamp: serverTimestamp(), // Brug serverTimestamp i stedet for new Date()
    });

    console.log("Translation saved successfully with ID:", docRef.id);
    return true;
  } catch (error) {
    console.error("Error saving translation:", error);
    throw error;
  }
};

export const getTranslationHistory = async () => {
  try {
    const translationsRef = collection(db, "translations");
    const q = query(translationsRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching translation history:", error);
    throw error;
  }
};
