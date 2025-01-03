// textToSpeechApi.js
import { GOOGLE_CLOUD_API_KEY } from "@env";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const TTS_API_ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize";
const CACHE_DIR = `${FileSystem.cacheDirectory}tts/`;
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dage

// Stemme konfigurationer for forskellige sprog
const VOICE_CONFIGS = {
  'da-DK': { name: 'da-DK-Standard-A', gender: 'FEMALE' },
  'en-US': { name: 'en-US-Standard-C', gender: 'FEMALE' },
  'de-DE': { name: 'de-DE-Standard-A', gender: 'FEMALE' },
  'es-ES': { name: 'es-ES-Standard-A', gender: 'FEMALE' },
  'fr-FR': { name: 'fr-FR-Standard-A', gender: 'FEMALE' },
  'it-IT': { name: 'it-IT-Standard-A', gender: 'FEMALE' },
  // Tilføj flere sprog efter behov
};

// Initialisér cache directory
async function ensureCacheDirectory() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Fejl ved oprettelse af cache mappe:', error);
  }
}

// Generer cache key baseret på tekst og options
async function generateCacheKey(text, options) {
  const key = `${text}-${options.languageCode}-${options.voiceName}-${options.gender}`;
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    key
  );
}

// Check om cached audio er gyldig
async function isValidCache(cacheKey) {
  try {
    const metadata = await AsyncStorage.getItem(`tts_metadata_${cacheKey}`);
    if (!metadata) return false;
    
    const { timestamp } = JSON.parse(metadata);
    return Date.now() - timestamp < CACHE_DURATION;
  } catch {
    return false;
  }
}

export const synthesizeSpeech = async (text, options = {}) => {
  try {
    if (!text?.trim()) {
      throw new Error("Ingen tekst at konvertere");
    }

    if (!GOOGLE_CLOUD_API_KEY) {
      throw new Error("Google Cloud API nøgle mangler");
    }

    // Sikr at cache directory eksisterer
    await ensureCacheDirectory();

    // Brug standard stemme config hvis tilgængelig
    const languageCode = options.languageCode || 'da-DK';
    const voiceConfig = VOICE_CONFIGS[languageCode] || VOICE_CONFIGS['da-DK'];
    const finalOptions = {
      ...voiceConfig,
      ...options,
      languageCode,
    };

    // Check cache
    const cacheKey = await generateCacheKey(text, finalOptions);
    const cacheFile = `${CACHE_DIR}${cacheKey}.mp3`;
    const isCached = await isValidCache(cacheKey);

    if (isCached) {
      console.log('Bruger cached audio');
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri: cacheFile });
      return sound;
    }

    // API request hvis ikke cached
const requestBody = {
  input: { text },
  voice: {
    languageCode: finalOptions.languageCode,
    name: finalOptions.voiceName || voiceConfig.name,
    ssmlGender: finalOptions.gender || voiceConfig.gender,
  },
  audioConfig: {
    audioEncoding: "MP3",
    pitch: finalOptions.pitch || 0,
    speakingRate: finalOptions.speakingRate || 1.0,
    volumeGainDb: 16.0, // Maximum tilladt værdi
    effectsProfileId: ["large-home-entertainment-class-device"],
    // Tilføj høj bitrate og samplerate for bedre lydkvalitet
    sampleRateHertz: 48000,
    audioEncoding: "MP3"
  },
};

// Tilføj SSML tags for ekstra volumen
const textWithEmphasis = `<speak><prosody volume="x-loud">${text}</prosody></speak>`;
requestBody.input = {
  ssml: textWithEmphasis
};

    const response = await fetch(
      `${TTS_API_ENDPOINT}?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TTS API Fejl:", errorText);
      throw new Error(`HTTP fejl: ${response.status}`);
    }

    const data = await response.json();
    if (!data.audioContent) {
      throw new Error("Intet audio modtaget fra API");
    }

    // Gem i cache
    await FileSystem.writeAsStringAsync(cacheFile, data.audioContent, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await AsyncStorage.setItem(
      `tts_metadata_${cacheKey}`,
      JSON.stringify({ timestamp: Date.now() })
    );

    // Indlæs og returner lyd
    const sound = new Audio.Sound();
    await sound.loadAsync({ uri: cacheFile });
    return sound;

  } catch (error) {
    console.error("TTS fejl:", error);
    throw new Error(
      error.message || "Kunne ikke konvertere tekst til tale"
    );
  }
};

// Cache vedligeholdelse
export const cleanupTTSCache = async () => {
  try {
    const cacheDir = await FileSystem.readDirectoryAsync(CACHE_DIR);
    for (const file of cacheDir) {
      const cacheKey = file.replace('.mp3', '');
      if (!(await isValidCache(cacheKey))) {
        await FileSystem.deleteAsync(`${CACHE_DIR}${file}`);
        await AsyncStorage.removeItem(`tts_metadata_${cacheKey}`);
      }
    }
  } catch (error) {
    console.error('Cache cleanup fejl:', error);
  }
};

export const getAvailableVoices = async () => {
  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/voices?key=${GOOGLE_CLOUD_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP fejl: ${response.status}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error("Fejl ved hentning af stemmer:", error);
    throw new Error("Kunne ikke hente tilgængelige stemmer");
  }
};

// Periodisk cache cleanup
setInterval(cleanupTTSCache, 24 * 60 * 60 * 1000); // Hver 24. time