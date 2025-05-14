// GridTile.tsx - Component đại diện cho một ô trong lưới Strange Signals
// Xử lý hiệu ứng động, trạng thái chọn, hiển thị đá quý, hiệu ứng màu sắc, điểm số và callback với parent Grid
// Sử dụng React Native Reanimated để tạo hiệu ứng chuyển động mượt mà

import { TouchableOpacity } from 'react-native'
import React, { Dispatch, SetStateAction, useImperativeHandle, useState } from 'react'
import Animated, { FadeInLeft, FadeOutLeft, interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ANIMATION_CONFIG } from '../config/animationConfig';
import Svg, { Path } from 'react-native-svg';
import difficulties from '../data/difficulties.json';

// Interface khai báo các phương thức có thể gọi từ component cha thông qua ref
export interface GridTileRef {
    resetTile: () => void;       // Đặt lại trạng thái ô về ban đầu
    lightUp: () => void;         // Phát sáng ô
    lightDown: () => void;       // Tắt sáng ô
}

// Interface khai báo các props của component GridTile
interface GridTileProps {
    isBulb: boolean;                                              // Có phải là ô đá quý không
    widthPercent: number;                                         // Phần trăm chiều rộng của ô
    isShowingBulbs: boolean;                                      // Trạng thái hiển thị đá quý
    setSelectedCount: Dispatch<SetStateAction<number>>;           // Hàm cập nhật số lượng ô đã chọn
    gameOver: boolean;                                            // Trạng thái kết thúc màn chơi
    ref: React.Ref<GridTileRef>;                                  // Ref để truy cập từ component cha
    delay: number;                                                // Độ trễ cho hiệu ứng xuất hiện
    hadIncorrectInLevelRef: React.RefObject<boolean>;             // Tham chiếu đến trạng thái có chọn sai
    pointsRef: React.RefObject<number>;                           // Tham chiếu đến điểm số người chơi
    difficulty: number;                                           // Cấp độ khó hiện tại
    level: number;                                                // Màn chơi hiện tại
    isCorrect: boolean;                                           // Có phải là ô đúng không
}

// Tạo component Path có thể animate được
const AnimatedBulb = Animated.createAnimatedComponent(Path);

const GridTile = ({ isBulb, widthPercent, isShowingBulbs, setSelectedCount, gameOver, ref, delay, hadIncorrectInLevelRef, pointsRef, difficulty, level, isCorrect }: GridTileProps) => {
    // State lưu trạng thái đã chọn ô hay chưa
    const [isSelected, setIsSelected] = useState<boolean>(false);
    
    // Các giá trị chia sẻ để animate màu sắc của ô
    const redValue = useSharedValue(17);    // Giá trị đỏ: #11 (17 trong hệ thập phân)
    const greenValue = useSharedValue(56);  // Giá trị xanh lá: #38 (56 trong hệ thập phân)
    const blueValue = useSharedValue(64);   // Giá trị xanh dương: #40 (64 trong hệ thập phân)
    const alphaValue = useSharedValue(1);   // Độ trong suốt
    
    // Tạo style động cho màu nền của ô, sẽ được cập nhật theo thời gian thực
    const animatedBackgroundStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: `rgba(${redValue.value}, ${greenValue.value}, ${blueValue.value}, ${alphaValue.value})`,
        };
    });

    // Hàm chuyển đổi màu sắc của ô theo thời gian
    const animateToColor = (colorHex: string, duration: number = ANIMATION_CONFIG.COLOR_TRANSITION_DURATION) => {
        let r = 0, g = 0, b = 0, a = 1;

        // Phân tích chuỗi màu để lấy giá trị r,g,b,a
        if (colorHex.includes('rgba')) {
            // Trường hợp chuỗi có định dạng rgba(r,g,b,a)
            const rgba = colorHex.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
            if (rgba) {
                r = parseInt(rgba[1]);
                g = parseInt(rgba[2]);
                b = parseInt(rgba[3]);
                a = parseFloat(rgba[4]);
            }
        } else {
            // Trường hợp chuỗi có định dạng hex: #rrggbb
            const hex = colorHex.replace('#', '');
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }

        // Áp dụng animation cho từng giá trị màu
        redValue.value = withTiming(r, { duration });
        greenValue.value = withTiming(g, { duration });
        blueValue.value = withTiming(b, { duration });
        alphaValue.value = withTiming(a, { duration });
    };

    // Giá trị chia sẻ cho tiến trình chuyển màu của đá quý
    const colorProgress = useSharedValue(0);

    // Props động cho đá quý, chuyển từ màu xám sang màu vàng
    const animatedProps = useAnimatedProps(() => {
        const interpolatedColor = interpolateColor(
            colorProgress.value,
            [0, 1],
            ['slategrey', 'gold'],
        )

        return {
            fill: interpolatedColor,
        }
    });

    // Hàm phát sáng đá quý
    const lightUp = () => {
        colorProgress.value = withTiming(1, { duration: 300 });
    }

    // Hàm tắt sáng đá quý
    const lightDown = () => {
        colorProgress.value = withTiming(0, { duration: 300 });
    }

    // Thiết lập các phương thức để component cha có thể gọi thông qua ref
    useImperativeHandle(ref, () => ({
        resetTile: () => {
            setIsSelected(false);
            colorProgress.value = withTiming(0, { duration: 300 });
        },
        lightUp,
        lightDown,
    }));

    // Xử lý khi người dùng chọn ô
    const handleSelectTile = () => {
        if(isCorrect) {
            // Nếu chọn đúng ô
            setIsSelected(true);
            setSelectedCount((prev) => prev + 1);
            pointsRef.current += difficulties[difficulty].levels[level].POINTS_PER_CORRECT;
            animateToColor('rgba(94, 245, 126, 0.8)', ANIMATION_CONFIG.COLOR_TRANSITION_DURATION); // Chuyển sang màu xanh lá
            lightUp(); // Phát sáng đá quý
        } else {
            // Nếu chọn sai ô
            animateToColor('rgba(242, 87, 66, 0.8)', ANIMATION_CONFIG.COLOR_TRANSITION_DURATION); // Chuyển sang màu đỏ
            setSelectedCount((prev) => prev + 1);
            hadIncorrectInLevelRef.current = true; // Đánh dấu là đã chọn sai trong màn chơi này
        }
    }

    return (
        <Animated.View
            style={[
                {
                    width: `${widthPercent}%`,
                    aspectRatio: 1,
                    borderRadius: 5,
                    overflow: 'hidden',
                    backgroundColor: '#113840', // Màu nền mặc định
                },
                animatedBackgroundStyle, // Style động sẽ thay đổi theo thời gian
            ]}
            entering={FadeInLeft.delay(delay).duration(ANIMATION_CONFIG.TILE_FADE_IN_DURATION)} // Hiệu ứng xuất hiện từ trái sang
            exiting={FadeOutLeft.delay(delay).duration(ANIMATION_CONFIG.TILE_FADE_OUT_DURATION)} // Hiệu ứng biến mất từ phải sang
        >
            <TouchableOpacity
                style={{ width: '100%', height: '100%', justifyContent: 'center', alignContent: 'center' }}
                onPress={handleSelectTile}
                disabled={isShowingBulbs || gameOver || isSelected} // Vô hiệu hóa khi đang hiển thị đá quý, trò chơi kết thúc hoặc đã chọn ô
            >
                <Svg
                    width={'60%'}
                    height={'60%'}
                    style={{ alignSelf: 'center', }}
                    viewBox="0 0 48 48"
                >
                    <AnimatedBulb
                        d="M17.1 34.2c.1.8.2 1.5.2 2.3h13.4c0-.8.1-1.6.2-2.3zm.2 4.3V42c0 .6.4 1 1 1h.3c.5 2.5 2.8 4.5 5.4 4.5 2.7 0 4.9-1.9 5.4-4.5h.3c.6 0 1-.4 1-1v-3.5zm5.9-38c-7.1.4-13 6-13.8 13.1-.4 4 .8 7.9 3.3 10.9 1.9 2.3 3.3 4.9 4 7.6h14.6c.7-2.7 2.1-5.4 4-7.7 2.2-2.6 3.4-5.9 3.4-9.3 0-8.3-7.1-15-15.5-14.6z"
                        data-original="#000000"
                        animatedProps={animatedProps} // Props động cho việc thay đổi màu sắc
                    />
                </Svg>
            </TouchableOpacity>
        </Animated.View>
    )
}

export default GridTile