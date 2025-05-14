// Component ô lưới: Hiển thị và quản lý từng ô riêng lẻ trên lưới trò chơi, bao gồm các trạng thái và hiệu ứng của ô
import { View, Text, TouchableOpacity } from 'react-native'
import React, { Dispatch, RefObject, SetStateAction, useEffect, useImperativeHandle, useRef, useState } from 'react'
import IncorrectGem from '../icons/IncorrectGem'; // Icon hiển thị khi chọn sai
import Animated, { 
    FadeIn,          // Hiệu ứng xuất hiện
    FadeInLeft,      // Hiệu ứng xuất hiện từ trái
    FadeOut,         // Hiệu ứng biến mất
    FadeOutLeft,     // Hiệu ứng biến mất về bên trái
    useAnimatedStyle, // Tạo style với animation
    useSharedValue,  // Giá trị dùng cho animation
    withTiming       // Tạo animation với timing
} from 'react-native-reanimated';
import { ANIMATION_CONFIG } from '../config/animationConfig'; // Cấu hình hiệu ứng
import difficulties from '../data/difficulties.json'; // Dữ liệu cấp độ khó

// Mảng chứa các loại đá quý khác nhau để hiển thị ngẫu nhiên
const Gems = [
    require('../icons/RedGem1'),    // Đá quý đỏ loại 1
    require('../icons/RedGem2'),    // Đá quý đỏ loại 2
    require('../icons/RedGem3'),    // Đá quý đỏ loại 3
    require('../icons/BlueGem1'),   // Đá quý xanh loại 1
    require('../icons/BlueGem2'),   // Đá quý xanh loại 2
    require('../icons/BlueGem3'),   // Đá quý xanh loại 3
    require('../icons/PurpleGem1'), // Đá quý tím loại 1
    require('../icons/PurpleGem2'), // Đá quý tím loại 2
    require('../icons/PurpleGem3'), // Đá quý tím loại 3
]

// Interface xác định các phương thức có thể gọi từ bên ngoài component
export interface GridTileRef {
    resetTile: () => void; // Phương thức đặt lại trạng thái ô về ban đầu
}


// Props cho component GridTile
interface GridTileProps {
    isGem: boolean;                                               // Có phải là ô chứa đá quý không
    widthPercent: number;                                         // Phần trăm chiều rộng của ô
    isShowingGems: boolean;                                       // Trạng thái hiển thị đá quý
    selectedCount: number;                                        // Số lượng ô đã được chọn
    setSelectedCount: Dispatch<SetStateAction<number>>;           // Hàm cập nhật số lượng ô đã chọn
    gameOver: boolean;                                            // Trạng thái kết thúc màn chơi
    ref: React.Ref<GridTileRef>;                                  // Ref để truy cập từ component cha
    delay: number;                                                // Độ trễ cho hiệu ứng xuất hiện
    hadIncorrectInLevelRef: React.RefObject<boolean>;             // Tham chiếu đến trạng thái có chọn sai
    pointsRef: React.RefObject<number>;                           // Tham chiếu đến điểm số người chơi
    difficulty: number;                                           // Cấp độ khó hiện tại
    level: number;                                                // Màn chơi hiện tại
}

const GridTile = ({isGem, widthPercent, isShowingGems, setSelectedCount, gameOver, ref, delay, hadIncorrectInLevelRef, pointsRef, difficulty, level}: GridTileProps) => {
    const [isSelected, setIsSelected] = useState<boolean>(false); // Trạng thái ô đã được chọn hay chưa
    const randomGemIndex = useRef<number>(Math.floor(Math.random() * Gems.length)); // Chọn ngẫu nhiên một loại đá quý
    const [ , triggerRerender] = useState<number>(0); // Biến để kích hoạt render lại component
    
    // Các giá trị màu sắc cho animation (bắt đầu với màu nền mặc định: #113840)
    const redValue = useSharedValue(17);    // Giá trị đỏ: #11 (17 trong hệ thập phân)
    const greenValue = useSharedValue(56);  // Giá trị xanh lá: #38 (56 trong hệ thập phân)
    const blueValue = useSharedValue(64);   // Giá trị xanh dương: #40 (64 trong hệ thập phân)
    const alphaValue = useSharedValue(1);   // Độ trong suốt    // Tạo style động cho màu nền của ô, sẽ được cập nhật theo thời gian thực
    const animatedBackgroundStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: `rgba(${redValue.value}, ${greenValue.value}, ${blueValue.value}, ${alphaValue.value})`,
        };
    });
    
    /**
     * Chuyển đổi màu nền của ô sang màu mới với hiệu ứng mượt mà
     * @param colorHex Mã màu hex hoặc chuỗi rgba
     * @param duration Thời gian chuyển đổi (ms)
     */
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

    // Định nghĩa các phương thức có thể gọi từ bên ngoài thông qua ref
    useImperativeHandle(ref, () => {
        return {
            // Phương thức đặt lại trạng thái ô về ban đầu
            resetTile: () => {
                setIsSelected(false); // Bỏ trạng thái đã chọn
                // Đặt màu nền về mặc định: màu sáng cho đá quý, màu tối cho ô trống
                animateToColor(isGem ? '#9df1fa' : '#113840');
                triggerRerender((prev) => prev + 1); // Kích hoạt render lại
            }
        }
    });

    useEffect(() => {
        if (isShowingGems) {
            if (isGem) {
                animateToColor('#9df1fa');
            } else {
                animateToColor('#113840');
            }
        } else if (!isShowingGems && !gameOver) {
            if (!isSelected) {
                animateToColor('#113840');
            } else {
                if (isGem) {
                    animateToColor('rgba(94, 245, 126, 0.8)');
                } else {
                    animateToColor('rgba(242, 87, 66, 0.8)');
                }
            }
        } else if (gameOver) {
            if (!isSelected) {
                if (isGem) {
                    animateToColor('#9df1fa');
                } else {
                    animateToColor('#113840');
                }
            } else {
                if (isGem) {
                    animateToColor('rgba(94, 245, 126, 0.8)');
                } else {
                    animateToColor('rgba(242, 87, 66, 0.8)');
                }
            }
        }

        triggerRerender((prev) => prev + 1);
    }, [isShowingGems, isSelected, isGem, gameOver]);

    const handleSelectTiles = () => {
        setSelectedCount((prev) => prev + 1);
        setIsSelected(true);
        if (!isGem) {
            hadIncorrectInLevelRef.current = true;
        } else {
            pointsRef.current += difficulties[difficulty].levels[level].POINTS_PER_CORRECT;
            triggerRerender((prev) => prev + 1);
        }
        triggerRerender((prev) => prev + 1);
    }

    const shouldShowGem = () => {
        if (isShowingGems) {
            return isGem;
        } else if (!isShowingGems && !gameOver) {
            return isSelected && isGem;
        } else if (gameOver) {
            return isGem;
        }
        return false;
    }

    return (
        <Animated.View
            style={[
                {
                    width: `${widthPercent}%`, 
                    aspectRatio: 1, 
                    borderRadius: 5, 
                    overflow: 'hidden'
                },
                animatedBackgroundStyle
            ]}
            entering={FadeInLeft.delay(delay).duration(ANIMATION_CONFIG.TILE_FADE_IN_DURATION)}
            exiting={FadeOutLeft.delay(delay).duration(ANIMATION_CONFIG.TILE_FADE_OUT_DURATION)}
        >
            <TouchableOpacity 
                style={{ width: '100%', height: '100%' }}
                onPress={handleSelectTiles}
                disabled={isShowingGems || gameOver || isSelected}
            >
                {(shouldShowGem()) && (
                    <Animated.View
                        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                        entering={FadeIn.duration(ANIMATION_CONFIG.GEM_FADE_IN_DURATION)}
                        exiting={FadeOut.duration(ANIMATION_CONFIG.GEM_FADE_OUT_DURATION)}
                    >
                        {Gems[randomGemIndex.current].default({
                            width: '50%',
                            height: '50%',
                        })}
                    </Animated.View>
                )}
                {(!isGem && isSelected && !isShowingGems) && (
                    <Animated.View 
                        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                        entering={FadeIn.duration(ANIMATION_CONFIG.GEM_FADE_IN_DURATION)}
                        exiting={FadeOut.duration(ANIMATION_CONFIG.GEM_FADE_OUT_DURATION)}
                    >
                        <IncorrectGem
                            width={'50%'}
                            height={'50%'}
                            fill={'grey'}
                        />
                    </Animated.View>
                )}
            </TouchableOpacity>
        </Animated.View>
    )
}

export default GridTile