import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";
import { MaterialIcons } from "@expo/vector-icons";


export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Animatable.Text animation="fadeIn" style={styles.title}>
        Scan & Translate
      </Animatable.Text>

      
      <Animatable.View animation="fadeIn" delay={200} style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.scanButton]}
          onPress={() => navigation.navigate("Camera")}
        >
        <MaterialIcons name="camera-alt" size={24} color="white" />
          <MaterialIcons name="camera-alt" size={24} color="#fff" />
          <Text style={styles.buttonText}>Scan Tekst</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.translateButton]}
          onPress={() => navigation.navigate("TextTranslate")}
        >
          <MaterialIcons name="translate" size={24} color="#fff" />
          <Text style={styles.buttonText}>Oversæt Tekst</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate("History")}
      >
        <MaterialIcons name="history" size={24} color="#007AFF" />
        <Text style={styles.historyButtonText}>Se Historik</Text>
      </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButton: {
    backgroundColor: "#007AFF",
  },
  translateButton: {
    backgroundColor: "#34C759",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  historyButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  historyButtonText: {
    color: "#007AFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    marginLeft: 8,
  },
});