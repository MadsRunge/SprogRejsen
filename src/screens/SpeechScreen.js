import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { transcribeAudio } from "../services/speechToTextApi";
import { synthesizeSpeech } from "../services/textToSpeechApi";

export default function SpeechScreen() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      // Anmod om tilladelser
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (permissionResponse.status !== "granted") {
        Alert.alert(
          "Tilladelse nødvendig",
          "Vi skal bruge adgang til din mikrofon for at optage tale."
        );
        return;
      }

      // Konfigurer audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start optagelse
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Fejl ved start af optagelse:", error);
      Alert.alert("Fejl", "Kunne ikke starte optagelse");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const uri = recording.getURI();
      setIsProcessing(true);

      // Konverter optagelsen til base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send til Speech-to-Text API
      const result = await transcribeAudio(base64Audio);
      setTranscribedText(result.transcription);

      // Ryd optagelsen
      setRecording(null);
    } catch (error) {
      console.error("Fejl ved stop af optagelse:", error);
      Alert.alert("Fejl", "Kunne ikke behandle optagelsen");
    } finally {
      setIsProcessing(false);
    }
  };

  const playTranscribedText = async () => {
    try {
      if (!transcribedText) return;

      setIsPlaying(true);
      const sound = await synthesizeSpeech(transcribedText);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error("Fejl ved afspilning:", error);
      Alert.alert("Fejl", "Kunne ikke afspille teksten");
      setIsPlaying(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Tale til Tale</Text>
        <Text style={styles.subtitle}>
          Hold knappen nede for at optage din tale
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {transcribedText ? (
          <View style={styles.transcriptionCard}>
            <Text style={styles.transcriptionTitle}>Din Tale:</Text>
            <Text style={styles.transcriptionText}>{transcribedText}</Text>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <MaterialIcons name="record-voice-over" size={48} color="#666" />
            <Text style={styles.placeholderText}>
              Din transskriberede tale vil vises her
            </Text>
          </View>
        )}
      </View>

      {/* Controls Section */}
      <View style={styles.controlsSection}>
        {transcribedText && (
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.disabledButton]}
            onPress={playTranscribedText}
            disabled={isPlaying}
          >
            {isPlaying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="volume-up" size={24} color="#fff" />
                <Text style={styles.playButtonText}>Afspil Tale</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <MaterialIcons
              name={isRecording ? "mic" : "mic-none"}
              size={32}
              color="#fff"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerSection: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  transcriptionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transcriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  transcriptionText: {
    fontSize: 18,
    color: "#333",
    lineHeight: 24,
  },
  placeholderCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  controlsSection: {
    padding: 20,
    gap: 16,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: "#FF3B30",
    transform: [{ scale: 1.1 }],
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
