import { GOOGLE_CLOUD_PROJECT_ID } from "@env";

const TRANSLATE_API_ENDPOINT = `https://translation.googleapis.com/v3/projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/global:translateText`;

export const translateText = async (text, targetLang = "da") => {
  try {
    if (!text) return "";

    if (!GOOGLE_CLOUD_PROJECT_ID) {
      throw new Error("Google Cloud Project ID is not configured");
    }

    const response = await fetch(TRANSLATE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [text],
        sourceLanguageCode: "auto",
        targetLanguageCode: targetLang,
        mimeType: "text/plain",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const translation = data.translations[0]?.translatedText || "";

    return {
      translatedText: translation,
      sourceLanguage: data.translations[0]?.detectedSourceLanguage || "unknown",
    };
  } catch (error) {
    console.error("Error in translateText:", error);
    throw new Error("Kunne ikke oversætte teksten");
  }
};
