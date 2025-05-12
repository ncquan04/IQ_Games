// Component lưới trò chơi: Hiển thị và quản lý các ô trên lưới, nơi chứa đá quý và tương tác với người chơi
import { View, Dimensions } from 'react-native'
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import difficulties from '../data/difficulties.json' // Dữ liệu cấp độ khó
import GridTile, { GridTileRef } from './GridTile' // Component ô lưới
import { ANIMATION_CONFIG } from '../config/animationConfig' // Cấu hình hiệu ứng

// Định nghĩa các props cho component Grid
interface GridProps {
    difficulty: number,     // Cấp độ khó hiện tại
    level: number,          // Cấp độ/màn chơi hiện tại
    isShowingGems: boolean, // Trạng thái hiển thị đá quý
    selectedCount: number;  // Số lần người chơi đã chọn ô
    setSelectedCount: Dispatch<SetStateAction<number>>; // Hàm để cập nhật số lần đã chọn
    gameOver: boolean;      // Trạng thái kết thúc màn chơi
    tilesExiting?: boolean; // Trạng thái các ô đang biến mất
    hadIncorrectInLevelRef: React.RefObject<boolean>; // Tham chiếu đến trạng thái có chọn sai trong màn
    pointsRef: React.RefObject<number>; // Tham chiếu đến điểm số người chơi
}

const Grid = ({difficulty, level, isShowingGems, selectedCount, setSelectedCount, gameOver, hadIncorrectInLevelRef, pointsRef}: GridProps) => {
    // Tham chiếu đến cấu hình lưới dựa trên cấp độ khó và màn chơi
    const gridConfigRef = useRef({
        GRID_WIDTH: difficulties[difficulty].levels[level].GRID_WIDTH,    // Số cột trong lưới
        GRID_HEIGHT: difficulties[difficulty].levels[level].GRID_HEIGHT,  // Số hàng trong lưới
        GEMS_COUNT: difficulties[difficulty].levels[level].GEMS_COUNT,    // Số lượng đá quý
    });
    
    // Ma trận lưới: 1 đại diện cho ô có đá quý, 0 là ô trống
    const gridRef = useRef<number[][]>(
        Array.from({ length: gridConfigRef.current.GRID_HEIGHT }, () => 
            Array(gridConfigRef.current.GRID_WIDTH).fill(0)
        )
    );

    // Ma trận tham chiếu đến các component GridTile
    const gridTileRefs = useRef<React.RefObject<GridTileRef | null>[][]>(
        Array.from({ length: gridConfigRef.current.GRID_HEIGHT }, () => 
            Array(gridConfigRef.current.GRID_WIDTH).fill(0).map(() => React.createRef<GridTileRef | null>())
        )
    );
    
    // Biến để kích hoạt render lại component
    const [ , triggerRerender] = useState<number>(0);
      /**
     * Khởi tạo lại lưới với vị trí đá quý ngẫu nhiên
     * - Reset tất cả các ô về trạng thái ban đầu
     * - Tạo lưới mới và đặt ngẫu nhiên vị trí các đá quý
     */
    const randomizeGrid = () => {
        // Reset trạng thái của tất cả các ô
        gridTileRefs.current.forEach((row) => {
            row.forEach((cell) => {
                cell.current?.resetTile();
            });
        });

        // Cập nhật lại cấu hình lưới theo cấp độ khó và màn chơi hiện tại
        gridConfigRef.current = {
            GRID_WIDTH: difficulties[difficulty].levels[level].GRID_WIDTH,
            GRID_HEIGHT: difficulties[difficulty].levels[level].GRID_HEIGHT, 
            GEMS_COUNT: difficulties[difficulty].levels[level].GEMS_COUNT,
        };
        
        // Tạo ma trận lưới mới với tất cả các ô đều trống (giá trị 0)
        gridRef.current = Array.from({ length: gridConfigRef.current.GRID_HEIGHT }, () => 
            Array(gridConfigRef.current.GRID_WIDTH).fill(0)
        );
        
        // Tạo ma trận tham chiếu mới cho các component GridTile
        gridTileRefs.current = Array.from({ length: gridConfigRef.current.GRID_HEIGHT }, () => 
            Array(gridConfigRef.current.GRID_WIDTH).fill(0).map(() => React.createRef<GridTileRef | null>())
        );
        
        const grid = gridRef.current;
        const { GRID_WIDTH, GRID_HEIGHT, GEMS_COUNT } = gridConfigRef.current;

        // Đặt ngẫu nhiên vị trí các đá quý trên lưới
        let placedGems = 0;
        while (placedGems < GEMS_COUNT) {
            const x = Math.floor(Math.random() * GRID_WIDTH); // Vị trí cột ngẫu nhiên
            const y = Math.floor(Math.random() * GRID_HEIGHT); // Vị trí hàng ngẫu nhiên
            if (grid[y][x] === 0) { // Nếu ô này chưa có đá quý
                grid[y][x] = 1; // Đánh dấu ô này có đá quý
                placedGems++;
            }
        }
    };    // Tạo lưới mới khi cấp độ khó hoặc màn chơi thay đổi
    useEffect(() => {
        randomizeGrid(); // Khởi tạo lưới với vị trí đá quý ngẫu nhiên
        triggerRerender((prev) => prev + 1); // Kích hoạt render lại component
    }, [difficulty, level]);    return (
        <View style={{width: '100%'}}>
            {/* Ánh xạ ma trận lưới thành các hàng */}
            {gridRef.current.map((row, rowIndex) => (
                <View 
                    key={`row-${rowIndex}`} 
                    style={{
                        width: '100%', 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        // Tính toán khoảng cách giữa các hàng dựa trên kích thước màn hình
                        marginVertical: gridConfigRef.current.GRID_WIDTH / 100 * (Math.floor(Dimensions.get('window').width) - 200) / (gridConfigRef.current.GRID_WIDTH - 1)
                    }}
                >
                    {/* Ánh xạ từng ô trong hàng */}
                    {row.map((cell, cellIndex) => (
                        <GridTile
                            isGem={cell === 1} // Ô này có phải là đá quý không
                            key={`tile-${difficulty}-${level}-${rowIndex}-${cellIndex}`}
                            widthPercent={(100 - gridConfigRef.current.GRID_WIDTH) / gridConfigRef.current.GRID_WIDTH} // Tính % chiều rộng của mỗi ô
                            isShowingGems={isShowingGems} // Trạng thái hiển thị đá quý
                            selectedCount={selectedCount} // Số lượng ô đã chọn
                            setSelectedCount={setSelectedCount} // Hàm cập nhật số lượng ô đã chọn
                            gameOver={gameOver} // Trạng thái kết thúc màn chơi
                            ref={gridTileRefs.current[rowIndex][cellIndex]} // Tham chiếu đến component GridTile
                            // Độ trễ cho hiệu ứng xuất hiện tuần tự
                            delay={(rowIndex * gridConfigRef.current.GRID_WIDTH + cellIndex) * ANIMATION_CONFIG.TILE_DELAY_INCREMENT}
                            hadIncorrectInLevelRef={hadIncorrectInLevelRef} // Tham chiếu đến trạng thái có chọn sai
                            pointsRef={pointsRef} // Tham chiếu đến điểm số người chơi
                            difficulty={difficulty} // Cấp độ khó hiện tại
                            level={level} // Màn chơi hiện tại
                        />
                    ))}
                </View>
            ))}
        </View>
    )
}

export default Grid