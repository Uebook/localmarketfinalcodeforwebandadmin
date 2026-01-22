import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getIconName } from '../utils/iconMapping';
import { useThemeColors } from '../hooks/useThemeColors';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const COLORS = useThemeColors();
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const duration = 3000; // 3 seconds
    const intervalTime = 30; // Update every 30ms
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    // Fade and scale animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Gradient Background - Diagonal from orange-red (top-left) to purple-blue (bottom-right) */}
      <LinearGradient
        colors={['#E86A2C', '#4A6CF7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View 
            style={[
              styles.iconInnerContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Icon name="shopping-bag" size={56} color={COLORS.orange} />
          </Animated.View>
          <Animated.View 
            style={[
              styles.iconBadge,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Icon name="check" size={16} color={COLORS.white} />
          </Animated.View>
        </Animated.View>
        <Text style={styles.title}>LOCAL</Text>
        <Text style={styles.subtitle}>Your City, Your Market.</Text>
      </Animated.View>

      {/* Loading Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { width: `${progress}%` }
            ]} 
          />
        </View>
      </View>

      <Animated.Text 
        style={[
          styles.loadingText,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        Loading Marketplace...
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    alignItems: 'center',
    marginBottom: 100,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  iconInnerContainer: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    letterSpacing: 1,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 80,
    width: 256,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
  loadingText: {
    position: 'absolute',
    bottom: 48,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.white,
  },
});

export default SplashScreen;

