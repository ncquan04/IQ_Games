import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import { AnimatedDiscProps } from '../types';
import { calculateDiscWidth, getDiscColor, discHeight, towerWidth } from '../utilities';

/**
 * Component hiển thị một đĩa có hoạt ảnh
 */
const AnimatedDisc = ({ disc, x, y, isFlying = false, nextTowerIndex, towers, maxId }: AnimatedDiscProps) => {
    // Sử dụng shared values từ react-native-reanimated để làm hoạt ảnh
    const translateX = useSharedValue(x);
    const translateY = useSharedValue(y);

    // Tính toán chiều rộng và màu sắc của đĩa
    const discWidth = calculateDiscWidth(disc.id, maxId);
    const discColor = getDiscColor(disc.id);

    useEffect(() => {
        if (isFlying) {
            // Nếu đĩa đang bay, cập nhật vị trí X và Y với hoạt ảnh
            translateX.value = withTiming(nextTowerIndex * towerWidth + towerWidth / 2 - discWidth / 2, { duration: 125 }, () => {
                translateY.value = withTiming(140 - (towers[nextTowerIndex].length) * (discHeight), { duration: 125 });
            });
        } else {
            // Cập nhật vị trí trực tiếp khi không bay
            translateX.value = withTiming(x, { duration: 300 });
            translateY.value = withTiming(y, { duration: 300 });
        }
    }, [x, y, isFlying, nextTowerIndex, discWidth, towers]);

    // Style hoạt ảnh cho disc
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    height: discHeight,
                    borderRadius: 10,
                    width: discWidth,
                    backgroundColor: discColor,
                },
                animatedStyle,
            ]}
        />
    );
};

export default AnimatedDisc;