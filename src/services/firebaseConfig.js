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
  apiKey: "AIzaSyCO0lAbNmK34pm_GXRPq3c1AGYwF3n1o_Y",
  authDomain: "scantranslate-ac6bd.firebaseapp.com",
  projectId: "scantranslate-ac6bd",
  storageBucket: "scantranslate-ac6bd.firebasestorage.app",
  messagingSenderId: "183089225232",
  appId: "1:183089225232:web:7da0191831ef0769e43495",
  measurementId: "G-7KSWJ1EHB0",
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
