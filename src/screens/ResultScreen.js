import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { translateText } from "../services/translateApi";

export default function ResultScreen({ route, navigation }) {
  const { recognizedText } = route.params || { recognizedText: "" };
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const performTranslation = async () => {
      try {
        if (recognizedText) {
          const result = await translateText(recognizedText);
          setTranslatedText(result.translatedText);
          setSourceLanguage(result.sourceLanguage);
        }
      } catch (err) {
        setError("Der opstod en fejl under oversættelsen");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    performTranslation();
  }, [recognizedText]);

  const copyToClipboard = () => {
    // Implement clipboard functionality
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Oversætter tekst...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeIn" style={styles.resultContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Original Tekst:</Text>
          <Text style={styles.resultText}>{recognizedText}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.label}>Oversat Tekst:</Text>
          <Text style={styles.resultText}>{translatedText}</Text>
        </View>

        {sourceLanguage && (
          <Text style={styles.sourceLanguage}>
            Oprindeligt sprog: {sourceLanguage}
          </Text>
        )}

        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
          <Text style={styles.buttonText}>Kopier oversættelse</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
  },
  textContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#666",
  },
  resultText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "left",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
  },
  sourceLanguage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  copyButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});
