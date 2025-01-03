import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View
        animation="fadeIn"
        duration={800}
        style={styles.contentContainer}
      >
        {/* Header Section with Gradient Background */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={["#007AFF", "#34C759"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Animatable.View
              animation="fadeIn"
              delay={200}
              style={styles.headerContent}
            >
              <View style={styles.logoContainer}>
                <MaterialIcons name="g-translate" size={36} color="#fff" />
              </View>
              <Text style={styles.title}>Scan & Translate</Text>
              <Text style={styles.subtitle}>
                Din intelligente oversættelsesassistent
              </Text>
            </Animatable.View>
          </LinearGradient>
        </View>

        {/* Main Actions Container */}
        <View style={styles.actionsContainer}>
          <View style={styles.mainActions}>
            <Animatable.View animation="fadeInUp" delay={400}>
              <TouchableOpacity
                style={[styles.mainButton, styles.scanButton]}
                onPress={() => navigation.navigate("Camera")}
              >
                <View style={styles.iconContainer}>
                  <MaterialIcons name="camera-alt" size={28} color="#007AFF" />
                </View>
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonTitle}>Scan Tekst</Text>
                  <Text style={styles.buttonSubtext}>
                    Tag et billede af tekst
                  </Text>
                </View>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={20}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={600}>
              <TouchableOpacity
                style={[styles.mainButton, styles.translateButton]}
                onPress={() => navigation.navigate("TextTranslate")}
              >
                <View style={styles.iconContainer}>
                  <MaterialIcons name="translate" size={28} color="#34C759" />
                </View>
                <View style={styles.buttonContent}>
                  <Text style={[styles.buttonTitle, { color: "#34C759" }]}>
                    Oversæt Tekst
                  </Text>
                  <Text style={styles.buttonSubtext}>
                    Indtast eller indsæt tekst
                  </Text>
                </View>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={20}
                  color="#34C759"
                />
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={800}>
              <TouchableOpacity
                style={[styles.mainButton, styles.speechButton]}
                onPress={() => navigation.navigate("Speech")}
              >
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="record-voice-over"
                    size={28}
                    color="#FF3B30"
                  />
                </View>
                <View style={styles.buttonContent}>
                  <Text style={[styles.buttonTitle, { color: "#FF3B30" }]}>
                    Oversæt Tale
                  </Text>
                  <Text style={styles.buttonSubtext}>
                    Optag og oversæt tale
                  </Text>
                </View>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={20}
                  color="#FF3B30"
                />
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={1000}>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => navigation.navigate("History")}
              >
                <LinearGradient
                  colors={["#007AFF", "#34C759"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.historyGradient}
                >
                  <MaterialIcons name="history" size={24} color="#fff" />
                  <Text style={styles.historyButtonText}>
                    Se Oversættelseshistorik
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </View>

        {/* Version Info */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </Animatable.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    flex: 1,
  },
  headerSection: {
    height: "35%",
  },
  headerGradient: {
    height: "100%",
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 20,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  actionsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  mainActions: {
    gap: 16,
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flex: 1,
    marginLeft: 16,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  buttonSubtext: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
  scanButton: {
    borderColor: "#007AFF20",
  },
  translateButton: {
    borderColor: "#34C75920",
  },
  speechButton: {
    borderColor: "#FF3B3020",
  },
  historyButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  historyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  historyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginBottom: 16,
    marginTop: 8,
  },
});
