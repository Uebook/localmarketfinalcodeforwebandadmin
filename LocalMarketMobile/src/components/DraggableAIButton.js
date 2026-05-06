import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
    View,
    StyleSheet,
    PanResponder,
    Animated,
    TouchableOpacity,
    Dimensions,
    Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeColors } from '../hooks/useThemeColors';

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = 64;

const DraggableAIButton = ({ onPress }) => {
    // 1. Initial Position constants
    const initialPos = {
        x: width - BUTTON_SIZE - 20,
        y: height - BUTTON_SIZE - 160 // Increased margin to clear tab bar
    };

    // 2. State & Animated Values
    const [isDragging, setIsDragging] = useState(false);
    
    // Lazy initialize Animated Values to be safe with React 19 dispatcher
    const pan = useRef(new Animated.ValueXY(initialPos)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // 3. Pulse Animation
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.12,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    // 4. PanResponder memoized to prevent recreation on every render
    const panResponder = useMemo(() => 
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: pan.x._value,
                    y: pan.y._value,
                });
                pan.setValue({ x: 0, y: 0 });
                setIsDragging(true);
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (e, gestureState) => {
                pan.flattenOffset();
                setIsDragging(false);

                let finalX = pan.x._value;
                let finalY = pan.y._value;

                // Simple boundaries
                if (finalX < 10) finalX = 10;
                if (finalX > width - BUTTON_SIZE - 10) finalX = width - BUTTON_SIZE - 10;
                if (finalY < 60) finalY = 60;
                if (finalY > height - BUTTON_SIZE - 140) finalY = height - BUTTON_SIZE - 140; // Prevent hiding behind tab bar

                Animated.spring(pan, {
                    toValue: { x: finalX, y: finalY },
                    useNativeDriver: false,
                }).start();
            },
        }), [pan]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateX: pan.x }, 
                        { translateY: pan.y },
                        { scale: pulseAnim }
                    ],
                },
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity
                onPress={() => {
                    if (!isDragging && onPress) {
                        onPress();
                    }
                }}
                activeOpacity={0.9}
                style={styles.touchable}
            >
                <View style={styles.glowContainer}>
                     <LinearGradient
                        colors={['#8B5CF6', '#3B82F6', '#2DD4BF']} 
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    >
                        <Icon name="robot-happy-outline" size={30} color="#FFF" />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>AI</Text>
                        </View>
                    </LinearGradient>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        zIndex: 9999,
        elevation: 12,
    },
    touchable: {
        width: '100%',
        height: '100%',
    },
    glowContainer: {
        width: '100%',
        height: '100%',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
    },
    gradient: {
        width: '100%',
        height: '100%',
        borderRadius: BUTTON_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#F97316',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '900',
    },
});

export default DraggableAIButton;
