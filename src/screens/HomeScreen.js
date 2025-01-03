import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen({ navigation }) {
  const features = [
    {
      title: "Scan Tekst",
      icon: "camera-alt",
      color: "#007AFF",
      onPress: () => navigation.navigate("Camera"),
    },
    {
      title: "Oversæt Tekst",
      icon: "translate",
      color: "#34C759",
      onPress: () => navigation.navigate("TextTranslate"),
    },
    {
      title: "Oversæt Tale",
      icon: "record-voice-over",
      color: "#FF3B30",
      onPress: () => navigation.navigate("Speech"),
    },
    {
      title: "Historik",
      icon: "history",
      color: "#5856D6",
      onPress: () => navigation.navigate("History"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <LinearGradient
        colors={["#007AFF", "#34C759"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="g-translate" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>Scan & Translate</Text>
          <Text style={styles.subtitle}>
            Din intelligente oversættelsesassistent
          </Text>
        </View>
      </LinearGradient>

      {/* Grid Layout */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.gridItem}>
              <TouchableOpacity
                style={[styles.card, { borderColor: `${feature.color}20` }]}
                onPress={feature.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${feature.color}10` },
                  ]}
                >
                  <MaterialIcons
                    name={feature.icon}
                    size={28}
                    color={feature.color}
                  />
                </View>
                <Text style={styles.cardTitle}>{feature.title}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Version Info */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  gridContainer: {
    flex: 1,
    padding: 16,
  },
  grid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "flex-start",
    gap: 16,
    paddingTop: 16,
  },
  gridItem: {
    width: "47%", // Slightly less than 50% to account for gap
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
  },
  version: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginBottom: 16,
  },
});
