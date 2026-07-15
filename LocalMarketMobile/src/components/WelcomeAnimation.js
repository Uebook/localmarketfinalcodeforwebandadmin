import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Logo from './Logo';

const { width, height } = Dimensions.get('window');

const WelcomeAnimation = ({ onComplete }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-15)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const progressBarWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Concurrent animations for smooth splash
    Animated.parallel([
      // Logo springs in smoothly
      Animated.spring(logoScale, {
        toValue: 1,
        damping: 14,
        stiffness: 90,
        useNativeDriver: true,
      }),
      Animated.spring(logoRotate, {
        toValue: 0,
        damping: 14,
        stiffness: 90,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      
      // Progress bar loading animation
      Animated.timing(progressBarWidth, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Continuous pulsing glow ring animation behind the logo
    Animated.loop(
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1.35,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Complete loader after animations
    const timer = setTimeout(onComplete, 2600);
    return () => clearTimeout(timer);
  }, []);

  const interpolatedRotate = logoRotate.interpolate({
    inputRange: [-15, 0],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Background Orbs */}
      <View style={styles.glowOrb} />
      
      <View style={styles.content}>
        {/* LOKALL Logo Container */}
        <View style={styles.logoContainer}>
          {/* Pulsing outer glowing ring */}
          <Animated.View
            style={[
              styles.ring,
              {
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              },
            ]}
          />
          
          {/* Circular logo wrapper badge */}
          <Animated.View
            style={[
              styles.logoWrapper,
              { 
                transform: [{ scale: logoScale }, { rotate: interpolatedRotate }],
                opacity: logoOpacity,
              },
            ]}
          >
            <Logo size={180} />
          </Animated.View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressBarWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <LinearGradient 
              colors={['#3B82F6', '#22C55E']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowOrb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    top: height / 2 - 160,
    left: width / 2 - 160,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 50,
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 180,
    height: 180,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    zIndex: 0,
  },
  progressContainer: {
    marginTop: 20,
    width: 160,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
});

export default WelcomeAnimation;
