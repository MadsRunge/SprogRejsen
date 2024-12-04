import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { translateText } from "../services/translateApi";

export default function ResultScreen({ route }) {
  const { recognizedText } = route.params || { recognizedText: "" };
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clean up recognized text to ensure we only have whole words
  const cleanText = (text) => {
    return text
      .replace(/[^\w\s\-.,!?]/g, "") // Remove special characters except basic punctuation
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing whitespace
  };

  useEffect(() => {
    const performTranslation = async () => {
      try {
        if (recognizedText) {
          const cleanedText = cleanText(recognizedText);
          const result = await translateText(cleanedText);
          setTranslatedText(result.translatedText);
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Oversætter...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Animatable.View animation="fadeIn" duration={800} style={styles.content}>
        {/* Original Text Box */}
        <View style={styles.textBox}>
          <Text style={styles.label}>Original tekst</Text>
          <View style={styles.textContainer}>
            <Text style={styles.text}>{cleanText(recognizedText)}</Text>
          </View>
        </View>

        {/* Arrow indicator */}
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>↓</Text>
        </View>

        {/* Translated Text Box */}
        <View style={styles.textBox}>
          <Text style={styles.label}>Dansk oversættelse</Text>
          <View style={styles.textContainer}>
            <Text style={styles.text}>{translatedText}</Text>
          </View>
        </View>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 16,
    textAlign: "center",
  },
  textBox: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginLeft: 4,
  },
  textContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  text: {
    fontSize: 18,
    lineHeight: 24,
    color: "#000",
  },
  arrowContainer: {
    alignItems: "center",
    marginVertical: 5,
  },
  arrow: {
    fontSize: 24,
    color: "#666",
  },
});
