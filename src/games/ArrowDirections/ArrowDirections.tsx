import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    interpolate,
    Extrapolate,
    runOnJS,
    Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import GameOverModal from './components/GameOverModal';
import TimerDisplay from './components/TimerDisplay';
// Import các component đã tách
import ParallaxBackground from './components/ParallaxBackground';
import AnimatedArrow, { 
    Direction, 
    ArrowType, 
    ArrowPosition,
    ARROW_POSITIONS,
    ARROW_SLIDE_DURATION_MS,
    COLOR_FEEDBACK_DURATION_MS
} from './components/AnimatedArrow';

// Import cấu hình levels
import gameLevels from './config/levels.json';

// Định nghĩa interface cho Level
interface Level {
    pointsForCorrect: number;
    pointsForIncorrect: number;
    targetScore: number;
    timeLimit: number; // Thêm timeLimit vào interface Level
}

// Lấy kích thước màn hình
const { width, height } = Dimensions.get('window');

// Các hằng số cho trò chơi
const INITIAL_SPAWN_DELAY_MS = 0; // Độ trễ ban đầu để sinh ra mũi tên
const MIN_SPAWN_DELAY_MS = 0; // Độ trễ tối thiểu để sinh ra mũi tên
const SPAWN_DECREASE_RATE = 25; // Tốc độ giảm độ trễ sinh ra mũi tên

/**
 * Hàm giúp tạo ra một mũi tên ngẫu nhiên
 * @returns Một đối tượng mũi tên với hướng và loại ngẫu nhiên
 */
const generateRandomArrow = () => {
    const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    const types = [ArrowType.SAME, ArrowType.OPPOSITE];

    return {
        direction: directions[Math.floor(Math.random() * directions.length)],
        type: types[Math.floor(Math.random() * types.length)],
        key: Date.now() + Math.random()
    };
};

/**
 * Component chính của trò chơi Arrow Directions
 * Người chơi phải vuốt theo hướng mũi tên trắng hoặc ngược hướng mũi tên vàng
 */
const ArrowDirections = () => {
    console.log('ArrowDirections component rerendered');

    // States cơ bản của trò chơi
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [currentLevel, setCurrentLevel] = useState<number>(0); // State quản lý level hiện tại
    const highScoreRef = useRef<number>(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // Thêm gameId để kiểm soát việc khởi động lại timer
    // gameId sẽ thay đổi mỗi khi bắt đầu trò chơi mới
    const [gameId, setGameId] = useState(0);
    
    // Chuyển các state không trực tiếp ảnh hưởng UI thành ref
    const spawnDelayMsRef = useRef<number>(INITIAL_SPAWN_DELAY_MS);
    const gameTimeMsRef = useRef<number>(0); // Khởi tạo với 0, sẽ được cập nhật trong startGame
    const animationTriggerRef = useRef<number>(0);
    const isTransitioningRef = useRef<boolean>(false);

    // Thêm ref để theo dõi thời gian còn lại cho progress bar
    const currentTimeRemainingRef = useRef<number>(0); // Khởi tạo với 0, sẽ được cập nhật trong startGame

    // Mảng stack các mũi tên
    const [arrowStack, setArrowStack] = useState<{
        direction: Direction;
        type: ArrowType;
        key: number;
        isCorrect: boolean | null;
    }[]>([]);

    // Refs cho timers
    const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
    const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Giá trị animation
    const timeBarWidth = useSharedValue(width);
    const scoreAnimation = useSharedValue(0);
    const borderFlash = useSharedValue(0);
    
    // Lấy thông tin level hiện tại
    const getCurrentLevelConfig = useCallback((): Level => {
        return gameLevels.levels[currentLevel] || gameLevels.levels[0];
    }, [currentLevel]);
    
    /**
     * Sinh mũi tên tiếp theo và dịch chuyển stack
     * Được gọi sau khi có hành động vuốt
     */
    const spawnNextArrow = useCallback(() => {
        setArrowStack(prevStack => {
            // Loại bỏ mũi tên dưới cùng (index 0)
            const updatedStack = prevStack.slice(1);
            
            // Thêm một mũi tên mới vào trên cùng
            return [
                ...updatedStack,
                { ...generateRandomArrow(), isCorrect: null }
            ];
        });

        // Kích hoạt animations
        animationTriggerRef.current += 1;
    }, []);

    /**
     * Làm nháy viền khi vuốt sai
     * Tạo hiệu ứng phản hồi trực quan
     */
    const flashBorder = useCallback(() => {
        borderFlash.value = withSequence(
            withTiming(1, { duration: 100 }),
            withTiming(0, { duration: 100 })
        );
    }, [borderFlash]);

    /**
     * Xử lý khi mũi tên hoàn thành animation
     * Chỉ được gọi khi mũi tên dưới cùng hoàn thành animation thoát
     */
    const handleArrowComplete = useCallback(() => {
        // Ghi chú: Hiện tại hàm này chỉ được gọi khi mũi tên trước đó (dưới cùng)
        // hoàn thành animation thoát sau khi đạt vị trí dưới cùng
    }, []);

    /**
     * Kết thúc trò chơi an toàn
     * Đảm bảo không gọi endGame nhiều lần
     */
    const endGameSafe = useCallback(() => {
        if (!isPlaying) return;

        setIsPlaying(false);
        setIsGameOver(true);

        // Xóa các timers
        if (gameTimerRef.current) {
            clearInterval(gameTimerRef.current);
            gameTimerRef.current = null;
        }

        if (spawnTimerRef.current) {
            clearTimeout(spawnTimerRef.current);
            spawnTimerRef.current = null;
        }

        // Cập nhật điểm cao nhất
        if (score > highScoreRef.current) {
            highScoreRef.current = score;
        }

        // Hiển thị modal chúc mừng
        setShowModal(true);
    }, [isPlaying, score]);

    /**
     * Bắt đầu trò chơi
     * Khởi tạo lại tất cả các giá trị và thiết lập timer
     */
    const startGame = useCallback(() => {
        setIsPlaying(true);
        setIsGameOver(false);
        setShowModal(false);
        setScore(0);
        spawnDelayMsRef.current = INITIAL_SPAWN_DELAY_MS;
        
        // Lấy thời gian từ cấu hình level hiện tại (đổi từ giây sang milliseconds)
        const levelConfig = getCurrentLevelConfig();
        gameTimeMsRef.current = levelConfig.timeLimit * 1000;

        // Tăng gameId để báo hiệu một trò chơi mới
        setGameId(prevId => prevId + 1);

        // Khởi tạo với năm mũi tên
        const initialArrows = [
            { ...generateRandomArrow(), isCorrect: null }, // bottom
            { ...generateRandomArrow(), isCorrect: null }, // lower
            { ...generateRandomArrow(), isCorrect: null }, // middle/current
            { ...generateRandomArrow(), isCorrect: null }, // upper
            { ...generateRandomArrow(), isCorrect: null }, // top
        ];
        setArrowStack(initialArrows);

        // Đặt giá trị ban đầu cho thanh thời gian
        timeBarWidth.value = width;
    }, [getCurrentLevelConfig]);

    /**
     * Xử lý khi người chơi muốn chơi level tiếp theo
     */
    const handleNextLevel = useCallback(() => {
        // Chỉ cho phép tiến lên level tiếp theo nếu chưa đạt max level
        if (currentLevel < gameLevels.levels.length - 1) {
            setCurrentLevel(currentLevel + 1);
            startGame();
        }
    }, [currentLevel, startGame]);

    /**
     * Xử lý nút Play Again
     * Đóng modal và khởi động lại trò chơi ở level hiện tại
     */
    const handleRestartGame = useCallback(() => {
        // Đóng modal
        setShowModal(false);
        
        // Đặt lại tất cả các trạng thái quan trọng
        isTransitioningRef.current = false;
        
        // Đảm bảo các timers đã được xóa
        if (gameTimerRef.current) {
            clearInterval(gameTimerRef.current);
            gameTimerRef.current = null;
        }

        if (spawnTimerRef.current) {
            clearTimeout(spawnTimerRef.current);
            spawnTimerRef.current = null;
        }

        // Khởi động lại trò chơi sau một khoảng thời gian ngắn
        setTimeout(startGame, 300);
    }, [startGame]);

    /**
     * Kiểm tra xem vuốt có đúng không
     * So sánh hướng vuốt với quy tắc của mũi tên hiện tại
     * @param swipeDirection Hướng vuốt
     */
    const checkSwipe = useCallback((swipeDirection: Direction) => {
        // Nếu có ít hơn 5 mũi tên, hoặc trò chơi kết thúc, hoặc animation đang diễn ra, bỏ qua
        if (arrowStack.length < 5 || !isPlaying || isTransitioningRef.current) return;

        // Lấy config của level hiện tại để tính điểm
        const levelConfig = getCurrentLevelConfig();

        // Đánh dấu rằng quá trình chuyển đang diễn ra
        isTransitioningRef.current = true;

        // Lấy mũi tên hiện tại (giữa) - ở index 2 trong stack 5 mũi tên
        const currentArrow = arrowStack[2];
        let correct = false;

        // Kiểm tra xem vuốt có phù hợp với quy tắc không
        if (currentArrow.type === ArrowType.SAME) {
            correct = swipeDirection === currentArrow.direction;
        } else { // OPPOSITE - ngược lại
            switch (currentArrow.direction) {
                case Direction.UP:
                    correct = swipeDirection === Direction.DOWN;
                    break;
                case Direction.DOWN:
                    correct = swipeDirection === Direction.UP;
                    break;
                case Direction.LEFT:
                    correct = swipeDirection === Direction.RIGHT;
                    break;
                case Direction.RIGHT:
                    correct = swipeDirection === Direction.LEFT;
                    break;
            }
        }

        // Cập nhật trạng thái với kết quả
        setArrowStack(prevStack => {
            const updatedStack = [...prevStack];
            // Đặt phản hồi cho mũi tên hiện tại (giữa)
            updatedStack[2] = { ...updatedStack[2], isCorrect: correct };
            return updatedStack;
        });

        if (correct) {
            // Tăng điểm với animation và sử dụng pointsForCorrect từ level hiện tại
            setScore(prev => {
                const newScore = prev + levelConfig.pointsForCorrect;
                scoreAnimation.value = withSequence(
                    withTiming(1, { duration: 150 }),
                    withTiming(0, { duration: 150 })
                );
                return newScore;
            });
        } else {
            // Vuốt sai - làm nháy viền và trừ điểm theo cấu hình level
            flashBorder();
            setScore(prev => {
                return Math.max(0, prev + levelConfig.pointsForIncorrect); // Đảm bảo điểm không xuống dưới 0
            });
        }

        // Cho cả vuốt đúng và sai, sinh mũi tên tiếp theo sau độ trễ
        spawnTimerRef.current = setTimeout(() => {
            spawnNextArrow();

            // Cho phép vuốt lại sau khoảng thời gian animation
            setTimeout(() => {
                isTransitioningRef.current = false;
            }, ARROW_SLIDE_DURATION_MS + 50); // Thêm 50ms buffer

            // Tăng tốc độ khi điểm tăng (chỉ cho vuốt đúng)
            if (correct && score > 0 && score % 5 === 0) {
                spawnDelayMsRef.current = Math.max(MIN_SPAWN_DELAY_MS, spawnDelayMsRef.current - SPAWN_DECREASE_RATE);
            }
        }, spawnDelayMsRef.current);
        
    }, [arrowStack, isPlaying, score, getCurrentLevelConfig]);

    // Khởi tạo giá trị ban đầu cho Reanimated shared values
    useEffect(() => {
        // Khởi tạo giá trị ngay khi component mount
        timeBarWidth.value = width;
        scoreAnimation.value = 0;
        borderFlash.value = 0;
    }, []);

    // Hàm xử lý cập nhật thời gian từ TimerDisplay
    const handleTimeUpdate = useCallback((remainingTime: number) => {
        // Cập nhật ref để component khác có thể truy cập
        currentTimeRemainingRef.current = remainingTime;
        
        // Cập nhật thanh progress bar dựa trên thời gian còn lại
        // Sử dụng gameTimeMsRef.current thay vì GAME_DURATION_MS
        const progressWidth = (remainingTime / gameTimeMsRef.current) * width;
        timeBarWidth.value = progressWidth;
    }, []);

    // Thiết lập gesture handlers - chỉ hoạt động khi trò chơi đang chơi và không trong quá trình chuyển tiếp
    const panGesture = Gesture.Pan()
        .onEnd((e) => {
            // Kiểm tra xem game có đang chơi và không trong quá trình chuyển tiếp
            if (!isPlaying || isTransitioningRef.current) return;
            
            const { velocityX, velocityY } = e;
            const isHorizontal = Math.abs(velocityX) > Math.abs(velocityY);

            let direction;
            if (isHorizontal) {
                direction = velocityX > 0 ? Direction.RIGHT : Direction.LEFT;
            } else {
                direction = velocityY > 0 ? Direction.DOWN : Direction.UP;
            }

            // Chỉ phản hồi với vuốt mạnh, có chủ đích
            if (Math.abs(isHorizontal ? velocityX : velocityY) > 100) {
                runOnJS(checkSwipe)(direction);
            }
        });

    // Animated styles
    const timeBarStyle = useAnimatedStyle(() => {
        return {
            width: timeBarWidth.value,
        };
    });

    const scoreStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: interpolate(scoreAnimation.value, [0, 1], [1, 1.2], Extrapolate.CLAMP) }
            ]
        };
    });

    const borderStyle = useAnimatedStyle(() => {
        return {
            borderColor: `rgba(244, 67, 54, ${borderFlash.value})`,
            borderWidth: interpolate(borderFlash.value, [0, 1], [0, 6])
        };
    });

    // Đảm bảo game kết thúc khi thời gian về 0
    useEffect(() => {
        if (isPlaying && gameTimeMsRef.current <= 0) {
            endGameSafe();
        }
    }, [gameTimeMsRef.current, isPlaying, endGameSafe]);

    // Dọn dẹp timers khi unmount
    useEffect(() => {
        return () => {
            if (gameTimerRef.current) clearInterval(gameTimerRef.current);
            if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
        };
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.container, borderStyle]}>
                        <StatusBar hidden />
                        <ParallaxBackground />

                        {/* Thanh thời gian - chỉ hiển thị khi đang chơi */}
                        {isPlaying && (
                            <View style={styles.timeBarContainer}>
                                <Animated.View style={[styles.timeBar, timeBarStyle]} />
                            </View>
                        )}

                        {/* Hiển thị thời gian - chỉ hiển thị khi đang chơi */}
                        {/* Truyền gameId để kiểm soát việc khởi động lại timer */}
                        {isPlaying && <TimerDisplay 
                            initialTime={gameTimeMsRef.current} 
                            onTimeUp={endGameSafe}
                            gameId={gameId}
                            onTimeUpdate={handleTimeUpdate}
                        />}

                        {/* Hiển thị điểm - chỉ hiển thị khi đang chơi */}
                        {isPlaying && (
                            <Animated.Text style={[styles.scoreText, scoreStyle]}>
                                Score: {score}
                            </Animated.Text>
                        )}

                        {/* Nội dung trò chơi */}
                        <View style={styles.gameContent}>
                            {!isPlaying && !showModal ? (
                                <>
                                    <Text style={styles.title}>Arrow Directions</Text>
                                    <Text style={styles.instructions}>
                                        White arrow: Swipe in the SAME direction{'\n'}
                                        Yellow arrow: Swipe in the OPPOSITE direction{'\n\n'}
                                        React to the middle arrow!
                                    </Text>
                                    <Text style={styles.levelText}>Level: {currentLevel + 1}</Text>
                                    <TouchableOpacity
                                        style={styles.startButton}
                                        onPress={startGame}
                                    >
                                        <Text style={styles.startButtonText}>
                                            {isGameOver ? 'PLAY AGAIN' : 'START'}
                                        </Text>
                                    </TouchableOpacity>
                                    {highScoreRef.current > 0 && <Text style={styles.highScore}>High Score: {highScoreRef.current}</Text>}
                                </>
                            ) : (
                                <View style={styles.arrowStack}>
                                    {arrowStack.map((arrow, index) => {
                                        // Ánh xạ index sang vị trí
                                        let position;
                                        switch (index) {
                                            case 0: position = ArrowPosition.BOTTOM; break;
                                            case 1: position = ArrowPosition.LOWER; break;
                                            case 2: position = ArrowPosition.CURRENT; break;
                                            case 3: position = ArrowPosition.UPPER; break;
                                            case 4: position = ArrowPosition.TOP; break;
                                            default: position = ArrowPosition.BOTTOM;
                                        }

                                        return (
                                            <AnimatedArrow
                                                key={arrow.key}
                                                direction={arrow.direction}
                                                type={arrow.type}
                                                position={position}
                                                isCorrect={arrow.isCorrect}
                                                onAnimationComplete={index === 0 ? handleArrowComplete : undefined}
                                                animationTrigger={animationTriggerRef.current}
                                                score={score}
                                            />
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    </Animated.View>
                </GestureDetector>
            </GestureHandlerRootView>

            <GameOverModal
                visible={showModal}
                score={score}
                highScore={highScoreRef.current}
                targetScore={getCurrentLevelConfig().targetScore}
                currentLevel={currentLevel}
                onRestart={handleRestartGame}
                onNextLevel={score >= getCurrentLevelConfig().targetScore ? handleNextLevel : undefined}
            />
        </View>
    );
};

// Định nghĩa styles cho component ArrowDirections
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeBarContainer: {
        position: 'absolute',
        top: 30,
        left: 0,
        right: 0,
        height: 10,
        backgroundColor: '#333',
    },
    timeBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
    },
    scoreText: {
        position: 'absolute',
        top: 45,
        left: 20,
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    levelText: {
        fontSize: 20,
        color: '#FFC107',
        marginBottom: 20,
    },
    gameContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    arrowStack: {
        height: 400, // Tăng chiều cao để chứa các mũi tên lớn hơn
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    },
    instructions: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    startButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderWidth: 2,
        borderColor: '#4CAF50',
        borderRadius: 8,
    },
    startButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    highScore: {
        position: 'absolute',
        bottom: 40,
        fontSize: 18,
        color: '#FFC107',
        fontWeight: 'bold',
    }
});

export default ArrowDirections;