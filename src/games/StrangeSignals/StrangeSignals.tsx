// StrangeSignals.tsx - Component chính cho trò chơi Strange Signals
// Sử dụng React Native và quản lý trạng thái màn chơi, cấp độ khó, điểm số, hiệu ứng chuyển màn...

import { View, Text, Dimensions, StatusBar } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Header from '../../components/Header'
import { useStorage } from '../../hooks/useStorage';

import difficulties from './data/difficulties.json'
import Grid from './components/Grid';
import { ANIMATION_CONFIG } from './config/animationConfig';

const StrangeSignals = () => {
    // Lưu trữ cấp độ khó hiện tại vào local storage (giữ lại khi thoát app)
    const [storedDifficulty, setStoredDifficulty] = useStorage('strangeSignalsDifficulty', '0');
    // Biến tham chiếu cho các trạng thái chính của game
    const difficulty = useRef<number>(parseInt(storedDifficulty)); // Cấp độ khó hiện tại
    const level = useRef<number>(0); // Màn chơi hiện tại (bắt đầu từ 0)
    const displayLevel = useRef<number>(1); // Số màn hiển thị cho người chơi (bắt đầu từ 1)
    const pointsRef = useRef<number>(0); // Điểm số của người chơi
    const hadIncorrectRef = useRef<boolean>(false); // Đã từng chọn sai trong toàn bộ game chưa
    const hadIncorrectInLevelRef = useRef<boolean>(false); // Đã chọn sai trong màn hiện tại chưa
    const isShowingBulbsRef = useRef<boolean>(true); // Đang hiển thị các viên đá quý (bulbs)
    const gameOverRef = useRef<boolean>(false); // Trạng thái kết thúc màn chơi
    const isChangingLevelRef = useRef<boolean>(false); // Đang chuyển màn
    const [selectedCount, setSelectedCount] = useState<number>(0); // Số ô đã chọn trong màn hiện tại

    const [ , triggerRerender] = useState<number>(0); // Dùng để trigger rerender thủ công

    // Cấu hình game cho màn hiện tại (số lượng bulbs cần chọn)
    const gameConfigRef = useRef({
        BULBS_COUNT: difficulties[difficulty.current].levels[level.current].BULBS_COUNT,
    });

    // Hàm bắt đầu lại màn chơi (reset trạng thái, hiển thị bulbs, v.v.)
    const startGame = () => {
        isShowingBulbsRef.current = true;
        gameConfigRef.current = {
            BULBS_COUNT: difficulties[difficulty.current].levels[level.current].BULBS_COUNT,
        };
        isChangingLevelRef.current = false;
        gameOverRef.current = false;
        hadIncorrectInLevelRef.current = false;
        setSelectedCount(0);

        // Sau một khoảng thời gian, ẩn các bulbs và bắt đầu chơi
        setTimeout(() => {
            isShowingBulbsRef.current = false;
            triggerRerender((prev) => prev + 1);
        }, difficulties[difficulty.current].levels[level.current].BULBS_COUNT * 500 + 500);
    }

    // Hàm chuyển màn chơi, xử lý logic tăng màn, tăng cấp độ khó, reset trạng thái
    const changeLevel = () => {
        isChangingLevelRef.current = true; // Đánh dấu đang chuyển màn
        triggerRerender((prev) => prev + 1);
        
        // Nếu có chọn sai, giữ nguyên màn; nếu không, tăng màn lên 1
        let newLevel = hadIncorrectInLevelRef.current ? level.current : level.current + 1;
        let newDifficulty = difficulty.current; // Giữ nguyên cấp độ khó ban đầu
        displayLevel.current++; // Tăng số màn hiển thị cho người chơi
        
        // Nếu có chọn sai trong màn này, đánh dấu là đã có sai trong toàn bộ game
        if (hadIncorrectInLevelRef.current) {
            hadIncorrectRef.current = true;        
        }

        // Nếu đã hoàn thành hết các màn của cấp độ khó hiện tại
        if (displayLevel.current > difficulties[newDifficulty].levels.length) {
            pointsRef.current = 0;
            newLevel = 0; // Reset về màn đầu tiên
            displayLevel.current = 1; // Reset số màn hiển thị về 1
            
            // Nếu chưa có lần chọn sai nào, tăng cấp độ khó; nếu không, giữ nguyên
            newDifficulty = hadIncorrectRef.current ? difficulty.current : difficulty.current + 1;
            
            // Nếu vượt quá số cấp độ khó, quay lại cấp độ đầu tiên
            if (newDifficulty > difficulties.length) {
                newDifficulty = 0;
            }
            
            // Lưu cấp độ khó mới vào bộ nhớ cục bộ
            setStoredDifficulty(newDifficulty.toString());
        }        
        // Cập nhật màn chơi và cấp độ khó hiện tại
        level.current = newLevel;
        difficulty.current = newDifficulty;    
    }

    // useEffect theo dõi số ô đã chọn, xử lý khi đủ điều kiện kết thúc màn
    useEffect(() => {
        // Nếu chưa chọn đủ số đá quý cần thiết và chưa chọn sai, không làm gì cả
        if ((selectedCount < gameConfigRef.current.BULBS_COUNT) && !hadIncorrectInLevelRef.current) {
            return;
        } else {            
            // Tính toán tổng thời gian cho tất cả ô biến mất (hiệu ứng)
            const tilesCount = difficulties[difficulty.current].levels[level.current].GRID_WIDTH * 
                              difficulties[difficulty.current].levels[level.current].GRID_HEIGHT;
            const lastTileDelay = (tilesCount - 1) * ANIMATION_CONFIG.TILE_DELAY_INCREMENT; // Độ trễ cho mỗi ô
            const exitAnimationDuration = lastTileDelay + ANIMATION_CONFIG.TILE_FADE_OUT_DURATION; // Tổng thời gian hiệu ứng
            
            // Kích hoạt trạng thái kết thúc màn nhưng giữ hiển thị đá quý cho đến khi hoàn tất hiệu ứng
            gameOverRef.current = true;
            triggerRerender((prev) => prev + 1);
            
            // Đợi hiệu ứng xong rồi chuyển màn
            setTimeout(() => {
                isShowingBulbsRef.current = false;
                triggerRerender((prev) => prev + 1);
                
                // Chuyển sang màn tiếp theo
                changeLevel();
                
                // Bắt đầu màn mới sau một khoảng thời gian chờ
                setTimeout(() => {
                    startGame();
                }, ANIMATION_CONFIG.LEVEL_TRANSITION_DELAY);
            }, exitAnimationDuration);
        }
    }, [selectedCount]);

    // useEffect khởi tạo game khi component mount
    useEffect(() => {
        startGame();
    }, [])

    // Giao diện chính của trò chơi
    return (
        <View style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height, backgroundColor: '#1c535e', paddingTop: StatusBar.currentHeight }}>
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Header hiển thị thông tin màn chơi, điểm số */}
                <Header
                    currentLevel={displayLevel.current}
                    totalLevels={difficulties[difficulty.current].levels.length}
                    currentScore={pointsRef.current}
                />

                <View style={{ width: '100%', paddingHorizontal: 10, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    {/* Hiển thị lưới game nếu không trong trạng thái chuyển màn */}
                    {!isChangingLevelRef.current && (
                        <>
                            <View style={{ width: '90%', paddingVertical: 3, backgroundColor: 'rgba(10, 31, 36, 0.3)', borderRadius: 30, alignItems: 'center' }}>
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>Follow the bulbs 💡</Text>
                            </View>
                            <View style={{ width: '100%', marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
                                <Grid
                                    key={`grid-${difficulty.current}-${level}`}
                                    difficulty={difficulty.current}
                                    level={level.current}
                                    hadIncorrectInLevelRef={hadIncorrectInLevelRef}
                                    isShowingBulbs={isShowingBulbsRef.current}
                                    selectedCount={selectedCount}
                                    setSelectedCount={setSelectedCount}
                                    gameOver={gameOverRef.current}
                                    pointsRef={pointsRef}
                                />
                            </View>
                        </>)}
                </View>

                <View />
            </View>
        </View>
    )
}

export default StrangeSignals