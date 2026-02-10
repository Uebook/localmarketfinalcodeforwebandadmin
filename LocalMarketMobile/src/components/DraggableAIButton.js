import React, { useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    PanResponder,
    Animated,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors } from '../hooks/useThemeColors';

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = 56;

const DraggableAIButton = ({ onPress }) => {
    const COLORS = useThemeColors();

    // Initial position: Bottom Right (with some padding)
    const initialX = width - BUTTON_SIZE - 20;
    const initialY = height - BUTTON_SIZE - 100; // Above bottom tab bar

    const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
    const [isDragging, setIsDragging] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only start dragging if moved significantly (avoids accidental drags on tap)
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
            onPanResponderRelease: () => {
                pan.flattenOffset();
                setIsDragging(false);

                // Optional: Add boundary checks here to keep button on screen
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
                    backgroundColor: COLORS.primary, // Using primary color (likely orange)
                    shadowColor: COLORS.shadow,
                },
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    if (!isDragging && onPress) {
                        onPress();
                    }
                }}
                activeOpacity={0.8}
            >
                <Icon name="aperture" size={24} color="#FFF" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // Ensure it floats above everything
        elevation: 5,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    button: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default DraggableAIButton;
