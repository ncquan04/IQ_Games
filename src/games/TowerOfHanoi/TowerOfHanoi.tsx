import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import levels from './levels.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Interface định nghĩa cấu trúc của một đĩa trong trò chơi
 * - id: định danh duy nhất của đĩa, dùng để xác định kích thước
 */
interface Disc {
    id: number;
}

/**
 * Interface chứa thông tin về đĩa đang trong quá trình di chuyển giữa các tháp
 * - id: định danh của đĩa đang di chuyển
 * - sourceTower: chỉ số của tháp nguồn
 * - targetTower: chỉ số của tháp đích
 */
interface FlyingDiscInfo {
    id: number;
    sourceTower: number;
    targetTower: number;
}

// Các thông số cố định của trò chơi
const discHeight = 20;      // Chiều cao của mỗi đĩa
const discSpacing = 1;      // Khoảng cách giữa các đĩa
const towerWidth = Dimensions.get('window').width / 3;  // Chiều rộng của mỗi tháp
const towerHeight = 180;    // Chiều cao của mỗi tháp
const colors = ['#3498DB', '#F39C12', '#E74C3C', '#1ABC9C', '#9B59B6', '#2ECC71', '#E67E22', '#34495E', '#E84393', '#00B894']; // Màu sắc của các đĩa
const maxDiscWidth = towerWidth * 0.9;  // Chiều rộng tối đa của đĩa
const minDiscWidth = maxDiscWidth * 0.4; // Chiều rộng tối thiểu của đĩa

const calculateDiscWidth = (id: number, maxId: number) => {
    if (maxId === 0) return maxDiscWidth; // Trường hợp chỉ có 1 đĩa

    // Công thức tính toán chiều rộng dựa trên id và id lớn nhất
    // Đảo ngược tỷ lệ để id càng cao thì đĩa càng lớn
    const ratio = 1 - ((maxId - id) / maxId);
    return minDiscWidth + ratio * (maxDiscWidth - minDiscWidth);
};

const getDiscColor = (id: number) => {
    return colors[id % colors.length];
};

const getDiscPosition = (
    tower: Disc[],
    towerIndex: number,
    positionInTower: number,
    discWidth: number,
    totalDiscsInTower: number,
    isSelected: boolean
) => {
    // Tính toán vị trí X dựa vào chỉ số tháp và chiều rộng đĩa
    const x = towerWidth * towerIndex + (towerWidth - discWidth) / 2;
    // Tính toán vị trí Y dựa vào vị trí trong tháp
    let y = 180 - 40 - (totalDiscsInTower - 1 - positionInTower) * (discHeight + discSpacing);

    // Nâng đĩa lên khi được chọn
    if (isSelected) {
        y -= towerHeight - (tower.length * discHeight) - 15; // Nâng lên một chút để tạo cảm giác nổi
    }

    return { x, y };
};

/**
 * Component hiển thị một đĩa có hoạt ảnh
 */
const AnimatedDisc = ({ disc, x, y, isFlying = false, nextTowerIndex, towers, maxId }: { disc: Disc; x: number; y: number; isFlying?: boolean; nextTowerIndex: number, towers: Disc[][], maxId: number}) => {
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
    }, [x, y, isFlying, nextTowerIndex]);

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
    const maxId = Math.max(...levels.flatMap(level =>
        level.map.flat().map(disc => disc.id)
    ));

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

    // Tính tổng số đĩa trong tất cả các tháp
    const totalDiscs = towers.reduce((sum, tower) => sum + tower.length, 0);

    // Kiểm tra điều kiện chiến thắng: tất cả các đĩa đã ở tháp thứ 3
    const checkWin = towers[2].length === totalDiscs;

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
    const prevLevel = () => {
        const prevIndex = (level - 1 + levels.length) % levels.length;
        setTowers(JSON.parse(JSON.stringify(levels[prevIndex].map)));
        setLevel(prevIndex);
        movesCountRef.current = 0;
        setSelectedTower(null);
        flyingDiscRef.current = null;
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
                    <TouchableOpacity
                        key={index}
                        style={[
                            {
                                width: towerWidth,
                                height: towerHeight,
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                            },
                        ]}
                        onPress={() => handleTowerPress(index)}
                        disabled={isAnimatingRef.current}
                    >
                        {/* Phần trụ đứng của tháp */}
                        <View
                            style={{
                                width: 10,
                                height: 140,
                                backgroundColor: '#7F8C8D',
                                position: 'absolute',
                                bottom: 20,
                                zIndex: 1,
                            }}
                        />
                        {/* Phần đế của tháp */}
                        <View
                            style={{
                                width: towerWidth,
                                height: 20,
                                backgroundColor: '#7F8C8D',
                                borderRadius: 4,
                            }}
                        />
                    </TouchableOpacity>
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '80%' }}>
                {/* Nút chuyển level */}
                <TouchableOpacity
                    style={{
                        backgroundColor: '#3498DB',
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                    }}
                    onPress={prevLevel}
                    disabled={isAnimatingRef.current}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Previous</Text>
                </TouchableOpacity>

                {/* Nút Reset để bắt đầu lại trò chơi */}
                <TouchableOpacity
                    style={{
                        backgroundColor: '#E74C3C',
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                    }}
                    onPress={resetLevel}
                    disabled={isAnimatingRef.current}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Reset</Text>
                </TouchableOpacity>

                {/* Nút chuyển level */}
                <TouchableOpacity
                    style={{
                        backgroundColor: '#3498DB',
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 8,
                    }}
                    onPress={nextLevel}
                    disabled={isAnimatingRef.current}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TowerOfHanoi;
