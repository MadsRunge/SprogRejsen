import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from "react-native-animatable";

const SCREEN_WIDTH = Dimensions.get('window').width;
const PRESET_SIZES = [
  { name: 'S', width: SCREEN_WIDTH * 0.3, height: 100 },
  { name: 'M', width: SCREEN_WIDTH * 0.6, height: 200 },
  { name: 'L', width: SCREEN_WIDTH * 0.8, height: 300 },
];

export const CameraControls = ({
  flashMode,
  frameEnabled,
  toggleFlash,
  toggleFrame,
  handleZoomIn,
  handleZoomOut,
  selectPresetSize,
}) => {
  return (
    <View style={styles.controls}>
      <View style={styles.controlRow}>
        <TouchableOpacity onPress={toggleFlash} style={styles.controlButton}>
          <MaterialIcons
            name={flashMode === 'torch' ? 'flash-on' : 'flash-off'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFrame} style={styles.controlButton}>
          <MaterialIcons
            name={frameEnabled ? 'crop-square' : 'crop-free'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {frameEnabled && (
        <Animatable.View 
          animation="fadeIn" 
          style={styles.presetContainer}
        >
          {PRESET_SIZES.map((preset) => (
            <TouchableOpacity
              key={preset.name}
              style={styles.presetButton}
              onPress={() => selectPresetSize(preset)}
            >
              <Text style={styles.presetText}>{preset.name}</Text>
            </TouchableOpacity>
          ))}
        </Animatable.View>
      )}

      {frameEnabled && (
        <View style={styles.zoomControls}>
          <TouchableOpacity onPress={handleZoomOut} style={styles.controlButton}>
            <MaterialIcons name="zoom-out" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleZoomIn} style={styles.controlButton}>
            <MaterialIcons name="zoom-in" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 30,
    marginHorizontal: 5,
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  presetButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    minWidth: 40,
    alignItems: 'center',
  },
  presetText: {
    color: 'white',
    fontWeight: 'bold',
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
});