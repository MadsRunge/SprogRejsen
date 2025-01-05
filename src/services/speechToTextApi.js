// speechToTextApi.js
import { GOOGLE_CLOUD_API_KEY } from "@env";

const SPEECH_API_ENDPOINT = "https://speech.googleapis.com/v1/speech:recognize";
const STREAMING_ENDPOINT = "https://speech.googleapis.com/v1/speech:streamingRecognize";

// Konfigurationer for forskellige sprog
const LANGUAGE_CONFIGS = {
  'da-DK': { model: 'default' },
  'en-US': { model: 'default' },
  'de-DE': { model: 'default' },
  // Tilføj flere sprog efter behov
};

// Validér og forbered audio data
const prepareAudioData = async (audioBase64) => {
  if (!audioBase64) {
    throw new Error("Ingen lyddata modtaget");
  }

  // Check fil størrelse (max 10MB)
  const sizeInBytes = (audioBase64.length * 3) / 4;
  if (sizeInBytes > 10 * 1024 * 1024) {
    throw new Error("Lydfilen er for stor (max 10MB)");
  }

  return audioBase64;
};

export const transcribeAudio = async (audioBase64, config = {}) => {
  try {
    if (!GOOGLE_CLOUD_API_KEY) {
      throw new Error("Google Cloud API nøgle mangler");
    }

    // Validér og forbered audio
    const preparedAudio = await prepareAudioData(audioBase64);

    // Hent sprog-specifik config
    const languageCode = config.languageCode || 'da-DK';
    const langConfig = LANGUAGE_CONFIGS[languageCode] || LANGUAGE_CONFIGS['da-DK'];

    // Byg request body med forbedrede indstillinger
    const requestBody = {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 48000,
        languageCode,
        model: langConfig.model,
        audioChannelCount: 1,
        enableAutomaticPunctuation: true,
        useEnhanced: true,
        enableWordTimeOffsets: true,
        enableWordConfidence: true,
        profanityFilter: false,
        speechContexts: [
          {
            phrases: [], // Tilføj domæne-specifikke fraser her
            boost: 20,
          },
        ],
        ...config,
      },
      audio: {
        content: preparedAudio,
      },
    };

    // Send request til API
    const response = await fetch(
      `${SPEECH_API_ENDPOINT}?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Speech-to-Text API Fejl:", errorText);
      
      // Håndter specifikke API fejl
      if (response.status === 400) {
        throw new Error("Ugyldigt lydformat eller konfiguration");
      } else if (response.status === 403) {
        throw new Error("API nøgle er ugyldig eller mangler rettigheder");
      } else {
        throw new Error(`API fejl: ${response.status}`);
      }
    }

    const data = await response.json();

    // Validér response data
    if (!data.results || data.results.length === 0) {
      throw new Error(
        "Ingen tale genkendt. Prøv at tale tydeligere eller tjek mikrofonen."
      );
    }

    // Behandl resultaterne
    const results = data.results.map(result => ({
      transcript: result.alternatives[0].transcript,
      confidence: result.alternatives[0].confidence,
      words: result.alternatives[0].words || [],
    }));

    // Samlet transskription og metadata
    return {
      transcription: results.map(r => r.transcript).join(" "),
      confidence: results[0].confidence,
      words: results.flatMap(r => r.words),
      languageCode,
    };

  } catch (error) {
    console.error("Transskriptionsfejl:", error);
    throw new Error(
      error.message || "Kunne ikke genkende tale"
    );
  }
};

// Streaming transskription (real-time)
export class StreamingRecognition {
  constructor(config = {}) {
    this.config = {
      encoding: "LINEAR16",
      sampleRateHertz: 48000,
      languageCode: config.languageCode || 'da-DK',
      enableAutomaticPunctuation: true,
      interimResults: true,
      ...config,
    };
    this.listeners = new Set();
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notify(result) {
    this.listeners.forEach(callback => callback(result));
  }

  // Start streaming recognition
  async start() {
    // Implementation af WebSocket baseret streaming vil blive tilføjet her
    // Dette kræver yderligere setup på server-siden
    // Når ikke at få lavet dette
  }

  // Stop streaming recognition
  async stop() {
    // Cleanup kode for streaming
  }
}