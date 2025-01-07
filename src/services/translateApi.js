// translateApi.js
import { GOOGLE_CLOUD_API_KEY } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const TRANSLATE_API_ENDPOINT =
  "https://translation.googleapis.com/language/translate/v2";
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 dage
const MAX_BATCH_SIZE = 128; // Maximum antal tekster i én batch

// Cache nøgle generator
async function generateCacheKey(text, sourceLang, targetLang) {
  const key = `${text}-${sourceLang}-${targetLang}`;
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    key
  );
}

// Check om cached oversættelse er gyldig
async function isValidCache(cacheKey) {
  try {
    const metadata = await AsyncStorage.getItem(
      `translate_metadata_${cacheKey}`
    );
    if (!metadata) return false;

    const { timestamp } = JSON.parse(metadata);
    return Date.now() - timestamp < CACHE_DURATION;
  } catch {
    return false;
  }
}

// Batch processor for multiple oversættelser
async function processBatch(texts, targetLang, sourceLang = null) {
  try {
    const response = await fetch(
      `${TRANSLATE_API_ENDPOINT}?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: texts,
          target: targetLang,
          source: sourceLang,
          format: "text",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Translate API Error: ${errorText}`);
    }

    const data = await response.json();
    return data.data.translations;
  } catch (error) {
    console.error("Batch translation error:", error);
    throw error;
  }
}

// Hovedfunktion for oversættelse
export const translateText = async (
  text,
  targetLang = "da",
  sourceLang = null
) => {
  try {
    // Validér input
    if (!text?.trim()) return "";
    if (!GOOGLE_CLOUD_API_KEY) {
      throw new Error("Google Cloud API nøgle mangler");
    }

    // Smart caching system checker først for eksisterende oversættelser
    const cacheKey = await generateCacheKey(text, sourceLang, targetLang);
    const cachedTranslation = await AsyncStorage.getItem(
      `translate_${cacheKey}`
    );

    if ((await isValidCache(cacheKey)) && cachedTranslation) {
      return JSON.parse(cachedTranslation);
    }

    // Hvis ingen cache, lav oversættelse via API
    const translations = await processBatch([text], targetLang, sourceLang);
    if (!translations?.[0]?.translatedText) {
      throw new Error("Uventet response format fra Translate API");
    }

    const result = {
      translatedText: translations[0].translatedText,
      sourceLanguage:
        translations[0].detectedSourceLanguage || sourceLang || "unknown",
      targetLanguage: targetLang,
    };

    // Gem i cache til fremtidig brug
    await AsyncStorage.setItem(`translate_${cacheKey}`, JSON.stringify(result));
    await AsyncStorage.setItem(
      `translate_metadata_${cacheKey}`,
      JSON.stringify({ timestamp: Date.now() })
    );

    return result;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error(error.message || "Kunne ikke oversætte teksten");
  }
};

// Batch oversættelse af multiple tekster
export const translateBatch = async (
  texts,
  targetLang = "da",
  sourceLang = null
) => {
  try {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error("Ingen tekster at oversætte");
    }

    // Fjern tomme tekster og trim
    const validTexts = texts.map((t) => t?.trim()).filter(Boolean);

    if (validTexts.length === 0) {
      return [];
    }

    // Process i batches for at undgå API begrænsninger
    const results = [];
    for (let i = 0; i < validTexts.length; i += MAX_BATCH_SIZE) {
      const batch = validTexts.slice(i, i + MAX_BATCH_SIZE);
      const translations = await processBatch(batch, targetLang, sourceLang);
      results.push(...translations);
    }

    return results.map((translation, index) => ({
      originalText: validTexts[index],
      translatedText: translation.translatedText,
      sourceLanguage:
        translation.detectedSourceLanguage || sourceLang || "unknown",
      targetLanguage: targetLang,
    }));
  } catch (error) {
    console.error("Batch translation error:", error);
    throw new Error("Kunne ikke oversætte teksterne");
  }
};

// Cache vedligeholdelse
export const cleanupTranslationCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const translationKeys = keys.filter((k) => k.startsWith("translate_"));

    for (const key of translationKeys) {
      if (key.includes("metadata_")) {
        const cacheKey = key.replace("translate_metadata_", "");
        if (!(await isValidCache(cacheKey))) {
          await AsyncStorage.removeItem(key);
          await AsyncStorage.removeItem(`translate_${cacheKey}`);
        }
      }
    }
  } catch (error) {
    console.error("Cache cleanup error:", error);
  }
};

// Kør cache cleanup periodisk
setInterval(cleanupTranslationCache, 24 * 60 * 60 * 1000); // Hver 24. time
