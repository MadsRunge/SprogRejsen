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

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate("Camera")}
      >
        <MaterialIcons name="camera-alt" size={24} color="white" />
        <Text style={styles.buttonText}>Scan Tekst</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate("History")}
      >
        <MaterialIcons name="history" size={24} color="#007AFF" />
        <Text style={styles.historyButtonText}>Se Historik</Text>
      </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
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
  },
});
