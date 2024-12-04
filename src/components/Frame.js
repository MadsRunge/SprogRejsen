import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const Frame = ({ 
  frameEnabled, 
  frameSize, 
  framePosition, 
  frameOpacity,
  panResponder,
  resizePanResponder,
}) => {
  if (!frameEnabled) return null;
  
  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.frame,
        {
          width: frameSize.width,
          height: frameSize.height,
          left: framePosition.x,
          top: framePosition.y,
          opacity: frameOpacity,
        },
      ]}
    >
      <View {...resizePanResponder.panHandlers} style={styles.resizeHandle}>
        <MaterialIcons name="open-with" size={20} color="white" />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  frame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  resizeHandle: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});