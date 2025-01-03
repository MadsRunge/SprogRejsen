import React, { useState, useEffect, useCallback } from "react";
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

  // Cleanup function for recording
  const cleanupRecording = useCallback(async () => {
    try {
      if (recording) {
        console.log("Cleaning up recording...");
        if (recording._isDoneRecording) {
          console.log("Recording is already done, skipping cleanup");
          return;
        }
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
      }
    } catch (error) {
      console.error("Fejl ved cleanup af optagelse:", error);
    } finally {
      setRecording(null);
    }
  }, [recording]);


  const startRecording = async () => {
    try {
      await cleanupRecording();

      console.log("Requesting permissions...");
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (permissionResponse.status !== "granted") {
        Alert.alert(
          "Tilladelse nødvendig",
          "Vi skal bruge adgang til din mikrofon for at optage tale."
        );
        return;
      }

      console.log("Setting audio mode...");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      console.log("Creating new recording...");
      const newRecording = new Audio.Recording();

      // Configure recording options
      const recordingOptions = {
        isMeteringEnabled: true,
        android: {
          extension: ".wav",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          numberOfChannels: 1,
          bitRate: 128000,
          sampleRate: 48000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 48000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      console.log(
        "Preparing to record with options:",
        JSON.stringify(recordingOptions)
      );
      await newRecording.prepareToRecordAsync(recordingOptions);

      console.log("Starting recording...");
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Fejl ved start af optagelse:", error);
      Alert.alert(
        "Fejl ved optagelse",
        "Kunne ikke starte optagelse. Prøv at genstarte appen."
      );
      await cleanupRecording();
    }
  };

  const stopRecording = async () => {
    if (!recording || !isRecording) return;

    try {
      console.log("Stopping recording...");
      setIsRecording(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await recording.stopAndUnloadAsync();
      console.log("Recording stopped");

      const uri = recording.getURI();
      console.log("Recording URI:", uri);

      if (!uri) {
        throw new Error("Ingen optagelse fundet");
      }

      setIsProcessing(true);

      console.log("Reading audio file...");
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("Audio file read, length:", base64Audio.length);

      console.log("Transcribing audio...");
      const result = await transcribeAudio(base64Audio);
      console.log("Transcription result:", result);

      setTranscribedText(result.transcription);
    } catch (error) {
      console.error("Fejl ved stop af optagelse:", error);
      Alert.alert(
        "Fejl",
        error.message ||
          "Der opstod en fejl under behandling af optagelsen. Prøv igen."
      );
    } finally {
      setIsProcessing(false);
      await cleanupRecording();
    }
  };

  const playTranscribedText = async () => {
    if (!transcribedText || isPlaying) return;

    try {
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
