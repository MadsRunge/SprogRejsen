import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";

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
        <Text style={styles.buttonText}>Scan Tekst</Text>
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
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
