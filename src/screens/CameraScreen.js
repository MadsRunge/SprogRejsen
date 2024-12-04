// CameraScreen.js
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();

  const handleCapture = async () => {
    try {
      const photo = await cameraView.current.takePictureAsync({
        quality: 1,
        base64: true,
      });

      // Her vil vi senere implementere Google Vision API
      navigation.navigate("Result", {
        translatedText: "Test oversættelse",
      });
    } catch (error) {
      console.error("Fejl ved billedtagning:", error);
    }
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
      <CameraView style={styles.camera} facing="back">
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          style={styles.guideFrame}
        />
        <View style={styles.overlay}>
          <Text style={styles.guideText}>Placer teksten inden for rammen</Text>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
          >
            <Text style={styles.buttonText}>Tag Billede</Text>
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
  },
  message: {
    textAlign: "center",
    fontSize: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
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
  guideFrame: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    height: 200,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
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
});
