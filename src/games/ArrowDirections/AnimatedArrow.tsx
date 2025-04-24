import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    runOnJS,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// Định nghĩa hướng mũi tên
export enum Direction {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right'
}

// Định nghĩa loại mũi tên
export enum ArrowType {
    SAME = 'white',     // Mũi tên trắng: vuốt cùng hướng
    OPPOSITE = 'yellow' // Mũi tên vàng: vuốt hướng ngược lại
}

// Định nghĩa vị trí mũi tên trong stack
export enum ArrowPosition {
    BOTTOM = 'bottom',  // Mũi tên dưới cùng
    LOWER = 'lower',    // Mũi tên giữa dưới
    CURRENT = 'current', // Mũi tên hiện tại (giữa)
    UPPER = 'upper',    // Mũi tên giữa trên
    TOP = 'top'         // Mũi tên trên cùng
}

// Dữ liệu vị trí cho mỗi mũi tên trong stack
export const ARROW_POSITIONS = {
    [ArrowPosition.BOTTOM]: { y: 240, scale: 0.5, opacity: 0.3 },
    [ArrowPosition.LOWER]: { y: 120, scale: 0.7, opacity: 0.6 },
    [ArrowPosition.CURRENT]: { y: 0, scale: 1.0, opacity: 1.0 },
    [ArrowPosition.UPPER]: { y: -120, scale: 0.7, opacity: 0.6 },
    [ArrowPosition.TOP]: { y: -240, scale: 0.5, opacity: 0.3 },
};

// Thời gian cho hiệu ứng
export const ARROW_SLIDE_DURATION_MS = 100; // Thời gian cho hiệu ứng di chuyển mũi tên
export const COLOR_FEEDBACK_DURATION_MS = 100; // Thời gian cho hiệu ứng phản hồi màu sắc

// Props cho component AnimatedArrow
interface AnimatedArrowProps {
    direction: Direction;
    type: ArrowType;
    position: ArrowPosition;
    isCorrect: boolean | null;
    onAnimationComplete?: () => void;
    animationTrigger: number;
    score?: number; // Thêm prop score để biết khi nào game mới bắt đầu
}

/**
 * Component mũi tên có animation
 * Hiển thị và điều khiển animation cho mỗi mũi tên trong trò chơi
 */
const AnimatedArrow = ({
    direction,
    type,
    position,
    isCorrect,
    onAnimationComplete,
    animationTrigger,
    score = 0 // Giá trị mặc định là 0
}: AnimatedArrowProps) => {
    // Các giá trị shared để điều khiển animation
    const opacity = useSharedValue(ARROW_POSITIONS[position].opacity);
    const scale = useSharedValue(ARROW_POSITIONS[position].scale);
    const translateY = useSharedValue(ARROW_POSITIONS[position].y);
    const rotation = useSharedValue(0);

    // Kiểm tra xem có nên ẩn mũi tên hay không dựa vào điểm số và vị trí
    const shouldHideArrow = (
        // Khi mới bắt đầu (score = 0), ẩn cả 2 mũi tên dưới
        (score === 0 && (position === ArrowPosition.BOTTOM || position === ArrowPosition.LOWER)) ||
        // Sau lượt chơi đầu tiên (score = 1), chỉ ẩn mũi tên dưới cùng
        (score === 1 && position === ArrowPosition.BOTTOM)
    );
    
    // Nếu cần ẩn, đặt opacity là 0
    if (shouldHideArrow) {
        opacity.value = 0;
    }

    // Xử lý thay đổi vị trí và hiệu ứng phản hồi
    useEffect(() => {
        // Nếu là mũi tên cần ẩn, không cần animation
        if (shouldHideArrow) return;

        // Animation cho chuyển đổi vị trí
        opacity.value = withTiming(ARROW_POSITIONS[position].opacity, { duration: ARROW_SLIDE_DURATION_MS });
        scale.value = withTiming(ARROW_POSITIONS[position].scale, { duration: ARROW_SLIDE_DURATION_MS });
        translateY.value = withTiming(ARROW_POSITIONS[position].y, {
            duration: ARROW_SLIDE_DURATION_MS
        }, () => {
            // Chỉ gọi onAnimationComplete cho mũi tên dưới cùng khi nó hoàn tất animation
            if (position === ArrowPosition.BOTTOM && onAnimationComplete) {
                runOnJS(onAnimationComplete)();
            }
        });

        // Xử lý hiệu ứng phản hồi cho mũi tên hiện tại
        if (position === ArrowPosition.CURRENT && isCorrect !== null) {
            if (isCorrect) {
                // Hiệu ứng pulse khi đúng - giảm thời gian xuống còn 30ms
                scale.value = withSequence(
                    withTiming(1.1, { duration: COLOR_FEEDBACK_DURATION_MS }),
                    withTiming(ARROW_POSITIONS[position].scale, { duration: COLOR_FEEDBACK_DURATION_MS })
                );
            } else {
                // Hiệu ứng rung khi sai - giảm thời gian xuống còn 30ms cho mỗi bước
                rotation.value = withSequence(
                    withTiming(-10, { duration: COLOR_FEEDBACK_DURATION_MS }),
                    withTiming(10, { duration: COLOR_FEEDBACK_DURATION_MS }),
                    withTiming(-10, { duration: COLOR_FEEDBACK_DURATION_MS }),
                    withTiming(10, { duration: COLOR_FEEDBACK_DURATION_MS }),
                    withTiming(0, { duration: COLOR_FEEDBACK_DURATION_MS })
                );
            }
        }
    }, [position, isCorrect, animationTrigger, shouldHideArrow]);

    // Styles animation cho mũi tên
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { translateY: translateY.value },
                { scale: scale.value },
                { rotateZ: `${rotation.value}deg` }
            ]
        };
    });

    // Lấy path SVG cho các hướng mũi tên khác nhau
    const getPath = () => {
        switch (direction) {
            case Direction.UP:
                return "M20,40 L50,10 L80,40 L65,40 L65,90 L35,90 L35,40 Z";
            case Direction.DOWN:
                return "M20,60 L50,90 L80,60 L65,60 L65,10 L35,10 L35,60 Z";
            case Direction.LEFT:
                return "M40,20 L10,50 L40,80 L40,65 L90,65 L90,35 L40,35 Z";
            case Direction.RIGHT:
                return "M60,20 L90,50 L60,80 L60,65 L10,65 L10,35 L60,35 Z";
            default:
                return "";
        }
    };

    // Xác định màu cho mũi tên dựa trên phản hồi và vị trí
    const arrowColor = (() => {
        // Nếu mũi tên đã có kết quả đánh giá (đúng/sai), giữ màu phản hồi
        if (isCorrect !== null) {
            return isCorrect ? '#4CAF50' : '#F44336'; // Xanh lá khi đúng, đỏ khi sai
        }
        // Nếu chưa có kết quả đánh giá, hiển thị màu mặc định theo loại
        return type === ArrowType.SAME ? 'white' : '#FFC107'; // Trắng hoặc vàng dựa vào loại
    })();

    return (
        <Animated.View style={[styles.arrowContainer, animatedStyle]}>
            <Svg height="120" width="120" viewBox="0 0 100 100">
                <Path d={getPath()} fill={arrowColor} strokeWidth="1.5" stroke="#333" />
            </Svg>
        </Animated.View>
    );
};

// Định nghĩa styles cho component AnimatedArrow
const styles = StyleSheet.create({
    arrowContainer: {
        width: 120,
        height: 120,
        position: 'absolute',
    },
});

export default AnimatedArrow;