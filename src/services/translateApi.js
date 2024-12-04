import { GOOGLE_CLOUD_API_KEY } from "@env";

const TRANSLATE_API_ENDPOINT =
  "https://translation.googleapis.com/language/translate/v2";

export const translateText = async (text, targetLang = "da") => {
  try {
    if (!text) return "";

    if (!GOOGLE_CLOUD_API_KEY) {
      throw new Error("Google Cloud API Key is not configured");
    }

    console.log("Making request to Translate API...");

    const response = await fetch(
      `${TRANSLATE_API_ENDPOINT}?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          format: "text",
        }),
      }
    );

    console.log("Translate API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Translate API Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Translate API Response:", JSON.stringify(data, null, 2));

    if (!data.data?.translations?.[0]?.translatedText) {
      throw new Error("Unexpected response format from Translate API");
    }

    return {
      translatedText: data.data.translations[0].translatedText,
      sourceLanguage:
        data.data.translations[0].detectedSourceLanguage || "unknown",
    };
  } catch (error) {
    console.error("Error in translateText:", error);
    throw new Error("Kunne ikke oversætte teksten");
  }
};
