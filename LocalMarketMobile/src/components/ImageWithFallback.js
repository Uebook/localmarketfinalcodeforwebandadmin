import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Logo from './Logo';

const ImageWithFallback = ({ source, style, resizeMode = 'cover', ...props }) => {
  const [error, setError] = React.useState(false);

  // If source is a URI and it lacks a valid string or is empty/null string, use fallback
  const isUriInvalid = source && typeof source === 'object' && ('uri' in source) && (
    !source.uri || 
    typeof source.uri !== 'string' || 
    !source.uri.trim() ||
    source.uri === 'null' ||
    source.uri === 'undefined' ||
    source.uri.includes('undefined') ||
    source.uri.includes('null')
  );
  const shouldShowFallback = !source || isUriInvalid || error;

  if (shouldShowFallback) {
    const flatStyle = StyleSheet.flatten(style) || {};
    
    // Improved size detection for percentage or undefined styles
    let detectedSize = 40;
    if (typeof flatStyle.width === 'number') {
      detectedSize = flatStyle.width;
    } else if (typeof flatStyle.height === 'number') {
      detectedSize = flatStyle.height;
    }

    return (
      <View style={[flatStyle, { backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }]}>
        <Logo size={detectedSize * 0.7} />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default ImageWithFallback;
