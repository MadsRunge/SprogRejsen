import * as FileSystem from "expo-file-system";
import { GOOGLE_CLOUD_VISION_API_KEY } from "@env";

const VISION_API_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate";

export const recognizeText = async (imageUri) => {
  try {
    if (!GOOGLE_CLOUD_VISION_API_KEY) {
      throw new Error("Google Cloud Vision API key is not configured");
    }

    // Convert image to base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Prepare the request body
    const body = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 1,
            },
          ],
        },
      ],
    };

    // Make the API request
    const response = await fetch(
      `${VISION_API_ENDPOINT}?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Extract the text from the response
    const textAnnotations = data.responses[0]?.textAnnotations;
    if (!textAnnotations || textAnnotations.length === 0) {
      return "";
    }

    // Return the full text (first element contains the entire text)
    return textAnnotations[0].description;
  } catch (error) {
    console.error("Error in recognizeText:", error);
    throw new Error("Kunne ikke genkende teksten i billedet");
  }
};
