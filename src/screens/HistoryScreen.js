import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getTranslationHistory } from "../services/firebaseConfig";

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const translations = await getTranslationHistory();
      setHistory(translations);
    } catch (error) {
      setError("Kunne ikke hente oversættelseshistorik");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Dato ikke tilgængelig";

    try {
      // Hvis timestamp er et Firestore timestamp objekt
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString("da-DK", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      // Hvis timestamp er et JavaScript Date objekt eller kan konverteres til et
      const date =
        timestamp instanceof Date
          ? timestamp
          : new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString("da-DK", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Dato ikke tilgængelig";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
          <Text style={styles.retryButtonText}>Prøv igen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.translationCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
              <Text style={styles.languageText}>
                {item.sourceLanguage?.toUpperCase() || "?"} → DA
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.originalText}>{item.originalText}</Text>
              <MaterialIcons name="arrow-downward" size={20} color="#666" />
              <Text style={styles.translatedText}>{item.translatedText}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  translationCard: {
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateText: {
    color: "#666",
    fontSize: 14,
  },
  languageText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  textContainer: {
    gap: 8,
  },
  originalText: {
    fontSize: 16,
    color: "#333",
  },
  translatedText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
