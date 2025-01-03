import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { transcribeAudio } from "../services/speechToTextApi";
import { synthesizeSpeech } from "../services/textToSpeechApi";
import { translateText } from "../services/translateApi";
import { saveTranslation } from "../services/firebaseConfig";

// Sprog der understøttes af alle tre APIs (Speech, Translate, TTS)
const SUPPORTED_LANGUAGES = {
  'da-DK': { name: 'Dansk', code: 'da' },
  'en-US': { name: 'Engelsk', code: 'en' },
  'de-DE': { name: 'Tysk', code: 'de' },
  'es-ES': { name: 'Spansk', code: 'es' },
  'fr-FR': { name: 'Fransk', code: 'fr' },
  'it-IT': { name: 'Italiensk', code: 'it' },
  'nl-NL': { name: 'Hollandsk', code: 'nl' },
  'pl-PL': { name: 'Polsk', code: 'pl' },
  'pt-PT': { name: 'Portugisisk', code: 'pt' },
  'ru-RU': { name: 'Russisk', code: 'ru' }
};

export default function SpeechScreen() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('da-DK');
  const [targetLanguage, setTargetLanguage] = useState('en-US');
  const [selectedLanguageType, setSelectedLanguageType] = useState(null); // 'source' eller 'target'
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState(null);

  useEffect(() => {
    return () => {
      if (recordingTimer) clearInterval(recordingTimer);
      cleanupRecording();
    };
  }, []);

  const cleanupRecording = useCallback(async () => {
    try {
      if (recording) {
        if (recording._isDoneRecording) return;
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
      }
    } catch (error) {
      console.error("Fejl ved cleanup:", error);
    } finally {
      setRecording(null);
    }
  }, [recording]);

  const startRecording = async () => {
    try {
      await cleanupRecording();
      
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (permissionResponse.status !== "granted") {
        Alert.alert(
          "Tilladelse nødvendig",
          "Vi skal bruge adgang til din mikrofon for at optage tale."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const newRecording = new Audio.Recording();
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

      await newRecording.prepareToRecordAsync(recordingOptions);
      await newRecording.startAsync();
      
      // Start timer for optagelsesvarighed
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Optagelsesfejl:", error);
      Alert.alert("Fejl", "Kunne ikke starte optagelse. Prøv igen.");
      await cleanupRecording();
    }
  };

  const stopRecording = async () => {
    if (!recording || !isRecording) return;

    try {
      setIsRecording(false);
      if (recordingTimer) clearInterval(recordingTimer);
      setRecordingTimer(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) throw new Error("Ingen optagelse fundet");

      setIsProcessing(true);
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Transskribér audio til tekst
      const result = await transcribeAudio(base64Audio, {
        languageCode: sourceLanguage
      });
      setTranscribedText(result.transcription);

      // Oversæt teksten
      if (sourceLanguage !== targetLanguage) {
        const translation = await translateText(
          result.transcription,
          SUPPORTED_LANGUAGES[targetLanguage].code
        );
        setTranslatedText(translation.translatedText);

        // Gem i historik
        await saveTranslation({
          originalText: result.transcription,
          translatedText: translation.translatedText,
          sourceLanguage: SUPPORTED_LANGUAGES[sourceLanguage].code,
          targetLanguage: SUPPORTED_LANGUAGES[targetLanguage].code,
          source: 'voice'
        });
      }

    } catch (error) {
      console.error("Fejl ved behandling:", error);
      Alert.alert(
        "Fejl",
        error.message || "Der opstod en fejl. Prøv igen."
      );
    } finally {
      setIsProcessing(false);
      setRecordingDuration(0);
      await cleanupRecording();
    }
  };

  //I SpeechScreen.js, opdater playTranslatedText funktionen:

const playTranslatedText = async () => {
  if (!translatedText || isPlaying) return;

  try {
    setIsPlaying(true);
    
    // Sikr at system lydstyrke er høj
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,  // Undgå at andre apps reducerer lydstyrken
    });

    const sound = await synthesizeSpeech(translatedText, {
      languageCode: targetLanguage,
    });

    // Maksimer lydstyrken
    await sound.setVolumeAsync(1.0);
    
    // Indstil høj afspilningskvalitet
    await sound.setRateAsync(1.0, true);
    
    // Sikr at lyden afspilles gennem hovedhøjtaler
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,  // Brug hovedhøjtaler på Android
    });

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
        sound.unloadAsync();
      }
    });

    await sound.playAsync();
  } catch (error) {
    console.error("Afspilningsfejl:", error);
    Alert.alert("Fejl", "Kunne ikke afspille oversættelsen");
    setIsPlaying(false);
  }
};

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openLanguageSelection = (type) => {
    setSelectedLanguageType(type);
    setShowLanguageModal(true);
  };

  const selectLanguage = (langKey) => {
    if (selectedLanguageType === 'source') {
      setSourceLanguage(langKey);
    } else {
      setTargetLanguage(langKey);
    }
    setShowLanguageModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Tale til Tale Oversættelse</Text>
          
          {/* Sprog-vælgere */}
          <View style={styles.languageSelector}>
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => openLanguageSelection('source')}
            >
              <Text style={styles.languageButtonText}>
                Fra: {SUPPORTED_LANGUAGES[sourceLanguage].name}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#007AFF" />
            </TouchableOpacity>
            
            <MaterialIcons name="swap-horiz" size={24} color="#666" 
              onPress={() => {
                const temp = sourceLanguage;
                setSourceLanguage(targetLanguage);
                setTargetLanguage(temp);
              }}
            />
            
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => openLanguageSelection('target')}
            >
              <Text style={styles.languageButtonText}>
                Til: {SUPPORTED_LANGUAGES[targetLanguage].name}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hoved-indhold */}
        <View style={styles.contentContainer}>
          {transcribedText ? (
            <>
              <View style={styles.transcriptionCard}>
                <Text style={styles.cardTitle}>Original Tale:</Text>
                <Text style={styles.transcriptionText}>{transcribedText}</Text>
              </View>
              
              {translatedText && (
                <View style={[styles.transcriptionCard, styles.translationCard]}>
                  <Text style={styles.cardTitle}>Oversættelse:</Text>
                  <Text style={styles.transcriptionText}>{translatedText}</Text>
                  
                  <TouchableOpacity
                    style={[styles.playButton, isPlaying && styles.disabledButton]}
                    onPress={playTranslatedText}
                    disabled={isPlaying}
                  >
                    {isPlaying ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <MaterialIcons name="volume-up" size={24} color="#fff" />
                        <Text style={styles.playButtonText}>Afspil Oversættelse</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.placeholderCard}>
              <MaterialIcons name="record-voice-over" size={48} color="#666" />
              <Text style={styles.placeholderText}>
                Tryk og hold mikrofonknappen for at optage
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Kontrolsektion */}
      <View style={styles.controlsSection}>
        {isRecording && (
          <View style={styles.recordingInfo}>
            <Text style={styles.recordingDuration}>
              {formatDuration(recordingDuration)}
            </Text>
            <Text style={styles.recordingText}>Optager...</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordingButton,
            isProcessing && styles.processingButton
          ]}
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

      {/* Sprog-vælger Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Vælg {selectedLanguageType === 'source' ? 'kildesprog' : 'målsprog'}
            </Text>
            
            <ScrollView>
              {Object.entries(SUPPORTED_LANGUAGES).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.languageOption}
                  onPress={() => selectLanguage(key)}
                >
                  <Text style={styles.languageOptionText}>{value.name}</Text>
                  {((selectedLanguageType === 'source' && key === sourceLanguage) ||
                    (selectedLanguageType === 'target' && key === targetLanguage)) && (
                    <MaterialIcons name="check" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.closeButtonText}>Luk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  languageButtonText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  transcriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  translationCard: {
    backgroundColor: '#f8f9ff',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  transcriptionText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
  },
  placeholderCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  controlsSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  recordingInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingDuration: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 4,
  },
  recordingText: {
    fontSize: 16,
    color: '#666',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
    transform: [{ scale: 1.1 }],
  },
  processingButton: {
    backgroundColor: '#666',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
  });