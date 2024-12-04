import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  PanResponder,
  Dimensions,
  Animated,
} from "react-native";
import { Frame } from '../components/Frame';
import { CameraControls } from '../components/CameraControls';
import { cropImage } from '../utils/imageUtils';
import * as FileSystem from "expo-file-system";
import { recognizeText } from "../services/visionApi";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MIN_FRAME_SIZE = 100;

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState('off');
  const [frameEnabled, setFrameEnabled] = useState(false);
  const [frameSize, setFrameSize] = useState({
    width: SCREEN_WIDTH * 0.6,
    height: 200
  });
  const [framePosition, setFramePosition] = useState({
    x: (SCREEN_WIDTH - (SCREEN_WIDTH * 0.6)) / 2,
    y: (SCREEN_HEIGHT - 200) / 2,
  });
  const [zoom, setZoom] = useState(0);
  const frameOpacity = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const { dx, dy } = gestureState;
      setFramePosition(prev => ({
        x: Math.max(0, Math.min(prev.x + dx, SCREEN_WIDTH - frameSize.width)),
        y: Math.max(0, Math.min(prev.y + dy, SCREEN_HEIGHT - frameSize.height)),
      }));
    },
  });

  const resizePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const { dx, dy } = gestureState;
      setFrameSize(prev => ({
        width: Math.max(MIN_FRAME_SIZE, Math.min(prev.width + dx, SCREEN_WIDTH)),
        height: Math.max(MIN_FRAME_SIZE, Math.min(prev.height + dy, SCREEN_HEIGHT)),
      }));
    },
  });

  const toggleFrame = () => {
    if (frameEnabled) {
      Animated.timing(frameOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setFrameEnabled(false));
    } else {
      setFrameEnabled(true);
      Animated.timing(frameOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 0.8));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0));
  };

  const selectPresetSize = (preset) => {
    setFrameSize(preset);
    setFramePosition({
      x: (SCREEN_WIDTH - preset.width) / 2,
      y: (SCREEN_HEIGHT - preset.height) / 2,
    });
  };

  const handleCapture = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
        skipProcessing: false,
        exif: true
      });

      console.log('Original photo size:', { width: photo.width, height: photo.height });

      let textToRecognize;
      
      if (frameEnabled) {
        const frameMetrics = {
          x: framePosition.x,
          y: framePosition.y,
          width: frameSize.width,
          height: frameSize.height
        };
        
        console.log('Frame metrics:', frameMetrics);
        
        const croppedUri = await cropImage(photo.uri, frameMetrics);
        textToRecognize = await recognizeText(croppedUri);
        
        await FileSystem.deleteAsync(croppedUri).catch(console.error);
      } else {
        textToRecognize = await recognizeText(photo.uri);
      }

      if (!textToRecognize || textToRecognize.length === 0) {
        Alert.alert(
          "Ingen tekst fundet",
          "Prøv at justere kameraets position eller brug flash i mørke omgivelser"
        );
        return;
      }

      navigation.navigate("Result", {
        recognizedText: textToRecognize,
      });

    } catch (error) {
      console.error("Fejl ved billedtagning:", error);
      Alert.alert(
        "Fejl",
        error.message || "Der opstod en fejl under scanning af teksten. Prøv venligst igen."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFlash = () => {
    setFlashMode(prev => prev === 'off' ? 'torch' : 'off');
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Indlæser kamera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Vi har brug for adgang til dit kamera for at kunne scanne tekst
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Giv adgang til kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        flash={flashMode}
        zoom={zoom}
      >
        <CameraControls
          flashMode={flashMode}
          frameEnabled={frameEnabled}
          toggleFlash={toggleFlash}
          toggleFrame={toggleFrame}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          selectPresetSize={selectPresetSize}
        />

        <Frame
          frameEnabled={frameEnabled}
          frameSize={frameSize}
          framePosition={framePosition}
          frameOpacity={frameOpacity}
          panResponder={panResponder}
          resizePanResponder={resizePanResponder}
        />

        <View style={styles.overlay}>
          <Text style={styles.guideText}>
            {frameEnabled 
              ? "Træk i rammen for at flytte den\nTræk i hjørnet for at ændre størrelse"
              : "Sigt kameraet mod teksten"}
          </Text>
          
          <TouchableOpacity
            style={[styles.captureButton, isProcessing && styles.disabledButton]}
            onPress={handleCapture}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Tag Billede</Text>
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: '#000',
  },
  message: {
    textAlign: "center",
    fontSize: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    color: '#fff',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  guideText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  captureButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
});