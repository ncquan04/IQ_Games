import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

/**
 * Component tạo hiệu ứng nền Parallax
 * Hiệu ứng Parallax tạo cảm giác chiều sâu bằng cách di chuyển các lớp nền với tốc độ khác nhau
 */
const ParallaxBackground = () => {
    // Giá trị dùng để điều khiển hiệu ứng di chuyển theo trục X
    const scrollX = useSharedValue(0);

    // Tạo các animated styles cho từng lớp parallax
    const layerStyles = [
        useAnimatedStyle(() => ({
            // Lớp xa nhất di chuyển nhiều nhất
            transform: [{ translateX: interpolate(scrollX.value, [-100, 100], [-20, 20]) }],
        })),
        useAnimatedStyle(() => ({
            // Lớp giữa di chuyển ít hơn
            transform: [{ translateX: interpolate(scrollX.value, [-100, 100], [-10, 10]) }],
        })),
        useAnimatedStyle(() => ({
            // Lớp gần di chuyển ít nhất
            transform: [{ translateX: interpolate(scrollX.value, [-100, 100], [-5, 5]) }],
        })),
    ];

    // Mô phỏng chuyển động parallax theo định kỳ
    useEffect(() => {
        const animation = () => {
            // Tạo hiệu ứng di chuyển qua lại
            scrollX.value = withSequence(
                withTiming(100, { duration: 8000 }),
                withTiming(-100, { duration: 8000 }),
            );
        };

        // Bắt đầu animation
        animation();
        
        // Thiết lập interval để lặp lại animation
        const interval = setInterval(animation, 16000);
        
        // Dọn dẹp interval khi component unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.backgroundContainer}>
            <Animated.View style={[styles.parallaxLayer, styles.layer1, layerStyles[0]]} />
            <Animated.View style={[styles.parallaxLayer, styles.layer2, layerStyles[1]]} />
            <Animated.View style={[styles.parallaxLayer, styles.layer3, layerStyles[2]]} />
        </View>
    );
};

// Định nghĩa styles cho component ParallaxBackground
const styles = StyleSheet.create({
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    parallaxLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    layer1: {
        backgroundColor: '#1E1E2A',
        opacity: 0.4,
    },
    layer2: {
        top: 50,
        left: 25,
        right: 25,
        bottom: 50,
        backgroundColor: '#2A2A3A',
        opacity: 0.4,
    },
    layer3: {
        top: 100,
        left: 50,
        right: 50,
        bottom: 100,
        backgroundColor: '#3A3A4A',
        opacity: 0.4,
    },
});

export default ParallaxBackground;