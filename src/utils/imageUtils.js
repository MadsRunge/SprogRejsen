import * as ImageManipulator from 'expo-image-manipulator';
import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export const cropImage = async (photoUri, frameMetrics) => {
  try {
    console.log('Cropping with metrics:', frameMetrics);
    
    const imageSize = await ImageManipulator.manipulateAsync(
      photoUri,
      [],
      { compress: 1 }
    ).then(result => ({
      width: result.width,
      height: result.height
    }));
    
    console.log('Original image size:', imageSize);
    
    const scaleX = imageSize.width / SCREEN_WIDTH;
    const scaleY = imageSize.height / SCREEN_HEIGHT;
    
    const crop = {
      originX: Math.floor(frameMetrics.x * scaleX),
      originY: Math.floor(frameMetrics.y * scaleY),
      width: Math.floor(frameMetrics.width * scaleX),
      height: Math.floor(frameMetrics.height * scaleY)
    };
    
    console.log('Calculated crop area:', crop);
    crop.width = Math.min(crop.width, imageSize.width - crop.originX);
    crop.height = Math.min(crop.height, imageSize.height - crop.originY);
    
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      photoUri,
      [{ crop }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    return manipulatedImage.uri;
  } catch (error) {
    console.error("Fejl ved beskæring af billede:", error);
    throw error;
  }
};