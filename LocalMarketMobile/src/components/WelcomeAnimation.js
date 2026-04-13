import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Logo from './Logo';

const { width, height } = Dimensions.get('window');

const WelcomeAnimation = ({ onComplete }) => {
  const letters = "LOKALL".split("");
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-10)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const sloganLetterSpacing = useRef(new Animated.Value(10)).current;
  const progressBarWidth = useRef(new Animated.Value(0)).current;
  
  // Staggered values for letters
  const letterAnims = useRef(letters.map(() => new Animated.Value(80))).current;
  const letterOpacities = useRef(letters.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Sequence the animations
    Animated.sequence([
      // 1. Logo enters
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
        Animated.spring(logoRotate, { toValue: 0, damping: 12, stiffness: 100, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      
      // 2. Letters enter (staggered)
      Animated.stagger(100, letters.map((_, i) => (
        Animated.parallel([
          Animated.timing(letterAnims[i], { toValue: 0, duration: 600, useNativeDriver: true }),
          Animated.timing(letterOpacities[i], { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ))),
      
      // 3. Slogan & Progress Bar
      Animated.parallel([
        Animated.timing(sloganOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(sloganLetterSpacing, { toValue: 4, duration: 1000, useNativeDriver: false }), // can't use native for spacing
        Animated.timing(progressBarWidth, { toValue: 1, duration: 1500, useNativeDriver: false }),
      ])
    ]).start();

    // Pulsing logo ring loop
    Animated.loop(
      Animated.parallel([
        Animated.timing(ringScale, { toValue: 1.2, duration: 2000, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        ])
      ])
    ).start();

    // Call onComplete after animations
    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, []);

  const interpolatedRotate = logoRotate.interpolate({
    inputRange: [-10, 0],
    outputRange: ['-10deg', '0deg']
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Background Orbs (simplified for mobile performance) */}
      <View style={styles.glowOrb} />
      
      <View style={styles.content}>
        {/* LOKALL Logo */}
        <View style={styles.logoContainer}>
          <Animated.View style={[
            styles.logoWrapper,
            { 
              transform: [{ scale: logoScale }, { rotate: interpolatedRotate }],
              opacity: logoOpacity 
            }
          ]}>
             <View style={styles.iconInnerContainer}>
               <Logo size={70} />
             </View>
             <Animated.View style={[
               styles.ring,
               {
                 transform: [{ scale: ringScale }],
                 opacity: ringOpacity
               }
             ]} />
          </Animated.View>
        </View>

        {/* LOKALL Text */}
        <View style={styles.lettersRow}>
          {letters.map((char, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.letter,
                {
                  opacity: letterOpacities[i],
                  transform: [{ translateY: letterAnims[i] }]
                }
              ]}
            >
              {char}
            </Animated.Text>
          ))}
        </View>

        {/* Slogan */}
        <Animated.View style={{ opacity: sloganOpacity }}>
          <Animated.Text style={[styles.slogan, { letterSpacing: sloganLetterSpacing }]}>
            YOUR LOCAL MARKET, DIGITALIZED
          </Animated.Text>
        </Animated.View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
           <Animated.View style={[
             styles.progressBar,
             {
               width: progressBarWidth.interpolate({
                 inputRange: [0, 1],
                 outputRange: ['0%', '100%']
               })
             }
           ]}>
             <LinearGradient 
               colors={['#22d3ee', '#4ade80']} 
               start={{x: 0, y: 0}} 
               end={{x: 1, y: 0}}
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
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
    top: height / 2 - 150,
    left: width / 2 - 150,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  logoWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInnerContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.5)',
  },
  ring: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    zIndex: 1,
  },
  lettersRow: {
    flexDirection: 'row',
    marginBottom: 20,
    overflow: 'hidden',
  },
  letter: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginHorizontal: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 30,
  },
  slogan: {
    fontSize: 10,
    fontWeight: '900',
    color: '#22d3ee',
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 50,
    width: 160,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  gradient: {
    flex: 1,
  }
});

export default WelcomeAnimation;
