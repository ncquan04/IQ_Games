import { useState, useRef, useEffect, useCallback, MutableRefObject } from 'react';
import { View, GestureResponderEvent, LayoutRectangle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dot, DotLayout, GameStatus, possibleMoves } from '../types';
import maps from '../solvable_maps.json';

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

export const useGameLogic = () => {
    // Lưu trữ đường đi hiện tại
    const [path, setPath] = useState<Dot[]>([]);
    // Trạng thái của trò chơi: đang chơi, thành công, thất bại
    const [status, setStatus] = useState<GameStatus>('playing');
    // Level hiện tại của trò chơi
    const [level, setLevel] = useState<number>(0);
    // Mảng chứa các điểm trên lưới
    const [dots, setDots] = useState<Dot[][]>([]);

    // Biến theo dõi xem người dùng đã thả tay ra chưa
    const hasReleasedTouchRef = useRef<boolean>(true);
    // Số lượng điểm xanh cần kết nối
    const requiredLengthRef = useRef<number>(0);
    // Mảng chứa các điểm với thông tin vị trí trên màn hình
    const dotsWithLayoutRef = useRef<DotLayout[]>([]);
    // Biến theo dõi xem đang vẽ hay không
    const isDrawingRef = useRef<boolean>(false);
    // Tham chiếu đến các View của điểm
    const dotRefs = useRef<(View | null)[][]>([]);
    // Tham chiếu đến container chứa lưới
    const containerRef = useRef<View>(null);
    // Lưu thông tin layout của container
    const containerLayoutRef = useRef<LayoutRectangle | null>(null);

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
                const savedLevel = await AsyncStorage.getItem('ConnectTheDots_level');
                if (savedLevel !== null) {
                    setLevel(parseInt(savedLevel, 10));
                } else {
                    setLevel(0); // Đặt lại level về 0 nếu không tìm thấy
                }
            } catch (error) {
                console.error('Error fetching level:', error);
                setLevel(0);
            }
        }
        fetchLevel();
    }, []);

    // Đo vị trí của tất cả các điểm trên màn hình
    const measureAllDots = useCallback(() => {
        if (!containerRef.current) return;

        containerRef.current.measure((x, y, width, height, pageX, pageY) => {
            containerLayoutRef.current = { x: pageX, y: pageY, width, height };

            const newDotsWithLayout: DotLayout[] = [];

            // Lấy vị trí của mỗi dot
            dots.forEach((row, rowIndex) => {
                row.forEach((dot, colIndex) => {
                    if (dotRefs.current[rowIndex] && dotRefs.current[rowIndex][colIndex]) {
                        const dotRef = dotRefs.current[rowIndex][colIndex];
                        if (dotRef) {
                            dotRef.measure((x, y, width, height, pageX, pageY) => {
                                newDotsWithLayout.push({
                                    ...dot,
                                    layout: { x: pageX, y: pageY, width, height }
                                });
                            });
                        }
                    }
                });
            });

            dotsWithLayoutRef.current = newDotsWithLayout;
        });
    }, [dots]);

    // Tìm điểm tại vị trí được chạm vào
    const findDotAtPosition = useCallback((x: number, y: number): Dot | null => {
        for (const dot of dotsWithLayoutRef.current) {
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
    }, []);

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
        [findDotAtPosition, path]
    );

    // Kiểm tra xem tất cả các dot xanh đã được kết nối hay chưa
    const validatePath = useCallback(() => {
        if (path.length === 0) return;

        const greenDots = dots.flat().filter(d => d.type === 'blue');
        const allGreenIncluded = greenDots.every(greenDot =>
            path.some(p => p.row === greenDot.row && p.col === greenDot.col)
        );

        setStatus(allGreenIncluded ? 'success' : 'failure');
    }, [dots, path]);

    // Hàm để bắt đầu lại trò chơi
    const retryGame = useCallback(() => {
        setPath([]);
        setStatus('playing');
        isDrawingRef.current = false;
        // Reset vị trí sau khi tạo grid mới
        setTimeout(measureAllDots, 100);
    }, [measureAllDots]);

    // Hàm để chuyển sang level tiếp theo
    const nextLevel = useCallback(async () => {
        const nextLevelNumber = level + 1;
        if (nextLevelNumber < maps.length) {
            setLevel(nextLevelNumber);
            setPath([]);
            setStatus('playing');
            isDrawingRef.current = false;
            try {
                await AsyncStorage.setItem('ConnectTheDots_level', nextLevelNumber.toString());
            } catch (error) {
                console.error('Error saving level:', error);
            }
        }
    }, [level]);

    // Kiểm tra xem dot có nằm trong path hay không
    const isDotInPath = useCallback((row: number, col: number) =>
        path.some(dot => dot.row === row && dot.col === col),
    [path]);

    return {
        path,
        status,
        level,
        dots,
        dotRefs,
        containerRef,
        containerLayoutRef,
        dotsWithLayoutRef,
        handleTouchEvents,
        retryGame,
        nextLevel,
        isDotInPath,
        measureAllDots,
        totalLevels: maps.length
    };
};

export default useGameLogic;