import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Picker } from '@react-native-picker/picker';

import { translateText } from '../services/translateApi';
import { saveTranslation } from '../services/firebaseConfig';

export default function TextTranslateScreen({ navigation }) {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('da');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade oversættelse ind/ud
  useEffect(() => {
    if (translatedText) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [translatedText]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    Keyboard.dismiss();
    setIsLoading(true);
    setError(null);

    try {
      // Oversæt teksten
      const result = await translateText(inputText, targetLanguage);
      setTranslatedText(result.translatedText || '');
      setSourceLanguage(result.sourceLanguage || 'unknown');

      // Gem oversættelsen i Firebase
      setIsSaving(true);
      await saveTranslation({
        originalText: inputText,
        translatedText: result.translatedText,
        sourceLanguage: result.sourceLanguage || 'unknown',
        targetLanguage: targetLanguage,
        source: 'text'
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      if (err.message?.includes('Network')) {
        setError('Ingen internetforbindelse. Tjek venligst din netværksstatus.');
      } else {
        setError('Der opstod en fejl: ' + (err.message || 'Ukendt fejl'));
      }
      console.error(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    await Clipboard.setStringAsync(text);
    setCopiedText(type);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const clearInput = () => {
    setInputText('');
    setTranslatedText('');
    setSourceLanguage('');
    setError(null);
    Haptics.selectionAsync();
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setInputText(text);
        Haptics.selectionAsync();
      }
    } catch (err) {
      console.error('Fejl ved indsættelse fra udklipsholder:', err);
    }
  };

  const swapLanguages = () => {
    if (!sourceLanguage || sourceLanguage === 'unknown') return;
    const newTargetLang = sourceLanguage.toLowerCase();
    setSourceLanguage(targetLanguage);
    setTargetLanguage(newTargetLang);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Kildetekst</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Skriv eller indsæt tekst her... (Tip: 'Indsæt'-ikon)"
            value={inputText}
            onChangeText={setInputText}
            textAlignVertical="top"
          />
          <View style={styles.inputActions}>
            {inputText ? (
              <TouchableOpacity
                onPress={clearInput}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <MaterialIcons name="clear" size={24} color="#666" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={pasteFromClipboard}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <MaterialIcons name="content-paste" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.languagePickerContainer}>
          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Vælg målsprog:</Text>
            <Picker
              selectedValue={targetLanguage}
              onValueChange={(itemValue) => setTargetLanguage(itemValue)}
              style={{ width: 140 }}
            >
              <Picker.Item label="Dansk (da)" value="da" />
              <Picker.Item label="Engelsk (en)" value="en" />
              <Picker.Item label="Tysk (de)" value="de" />
            </Picker>
          </View>

          <TouchableOpacity
            onPress={swapLanguages}
            style={styles.swapButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="swap-horiz" size={24} color="#007AFF" />
            <Text style={styles.swapButtonText}>Byt sprog</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={24} color="red" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {sourceLanguage && translatedText && (
          <View style={styles.languageBar}>
            <MaterialIcons name="translate" size={20} color="#666" />
            <Text style={styles.languageText}>
              Fra: {sourceLanguage.toUpperCase()} → Til: {targetLanguage.toUpperCase()}
            </Text>
          </View>
        )}

        {translatedText && (
          <Animated.View style={[styles.translationContainer, { opacity: fadeAnim }]}>
            <View style={styles.translationHeader}>
              <Text style={styles.translationTitle}>Oversættelse</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(translatedText, 'translation')}
                style={styles.copyButton}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={copiedText === 'translation' ? 'check' : 'content-copy'}
                  size={24}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.translatedText}>{translatedText}</Text>
          </Animated.View>
        )}

        <TouchableOpacity
          style={[
            styles.translateButton,
            (!inputText.trim() || isLoading || isSaving) && styles.disabledButton,
          ]}
          onPress={handleTranslate}
          disabled={!inputText.trim() || isLoading || isSaving}
          activeOpacity={0.7}
        >
          {isLoading || isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="translate" size={24} color="#fff" />
              <Text style={styles.buttonText}>Oversæt nu</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

//
// --- STYLES ---
//
const PRIMARY_COLOR = '#007AFF';
const BG_COLOR = '#f5f5f5';
const CARD_COLOR = '#fff';
const TEXT_COLOR = '#333';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: TEXT_COLOR,
  },
  inputContainer: {
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  input: {
    minHeight: 120,
    padding: 16,
    fontSize: 16,
    color: TEXT_COLOR,
    lineHeight: 24,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  iconButton: {
    padding: 8,
  },
  languagePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#333',
  },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swapButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginLeft: 8,
    fontSize: 14,
  },
  languageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_COLOR,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  languageText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  translationContainer: {
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  translationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  translationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  copyButton: {
    padding: 8,
  },
  translatedText: {
    fontSize: 16,
    lineHeight: 24,
    color: TEXT_COLOR,
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
});