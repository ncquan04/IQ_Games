// Grid.tsx - Component hiển thị lưới các ô cho trò chơi Strange Signals
// Quản lý logic random, hiển thị, hiệu ứng và xử lý chọn ô trong lưới
// Sử dụng các props để nhận thông tin về cấp độ, trạng thái game, callback cập nhật số ô đã chọn, điểm số, v.v.

import { View, Text, Dimensions } from 'react-native'
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import difficulties from '../data/difficulties.json'
import { ANIMATION_CONFIG } from '../config/animationConfig';
import GridTile, { GridTileRef } from './GridTile';

// Khai báo kiểu dữ liệu props cho component Grid
interface GridProps {
    difficulty: number,           // Cấp độ khó
    level: number,                // Màn chơi hiện tại
    isShowingBulbs: boolean,      // Trạng thái hiển thị bóng đèn
    selectedCount: number;        // Số ô đã được chọn
    setSelectedCount: Dispatch<SetStateAction<number>>;  // Hàm cập nhật số ô đã chọn
    gameOver: boolean;            // Trạng thái kết thúc game
    hadIncorrectInLevelRef: React.RefObject<boolean>;   // Tham chiếu đến biến theo dõi lựa chọn sai
    pointsRef: React.RefObject<number>;                 // Tham chiếu đến điểm số
}

const Grid = ({difficulty, level, isShowingBulbs, selectedCount, setSelectedCount, gameOver, hadIncorrectInLevelRef, pointsRef}: GridProps) => {
    // Lưu cấu hình lưới dựa trên độ khó và màn chơi
    const gridConfigRef = useRef({
        GRID_WIDTH: difficulties[difficulty].levels[level].GRID_WIDTH,      // Chiều rộng lưới
        GRID_HEIGHT: difficulties[difficulty].levels[level].GRID_HEIGHT,    // Chiều cao lưới
        GEMS_COUNT: difficulties[difficulty].levels[level].BULBS_COUNT,     // Số lượng bóng đèn
    });

    // Tạo mảng 2 chiều đại diện cho lưới game, 0: ô thường, 1: ô có bóng đèn
    const gridRef = useRef<number[][]>(
        Array.from({ length: gridConfigRef.current.GRID_HEIGHT }, () =>
            Array(gridConfigRef.current.GRID_WIDTH).fill(0)
        )
    );

    // Tạo mảng ref để tương tác với các component GridTile
    const gridTileRefs = useRef<React.RefObject<GridTileRef | null>[][]>(
        Array.from({ length: gridConfigRef.current.GRID_HEIGHT }, () =>
            Array(gridConfigRef.current.GRID_WIDTH).fill(0).map(() => React.createRef<GridTileRef | null>())
        )
    );

    // Mảng lưu vị trí các bóng đèn theo thứ tự sáng
    const lightingBulbsRef = useRef<number[]>([]);

    // State giả để kích hoạt render lại component khi cần
    const [ , triggerRerender] = useState<number>(0);

    // Hàm tạo ngẫu nhiên vị trí các bóng đèn trên lưới
    const randomizeGrid = () => {
        // Reset tất cả các ô trong lưới
        gridTileRefs.current.forEach((row) => {
            row.forEach((cell) => {
                cell.current?.resetTile();
            });
        });

        // Cập nhật cấu hình lưới mới theo độ khó và màn chơi hiện tại
        gridConfigRef.current = {
            GRID_WIDTH: difficulties[difficulty].levels[level].GRID_WIDTH,
            GRID_HEIGHT: difficulties[difficulty].levels[level].GRID_HEIGHT,
            GEMS_COUNT: difficulties[difficulty].levels[level].BULBS_COUNT,
        };

        // Khởi tạo lại lưới trò chơi với toàn bộ ô thường (0)
        gridRef.current = Array.from({ length: gridConfigRef.current.GRID_HEIGHT }, () =>
            Array(gridConfigRef.current.GRID_WIDTH).fill(0)
        );

        // Ngẫu nhiên đặt bóng đèn vào lưới
        let lightedBulbsCount = 0;
        while (lightedBulbsCount < gridConfigRef.current.GEMS_COUNT) {
            const randomRow = Math.floor(Math.random() * gridConfigRef.current.GRID_HEIGHT);
            const randomCol = Math.floor(Math.random() * gridConfigRef.current.GRID_WIDTH);

            if (gridRef.current[randomRow][randomCol] === 0) {
                gridRef.current[randomRow][randomCol] = 1;
                lightingBulbsRef.current.push(randomRow * gridConfigRef.current.GRID_WIDTH + randomCol);
                lightedBulbsCount++;
            }
        }

        // Kích hoạt render lại component
        triggerRerender(Math.random());
    }

    // Hàm tạo hiệu ứng lần lượt bật sáng các bóng đèn
    const lightBulbs = () => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            // Tắt bóng đèn trước đó nếu có
            if (currentIndex > 0) {
                const prevRowIndex = Math.floor(lightingBulbsRef.current[currentIndex - 1] / gridConfigRef.current.GRID_WIDTH);
                const prevCellIndex = lightingBulbsRef.current[currentIndex - 1] % gridConfigRef.current.GRID_WIDTH;
                gridTileRefs.current[prevRowIndex][prevCellIndex].current?.lightDown();
            }
            // Bật sáng bóng đèn tiếp theo
            if (currentIndex < lightingBulbsRef.current.length) {
                const rowIndex = Math.floor(lightingBulbsRef.current[currentIndex] / gridConfigRef.current.GRID_WIDTH);
                const cellIndex = lightingBulbsRef.current[currentIndex] % gridConfigRef.current.GRID_WIDTH;
                gridTileRefs.current[rowIndex][cellIndex].current?.lightUp();
                currentIndex++;
            } else {
                // Dừng hiệu ứng khi đã bật sáng tất cả
                clearInterval(interval);
            }
        }, 500);
        return () => clearInterval(interval);
    }

    // Khởi tạo lưới mới và hiệu ứng khi độ khó hoặc màn chơi thay đổi
    useEffect(() => {
        randomizeGrid();
        lightBulbs();
    }, [difficulty, level]);

    return (
        <View style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
            {/* Render các hàng trong lưới */}
            {gridRef.current.map((row, rowIndex) => (
                <View 
                    key={`row-${rowIndex}`} 
                    style={{
                        width: '100%', 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        marginVertical: gridConfigRef.current.GRID_WIDTH / 100 * (Math.floor(Dimensions.get('window').width) - 200) / (gridConfigRef.current.GRID_WIDTH - 1)
                    }}
                >
                    {/* Render các ô trong mỗi hàng */}
                    {row.map((cell, cellIndex) => (
                        <GridTile
                            isBulb={cell === 1}  // Xác định ô này có bóng đèn không
                            key={`tile-${difficulty}-${level}-${rowIndex}-${cellIndex}`}
                            widthPercent={(100 - gridConfigRef.current.GRID_WIDTH) / gridConfigRef.current.GRID_WIDTH}
                            isShowingBulbs={isShowingBulbs}
                            setSelectedCount={setSelectedCount}
                            gameOver={gameOver}
                            ref={gridTileRefs.current[rowIndex][cellIndex]}
                            delay={(rowIndex * gridConfigRef.current.GRID_WIDTH + cellIndex) * ANIMATION_CONFIG.TILE_DELAY_INCREMENT}
                            hadIncorrectInLevelRef={hadIncorrectInLevelRef}
                            pointsRef={pointsRef}
                            difficulty={difficulty}
                            level={level}
                            isCorrect={lightingBulbsRef.current[selectedCount] === rowIndex * gridConfigRef.current.GRID_WIDTH + cellIndex}
                        />
                    ))}
                </View>
            ))}
        </View>
    )
}

export default Grid
