import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Clipboard,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { MaterialIcons } from "@expo/vector-icons";
import { translateText } from "../services/translateApi";

export default function ResultScreen({ route, navigation }) {
  const { recognizedText } = route.params || { recognizedText: "" };
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

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

  const copyToClipboard = async (text, type) => {
    await Clipboard.setString(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000); // Reset efter 2 sekunder
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Oversætter tekst...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="red" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Prøv igen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} bounces={false}>
      <Animatable.View
        animation="fadeIn"
        duration={600}
        style={styles.resultContainer}
      >
        {sourceLanguage && (
          <View style={styles.languageBar}>
            <MaterialIcons name="translate" size={20} color="#666" />
            <Text style={styles.languageText}>
              Fra: {sourceLanguage.toUpperCase()} → Til: DA
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Original Tekst</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(recognizedText, "original")}
            >
              <MaterialIcons
                name={copiedText === "original" ? "check" : "content-copy"}
                size={20}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardText}>{recognizedText}</Text>
        </View>

        <View style={[styles.card, styles.translatedCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Dansk Oversættelse</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(translatedText, "translated")}
            >
              <MaterialIcons
                name={copiedText === "translated" ? "check" : "content-copy"}
                size={20}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardText}>{translatedText}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.newScanButton]}
            onPress={() => navigation.navigate("Camera")}
          >
            <MaterialIcons name="camera-alt" size={24} color="white" />
            <Text style={styles.actionButtonText}>Ny Scanning</Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  resultContainer: {
    padding: 16,
    paddingTop: 8,
  },
  languageBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  languageText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  translatedCard: {
    backgroundColor: "#f8f9ff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  copyButton: {
    padding: 8,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  actionButtons: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#007AFF",
  },
  newScanButton: {
    backgroundColor: "#007AFF",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
