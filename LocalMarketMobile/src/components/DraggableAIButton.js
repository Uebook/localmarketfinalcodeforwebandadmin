import React, { useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    PanResponder,
    Animated,
    TouchableOpacity,
    Dimensions,
    Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeColors } from '../hooks/useThemeColors';

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = 64; // Increased size slightly

const DraggableAIButton = ({ onPress }) => {
    const COLORS = useThemeColors();

    const initialX = width - BUTTON_SIZE - 20;
    const initialY = height - BUTTON_SIZE - 100;

    const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
    const [isDragging, setIsDragging] = useState(false);

    const panResponder = useRef(
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

                // Snap to edges if desired
                let finalX = pan.x._value;
                let finalY = pan.y._value;

                // Simple boundaries
                if (finalX < 10) finalX = 10;
                if (finalX > width - BUTTON_SIZE - 10) finalX = width - BUTTON_SIZE - 10;
                if (finalY < 60) finalY = 60;
                if (finalY > height - BUTTON_SIZE - 80) finalY = height - BUTTON_SIZE - 80;

                Animated.spring(pan, {
                    toValue: { x: finalX, y: finalY },
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
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
                <LinearGradient
                    colors={['#8B5CF6', '#3B82F6']} // Vibrant Purple to Blue
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <Icon name="sparkles" size={28} color="#FFF" />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>AI</Text>
                    </View>
                </LinearGradient>
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
        elevation: 10,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    touchable: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        width: '100%',
        height: '100%',
        borderRadius: BUTTON_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#F97316',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '900',
    },
});

export default DraggableAIButton;
