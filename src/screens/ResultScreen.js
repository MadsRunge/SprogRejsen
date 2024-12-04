import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";

export default function ResultScreen({ route }) {
  const { translatedText } = route.params || { translatedText: "" };

  const copyToClipboard = () => {
    // Implement clipboard functionality
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeIn" style={styles.resultContainer}>
        <Text style={styles.resultText}>{translatedText}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
          <Text style={styles.buttonText}>Kopier tekst</Text>
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
    alignItems: "center",
  },
  resultText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  copyButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
