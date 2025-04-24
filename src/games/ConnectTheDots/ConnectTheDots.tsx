import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, PanResponder, GestureResponderEvent, LayoutRectangle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import maps from './solvable_maps.json'
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface định nghĩa một điểm trên lưới
interface Dot {
    row: number;
    col: number;
    type: 'blue' | 'red';
}

// Interface mở rộng từ Dot, thêm thông tin về vị trí trên màn hình
interface DotLayout extends Dot {
    layout: LayoutRectangle;
}

// Các hướng di chuyển có thể có: lên, xuống, trái, phải
const possibleMoves = [
    { row: -1, col: 0 }, // Lên
    { row: 1, col: 0 },  // Xuống
    { row: 0, col: -1 }, // Trái
    { row: 0, col: 1 },  // Phải
]

// Chuyển đổi mảng số thành mảng các điểm
// 1 = điểm xanh (cần nối), 0 = điểm đỏ (chướng ngại)
const parseGrid = (grid: number[][]): Dot[][] => {
    return grid.map((row, rowIndex) => {
        return row.map((cell, colIndex) => {
            return {
                row: rowIndex,
                col: colIndex,
                type: cell === 1 ? 'blue' : 'red'
            };
        });
    }
)};

const ConnectTheDots: React.FC = () => {
    // Lưu trữ đường đi hiện tại
    const [path, setPath] = useState<Dot[]>([]);
    // Trạng thái của trò chơi: đang chơi, thành công, thất bại
    const [status, setStatus] = useState<'playing' | 'success' | 'failure'>('playing');
    // Level hiện tại của trò chơi
    const [level, setLevel] = useState<number>(1);
    // Mảng chứa các điểm trên lưới
    const [dots, setDots] = useState<Dot[][]>([]);

    // Biến theo dõi xem người dùng đã thả tay ra chưa
    const hasReleasedTouchRef = useRef<boolean>(true);
    // Số lượng điểm xanh cần kết nối
    const requiredLengthRef = useRef<number>(0);
    // Mảng chứa các điểm với thông tin vị trí trên màn hình
    const dotsWithLayout = useRef<DotLayout[]>([]);

    // Biến theo dõi xem đang vẽ hay không
    const isDrawingRef = useRef<boolean>(false);
    // Tham chiếu đến các View của điểm
    const dotRefs = useRef<(View | null)[][]>([]);
    // Tham chiếu đến container chứa lưới
    const containerRef = useRef<View>(null);
    // Lưu thông tin layout của container
    const containerLayout = useRef<LayoutRectangle | null>(null);

    // Cập nhật dots khi level thay đổi
    useEffect(() => {
        // Kiểm tra xem level có hợp lệ không
        if (level >= 0 && level < maps.length) {
            const newDots = parseGrid(maps[level].map);
            setDots(newDots);
            
            // Cập nhật lại số lượng điểm xanh cần kết nối
            const blueDots = newDots.flat().filter(dot => dot.type === 'blue');
            requiredLengthRef.current = blueDots.length;
            
            // Khởi tạo lại mảng tham chiếu điểm
            dotRefs.current = Array.from({ length: newDots.length }, 
                () => Array(newDots[0].length).fill(null)
            );
        } else {
            // Nếu level không hợp lệ, quay về level 0
            setLevel(0);
        }
    }, [level]);

    // Cập nhật vị trí sau khi giao diện được render
    useEffect(() => {
        setTimeout(measureAllDots, 500);
    }, [dots]);

    // Lấy thông tin level đã lưu từ bộ nhớ thiết bị
    useEffect(() => {
        const fetchLevel = async () => {
            try {
                const level = await AsyncStorage.getItem('ConnectTheDots_level');
                if (level !== null) {
                    setLevel(parseInt(level, 10));
                }
                setLevel(0); // Đặt lại level về 0 nếu không tìm thấy
            } catch (error) {
                console.error('Error fetching level:', error);
            }
        }
        fetchLevel();
    }, []);

    // Đo vị trí của tất cả các điểm trên màn hình
    const measureAllDots = () => {
        if (!containerRef.current) return;

        containerRef.current.measure((x, y, width, height, pageX, pageY) => {
            containerLayout.current = { x: pageX, y: pageY, width, height };

            const newDotsWithLayout: DotLayout[] = [];

            // Lấy vị trí của mỗi dot
            dots.forEach((row, rowIndex) => {
                row.forEach((dot, colIndex) => {
                    if (dotRefs.current[rowIndex][colIndex]) {
                        const dotRef = dotRefs.current[rowIndex][colIndex];
                        dotRef.measure((x, y, width, height, pageX, pageY) => {
                            newDotsWithLayout.push({
                                ...dot,
                                layout: { x: pageX, y: pageY, width, height }
                            });
                        });
                    }
                });
            });

            dotsWithLayout.current = newDotsWithLayout;
        });
    };

    // Tìm điểm tại vị trí được chạm vào
    const findDotAtPosition = (x: number, y: number): Dot | null => {
        for (const dot of dotsWithLayout.current) {
            const { layout } = dot;
            if (
                x >= layout.x &&
                x <= layout.x + layout.width &&
                y >= layout.y &&
                y <= layout.y + layout.height
            ) {
                return { row: dot.row, col: dot.col, type: dot.type };
            }
        }
        return null;
    };

    // Xử lý các sự kiện chạm và kéo
    const handleTouchEvents = useCallback(
        (e: GestureResponderEvent) => {
            const { pageX, pageY, touches } = e.nativeEvent;
            const dot = findDotAtPosition(pageX, pageY);
    
            // Khi người nhấc tay
            if (touches.length === 0) {
                hasReleasedTouchRef.current = true;
    
                if (path.length >= requiredLengthRef.current) {
                    validatePath();
                }
    
                // Nếu path bị xóa hết hoàn toàn, kết thúc vẽ
                if (path.length === 0) {
                    isDrawingRef.current = false;
                }
    
                return;
            }
    
            // Không cho phép vẽ lại cho đến khi nhấc tay ra rồi
            if (!isDrawingRef.current && hasReleasedTouchRef.current) {
                if (dot && dot.type === 'blue') {
                    setPath([dot]);
                    isDrawingRef.current = true;
                    hasReleasedTouchRef.current = false; // Đánh dấu đã bắt đầu vẽ
                }
                return;
            }
    
            // Nếu đang vẽ
            if (isDrawingRef.current && dot && dot.type === 'blue') {
                setPath(prevPath => {
                    if (prevPath.length === 0) return [dot];
    
                    const lastDot = prevPath[prevPath.length - 1];
                    // Kiểm tra xem điểm mới có kề với điểm cuối cùng không
                    const isAdjacent = possibleMoves.some(
                        move =>
                            lastDot.row + move.row === dot.row &&
                            lastDot.col + move.col === dot.col
                    );
                    // Kiểm tra xem điểm đã nằm trong đường đi chưa
                    const alreadyInPath = prevPath.some(
                        d => d.row === dot.row && d.col === dot.col
                    );
    
                    // Thêm điểm mới nếu nó kề và chưa có trong đường đi
                    if (!alreadyInPath && isAdjacent) {
                        return [...prevPath, dot];
                    }
    
                    // Hỗ trợ đi ngược lại (backtrack)
                    if (
                        prevPath.length > 1 &&
                        prevPath[prevPath.length - 2].row === dot.row &&
                        prevPath[prevPath.length - 2].col === dot.col
                    ) {
                        const newPath = prevPath.slice(0, -1);
    
                        // Nếu chỉ còn 1 dot sau backtrack ➝ xóa path hoàn toàn
                        if (newPath.length === 1) {
                            isDrawingRef.current = false; // không còn vẽ nữa
                            hasReleasedTouchRef.current = false; // chưa nhấc tay
                            return [];
                        }
    
                        return newPath;
                    }
    
                    return prevPath;
                });
            }
        },
        [findDotAtPosition]
    );
    
    // Tạo PanResponder để xử lý các cử chỉ chạm
    const panResponder = useMemo(() => {
        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderStart: handleTouchEvents,
            onPanResponderMove: handleTouchEvents,
            onPanResponderRelease: handleTouchEvents,
        });
    }, [handleTouchEvents]);

    // Kiểm tra xem tất cả các dot xanh đã được kết nối hay chưa
    const validatePath = () => {
        if (path.length === 0) return;

        const greenDots = dots.flat().filter(d => d.type === 'blue');
        const allGreenIncluded = greenDots.every(greenDot =>
            path.some(p => p.row === greenDot.row && p.col === greenDot.col)
        );

        setStatus(allGreenIncluded ? 'success' : 'failure');
    };

    // Hàm để bắt đầu lại trò chơi
    const retryGame = () => {
        setPath([]);
        setStatus('playing');
        isDrawingRef.current = false;
        // Reset vị trí sau khi tạo grid mới
        setTimeout(measureAllDots, 100);
    };

    // Hàm để chuyển sang level tiếp theo
    const nextLevel = async () => {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setPath([]);
        setStatus('playing');
        isDrawingRef.current = false;
        try {
            await AsyncStorage.setItem('ConnectTheDots_level', nextLevel.toString());
        } catch (error) {
            console.error('Error saving level:', error);
        }
    }

    // Kiểm tra xem dot có nằm trong path hay không
    const isDotInPath = (row: number, col: number) =>
        path.some(dot => dot.row === row && dot.col === col);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Connect the Dots</Text>
            <Text style={{fontSize: 16, marginBottom: 10, color: 'black'}}>
                Level {level + 1} / {maps.length}
            </Text>

            {/* Container chính chứa lưới điểm */}
            <View
                ref={containerRef}
                style={styles.gridContainer}
                {...panResponder.panHandlers}
                onLayout={measureAllDots}
            >
                {/* Component SVG để vẽ đường nối giữa các điểm */}
                <Svg
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                >
                    {path.length > 1 &&
                        path.map((dot, index) => {
                            if (index === 0) return null;

                            // Tìm thông tin vị trí của điểm trước và điểm hiện tại
                            const prev = dotsWithLayout.current.find(d =>
                                d.row === path[index - 1].row && d.col === path[index - 1].col
                            );
                            const curr = dotsWithLayout.current.find(d =>
                                d.row === dot.row && d.col === dot.col
                            );

                            if (!prev || !curr) return null;

                            // Tính toán tọa độ để vẽ đường thẳng
                            const x1 = prev.layout.x - (containerLayout.current?.x ?? 0) + prev.layout.width / 2;
                            const y1 = prev.layout.y - (containerLayout.current?.y ?? 0) + prev.layout.height / 2;
                            const x2 = curr.layout.x - (containerLayout.current?.x ?? 0) + curr.layout.width / 2;
                            const y2 = curr.layout.y - (containerLayout.current?.y ?? 0) + curr.layout.height / 2;

                            return (
                                <Line
                                    key={index}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="#22c55e"
                                    strokeWidth={4}
                                    strokeLinecap="round"
                                />
                            );
                        })}
                </Svg>

                {/* Render lưới điểm */}
                {dots.map((rowDots, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {rowDots.map((dot, colIndex) => {
                            // Tính toán kích thước điểm dựa trên kích thước lưới
                            const dotSize = Math.min(
                                36, // Kích thước tối đa của điểm
                                Math.floor(300 / Math.max(dots.length, dots[0]?.length || 1))
                            );
                            const dotMargin = Math.max(4, Math.min(8, dotSize / 5));
                            
                            return (
                                <View
                                    key={colIndex}
                                    ref={ref => {
                                        if (ref) {
                                            // Đảm bảo mảng được khởi tạo đúng cách
                                            if (!dotRefs.current[rowIndex]) {
                                                dotRefs.current[rowIndex] = [];
                                            }
                                            dotRefs.current[rowIndex][colIndex] = ref;
                                        }
                                    }}
                                    style={[
                                        styles.dot,
                                        {
                                            width: dotSize,
                                            height: dotSize,
                                            margin: dotMargin,
                                            borderRadius: dotSize / 2,
                                            backgroundColor: dot.type === 'red'
                                                ? '#ef4444'  // Màu đỏ cho điểm chướng ngại
                                                : isDotInPath(rowIndex, colIndex)
                                                    ? '#22c55e'  // Màu xanh lá cho điểm đã nối
                                                    : '#3b82f6', // Màu xanh dương cho điểm cần nối
                                            borderColor: dot.type === 'red'
                                                ? '#b91c1c'  // Viền đậm hơn cho điểm đỏ
                                                : isDotInPath(rowIndex, colIndex)
                                                    ? '#15803d'  // Viền đậm hơn cho điểm đã nối
                                                    : '#1d4ed8'  // Viền đậm hơn cho điểm cần nối
                                        }
                                    ]}
                                />
                            );
                        })}
                    </View>
                ))}
            </View>

            {/* Hiển thị thông báo kết quả */}
            {status === 'success' && <Text style={styles.success}>Success! 🎉</Text>}
            {status === 'failure' && <Text style={styles.failure}>Try again ❌</Text>}

            {/* Nút chuyển level khi hoàn thành */}
            {(status === 'success') && (
                <TouchableOpacity style={styles.retryButton} onPress={nextLevel}>
                    <Text style={styles.retryText}>Next Level</Text>
                </TouchableOpacity>
            )}

            {/* Nút khởi động lại trò chơi */}
            <TouchableOpacity
                style={styles.retryButton}
                onPress={retryGame}
            >
                <Text style={styles.retryText}>Restart Game</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

// Định nghĩa kiểu dáng cho các thành phần
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    gridContainer: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 24
    },
    row: {
        flexDirection: 'row',
    },
    dot: {
        width: 40,
        height: 40,
        margin: 8,
        borderRadius: 20,
        borderWidth: 2,
    },
    success: {
        color: '#16a34a',
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 16,
    },
    failure: {
        color: '#dc2626',
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 16,
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#2563eb',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ConnectTheDots;
