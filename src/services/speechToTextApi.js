import { GOOGLE_CLOUD_API_KEY } from "@env";

const SPEECH_API_ENDPOINT = "https://speech.googleapis.com/v1/speech:recognize";

export const transcribeAudio = async (audioBase64, config = {}) => {
  try {
    if (!audioBase64) {
      throw new Error("No audio data provided");
    }

    if (!GOOGLE_CLOUD_API_KEY) {
      throw new Error("Google Cloud API Key is not configured");
    }

    const requestBody = {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 48000,
        languageCode: "da-DK",
        model: "default",
        audioChannelCount: 1,
        enableAutomaticPunctuation: true,
        useEnhanced: true,
        ...config,
      },
      audio: {
        content: audioBase64,
      },
    };

    console.log(
      "Making request to Speech-to-Text API with config:",
      JSON.stringify(requestBody.config)
    );

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

    console.log("Speech-to-Text API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Speech-to-Text API Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Speech-to-Text API Response:", JSON.stringify(data, null, 2));

    if (!data.results || data.results.length === 0) {
      console.error(
        "No transcription results in response:",
        JSON.stringify(data)
      );
      throw new Error(
        "Ingen tale blev genkendt. Prøv at tale tydeligere eller tjek din mikrofon."
      );
    }

    // Return the transcribed text from all results
    const transcription = data.results
      .map((result) => result.alternatives[0].transcript)
      .join(" ");

    return {
      transcription,
      confidence: data.results[0].alternatives[0].confidence,
    };
  } catch (error) {
    console.error("Error in transcribeAudio:", error);
    throw error;
  }
};
