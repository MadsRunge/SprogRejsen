import { GOOGLE_CLOUD_API_KEY } from "@env";
import { Audio } from "expo-av";

const TTS_API_ENDPOINT =
  "https://texttospeech.googleapis.com/v1/text:synthesize";

export const synthesizeSpeech = async (text, options = {}) => {
  try {
    if (!text) {
      throw new Error("No text provided");
    }

    if (!GOOGLE_CLOUD_API_KEY) {
      throw new Error("Google Cloud API Key is not configured");
    }

    const requestBody = {
      input: {
        text: text,
      },
      voice: {
        languageCode: options.languageCode || "da-DK",
        name: options.voiceName || "da-DK-Standard-A",
        ssmlGender: options.gender || "FEMALE",
      },
      audioConfig: {
        audioEncoding: "MP3",
        pitch: options.pitch || 0,
        speakingRate: options.speakingRate || 1.0,
      },
    };

    console.log("Making request to Text-to-Speech API...");

    const response = await fetch(
      `${TTS_API_ENDPOINT}?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("Text-to-Speech API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Text-to-Speech API Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.audioContent) {
      throw new Error("No audio content received from API");
    }

    // Konverter base64 audio til en URI som expo-av kan afspille
    const audioUri = `data:audio/mp3;base64,${data.audioContent}`;

    // Opret og afspil lyden
    const soundObject = new Audio.Sound();
    await soundObject.loadAsync({ uri: audioUri });

    return soundObject;
  } catch (error) {
    console.error("Error in synthesizeSpeech:", error);
    throw new Error("Kunne ikke konvertere tekst til tale");
  }
};

// Hjælpefunktion til at få tilgængelige stemmer
export const getAvailableVoices = async () => {
  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/voices?key=${GOOGLE_CLOUD_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error("Error fetching voices:", error);
    throw new Error("Kunne ikke hente tilgængelige stemmer");
  }
};
