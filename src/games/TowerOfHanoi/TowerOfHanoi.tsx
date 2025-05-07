import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import levels from './data/levels.json';
import { Disc, FlyingDiscInfo } from './types';
import { towerWidth, towerHeight, discHeight, calculateDiscWidth, getDiscPosition } from './utilities';
import Tower from './components/Tower';
import AnimatedDisc from './components/AnimatedDisc';
import GameControls from './components/GameControls';

/**
 * Component chính của trò chơi Tower of Hanoi
 */
const TowerOfHanoi = () => {
    // State để lưu cấu trúc các tháp hiện tại, ban đầu lấy từ level đầu tiên
    const [towers, setTowers] = useState<Disc[][]>(levels[0].map);
    // State lưu level hiện tại
    const [level, setLevel] = useState(100);
    // Lưu trữ tháp đang được chọn
    const [selectedTower, setSelectedTower] = useState<number | null>(null);

    // Tìm id lớn nhất của đĩa trong tất cả các level
    const maxId = useMemo(() => Math.max(...levels.flatMap(level =>
        level.map.flat().map(disc => disc.id)
    )), []);

    // Các biến ref để theo dõi trạng thái mà không gây re-render
    const isAnimatingRef = useRef<boolean>(false);  // Đánh dấu khi có hoạt ảnh đang diễn ra
    const flyingDiscRef = useRef<FlyingDiscInfo | null>(null);  // Thông tin đĩa đang bay
    const movesCountRef = useRef<number>(0);  // Đếm số lần di chuyển
    const forceUpdateRef = useRef<number>(0);  // Biến hỗ trợ force re-render

    useEffect(() => {
        const fetchLevel = async () => {
            await AsyncStorage.getItem('TowerOfHanoi_level').then((value) => {
                if (value) {
                    const parsedValue = JSON.parse(value);
                    setLevel(parsedValue);
                    setTowers(JSON.parse(JSON.stringify(levels[parsedValue].map)));
                } else {
                    setLevel(0);
                    setTowers(JSON.parse(JSON.stringify(levels[0].map)));
                }
            });
        }
        fetchLevel();
    }, [])

    // Cơ chế force re-render khi cần thiết 
    const [, forceUpdate] = useState({});
    const triggerRender = () => {
        forceUpdateRef.current += 1;
        forceUpdate({});
    };

    /**
     * Xử lý sự kiện khi người chơi nhấn vào một tháp
     * @param towerIndex Chỉ số của tháp được nhấn
     */
    const handleTowerPress = (towerIndex: number) => {
        // Không cho phép tương tác khi đang có hoạt ảnh
        if (isAnimatingRef.current) return;

        if (selectedTower === null) {
            // Nếu chưa có tháp nào được chọn và tháp được nhấn có đĩa
            if (towers[towerIndex].length > 0) {
                setSelectedTower(towerIndex);
            }
        } else {
            // Nếu nhấn lại vào tháp đã chọn, hủy lựa chọn
            if (towerIndex === selectedTower) {
                setSelectedTower(null);
                return;
            }

            const sourceDiscs = towers[selectedTower];
            const targetDiscs = towers[towerIndex];

            // Kiểm tra luật chơi: chỉ được đặt đĩa nhỏ lên đĩa lớn hơn
            // Với id càng cao thì đĩa càng lớn, nên chỉ cho phép đặt đĩa có id thấp lên đĩa có id cao
            if (targetDiscs.length === 0 || sourceDiscs[0].id < targetDiscs[0].id) {
                const disc = sourceDiscs[0];
                // Đánh dấu đang trong quá trình hoạt ảnh
                isAnimatingRef.current = true;
                // Thiết lập thông tin đĩa đang bay
                flyingDiscRef.current = {
                    id: disc.id,
                    sourceTower: selectedTower,
                    targetTower: towerIndex
                };

                // Force render để hiển thị đĩa đang bay
                triggerRender();

                // Sau khi hoạt ảnh hoàn thành, cập nhật state thực sự
                setTimeout(() => {
                    // Tạo bản sao sâu của trạng thái tháp
                    const newTowers = [...towers.map(t => [...t])];
                    // Lấy đĩa đầu tiên từ tháp nguồn
                    const movedDisc = newTowers[selectedTower].shift();

                    if (movedDisc) {
                        // Thêm đĩa vào đầu của tháp đích
                        newTowers[towerIndex].unshift(movedDisc);
                        setTowers(newTowers);
                        movesCountRef.current += 1;  // Tăng biến đếm số bước di chuyển
                    }

                    // Đặt lại các biến trạng thái
                    flyingDiscRef.current = null;
                    isAnimatingRef.current = false;
                    triggerRender();
                }, 250);

                setSelectedTower(null);
            } else {
                // Nếu không thể di chuyển (vi phạm luật), hủy lựa chọn
                setSelectedTower(null);
            }
        }
    };

    // Tính tổng số đĩa trong tất cả các tháp và lưu vào cache với useMemo
    const totalDiscs = useMemo(() => {
        return towers.reduce((sum, tower) => sum + tower.length, 0);
    }, [towers]);

    // Kiểm tra điều kiện chiến thắng: tất cả các đĩa đã ở tháp thứ 3
    // Chỉ tính toán lại khi towers thay đổi
    const checkWin = useMemo(() => {
        return towers[2].length === totalDiscs;
    }, [towers, totalDiscs]);

    // Hàm để chuyển đến level tiếp theo
    const nextLevel = async () => {
        const nextLevel = (level + 1) % levels.length;
        setTowers(JSON.parse(JSON.stringify(levels[nextLevel].map)));
        setLevel(nextLevel);
        movesCountRef.current = 0;
        setSelectedTower(null);
        flyingDiscRef.current = null;
        await AsyncStorage.setItem('TowerOfHanoi_level', JSON.stringify(nextLevel));
        triggerRender();
    };

    // Hàm để chuyển đến level trước đó
    const prevLevel = async () => {
        const prevIndex = (level - 1 + levels.length) % levels.length;
        setTowers(JSON.parse(JSON.stringify(levels[prevIndex].map)));
        setLevel(prevIndex);
        movesCountRef.current = 0;
        setSelectedTower(null);
        flyingDiscRef.current = null;
        await AsyncStorage.setItem('TowerOfHanoi_level', JSON.stringify(prevIndex));
        triggerRender();
    };

    // Hàm để reset level hiện tại
    const resetLevel = () => {
        setTowers(JSON.parse(JSON.stringify(levels[level].map)));
        movesCountRef.current = 0;
        setSelectedTower(null);
        flyingDiscRef.current = null;
        triggerRender();
    };

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10 }}>Tower of Hanoi</Text>
            <Text style={{ fontSize: 18, marginBottom: 5 }}>Level {level + 1}/{levels.length} - Difficulty: {levels[level].difficulty}</Text>
            <Text style={{ fontSize: 18, marginBottom: 30 }}>Moves: {movesCountRef.current}</Text>

            {/* Khu vực chứa 3 tháp */}
            <View
                style={{
                    flexDirection: 'row',
                    width: '100%',
                    height: 200,
                    marginBottom: 40,
                    position: 'relative',
                    justifyContent: 'space-between',
                }}
            >
                {/* Render 3 tháp */}
                {towers.map((_, index) => (
                    <Tower
                        key={index}
                        index={index}
                        onPress={handleTowerPress}
                        isDisabled={isAnimatingRef.current}
                        width={towerWidth}
                        height={towerHeight}
                    />
                ))}

                {/* Render tất cả các đĩa trên các tháp */}
                {towers.map((tower, towerIndex) =>
                    tower.map((disc, discIndex) => {
                        // Xác định trạng thái của đĩa dựa trên state và ref hiện có
                        const isFlying = flyingDiscRef.current !== null &&
                            flyingDiscRef.current.id === disc.id &&
                            flyingDiscRef.current.sourceTower === towerIndex;
                        const isSelected = selectedTower === towerIndex && discIndex === 0;

                        // Tính toán vị trí của đĩa
                        const { x, y } = getDiscPosition(
                            tower,
                            towerIndex,
                            discIndex,
                            calculateDiscWidth(disc.id, maxId),
                            tower.length,
                            isSelected
                        );

                        return (
                            <AnimatedDisc
                                key={`${towerIndex}-${disc.id}`}
                                disc={disc}
                                towers={towers}
                                x={x}
                                y={y}
                                isFlying={isFlying}
                                nextTowerIndex={flyingDiscRef.current?.targetTower ?? -1}
                                maxId={maxId}
                            />
                        );
                    })
                )}
            </View>

            {/* Hiển thị thông báo chiến thắng khi người chơi hoàn thành trò chơi */}
            {checkWin && (
                <View
                    style={{
                        padding: 15,
                        backgroundColor: '#2ECC71',
                        borderRadius: 8,
                        marginVertical: 20,
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                        You won in {movesCountRef.current} moves!
                    </Text>
                </View>
            )}

            {/* Các nút điều khiển */}
            <GameControls
                onPrevLevel={prevLevel}
                onResetLevel={resetLevel}
                onNextLevel={nextLevel}
                isDisabled={isAnimatingRef.current}
            />
        </View>
    );
};

export default TowerOfHanoi;
