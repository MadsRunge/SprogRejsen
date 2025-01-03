import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

export default function HomeScreen({ navigation }) {
  const renderFeatureButton = (feature) => {
    return (
      <TouchableOpacity
        key={feature.id}
        style={[
          styles.featureButton,
          { borderColor: feature.color + '40' } // Tilføjer 25% opacity version af farven
        ]}
        onPress={() => navigation.navigate(feature.route)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
          <MaterialIcons name={feature.icon} size={32} color="#fff" />
        </View>
        <Text style={styles.featureTitle}>{feature.title}</Text>
      </TouchableOpacity>
    );
  };

  const features = [
    {
      id: 'camera',
      title: 'Scan Tekst',
      icon: 'camera-alt',
      color: '#3B82F6',  // Bright blue
      route: 'Camera'
    },
    {
      id: 'text',
      title: 'Oversæt Tekst',
      icon: 'translate',
      color: '#10B981',  // Emerald green
      route: 'TextTranslate'
    },
    {
      id: 'speech',
      title: 'Tale Oversættelse',
      icon: 'record-voice-over',
      color: '#F97316',  // Orange
      route: 'Speech'
    },
    {
      id: 'history',
      title: 'Historik',
      icon: 'history',
      color: '#8B5CF6',  // Purple
      route: 'History'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#3730A3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Decorative circles */}
        <Animatable.View animation="fadeIn" duration={1500} style={[styles.decorativeCircle, styles.circle1]} />
        <Animatable.View animation="fadeIn" duration={1500} style={[styles.decorativeCircle, styles.circle2]} />
        <Animatable.View animation="fadeIn" duration={1500} style={[styles.decorativeCircle, styles.circle3]} />
        
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000} 
          style={styles.headerContent}
        >
          <View style={styles.iconWrapper}>
            <MaterialIcons name="g-translate" size={32} color="#fff" />
          </View>
          
          <View style={styles.titleContainer}>
            <Animatable.Text 
              animation="fadeInRight" 
              delay={300} 
              style={styles.title}
            >
              Scan & Translate
            </Animatable.Text>
            <Animatable.View 
              animation="fadeInRight" 
              delay={500} 
              style={styles.subtitleWrapper}
            >
              <MaterialIcons name="auto-awesome" size={16} color="#FFD700" style={styles.star} />
              <Text style={styles.subtitle}>Oversæt alt med ét klik</Text>
            </Animatable.View>
          </View>
        </Animatable.View>

        {/* Wave decoration at bottom */}
        <View style={styles.wave}>
          <Animatable.View 
            animation="fadeInUp" 
            delay={200} 
            style={styles.waveEffect} 
          />
        </View>
      </LinearGradient>

      {/* Features Grid */}
      <View style={styles.content}>
        <View style={styles.grid}>
          {features.map(renderFeatureButton)}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 220,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
    zIndex: 2,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 6,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  decorativeCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
  },
  circle1: {
    width: 150,
    height: 150,
    top: -30,
    right: -30,
  },
  circle2: {
    width: 100,
    height: 100,
    top: 40,
    right: 40,
  },
  circle3: {
    width: 60,
    height: 60,
    top: 90,
    right: 100,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  waveEffect: {
    position: 'absolute',
    bottom: -10,
    left: -5,
    right: -5,
    height: 50,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 40,
  },
  featureButton: {
    width: 160,  // Fast bredde baseret på største knap
    height: 140, // Fast højde for alle knapper
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    width: '100%',  // Sikrer at teksten holder sig inden for knappen
  }
});