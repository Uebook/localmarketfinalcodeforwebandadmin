import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Logo = ({ size = 42, transparent = false }) => {
  const scale = size / 200; // Original SVG was 200x200
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Official dark blue circle background */}
      {!transparent && (
        <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#1a3aad' }]} />
      )}

      {/* Vertical bar of L (Official Teal/Green) */}
      <LinearGradient
        colors={['#22ee88', '#22ccaa']}
        style={[
          styles.verticalBar,
          {
            left: 60 * scale,
            top: 38 * scale,
            width: 30 * scale,
            height: 110 * scale,
            borderRadius: 14 * scale,
          },
        ]}
      />

      {/* Horizontal bar of L (Official Teal/Blue) */}
      <LinearGradient
        colors={['#22ccaa', '#44aaee']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.horizontalBar,
          {
            left: 60 * scale,
            top: 118 * scale,
            width: 90 * scale,
            height: 30 * scale,
            borderRadius: 14 * scale,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    backgroundColor: '#1a3aad',
    position: 'absolute',
  },
  verticalBar: {
    position: 'absolute',
  },
  horizontalBar: {
    position: 'absolute',
  },
});

export default Logo;
