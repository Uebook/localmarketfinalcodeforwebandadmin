import React from 'react';
import { Image } from 'react-native';

const Logo = ({ size = 42 }) => {
  return (
    <Image
      source={require('../assets/finallogo.jpeg')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
};

export default Logo;
