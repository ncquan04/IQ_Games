// Trò chơi Hidden Gems: Người chơi cần ghi nhớ vị trí các viên đá quý trên lưới, sau đó tìm lại chúng khi chúng bị ẩn đi
import { View, Text, Dimensions, StatusBar } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Header from '../../components/Header'
import Grid from './components/Grid'

import difficulties from './data/difficulties.json' // Dữ liệu về các cấp độ khó khác nhau
import { useStorage } from '../../hooks/useStorage' // Hook lưu trữ dữ liệu cục bộ
import { ANIMATION_CONFIG } from './config/animationConfig' // Cấu hình hiệu ứng
import PauseModal from '../../components/PauseModal' // Modal tạm dừng
import InstructionModal from '../../components/InstructionModal' // Modal hướng dẫn
import { ModalBaseRef } from '../../components/ModalBase' // Kiểu tham chiếu cho modal

const HiddenGems = () => {
    // Lưu và lấy cấp độ khó từ bộ nhớ cục bộ
    const [storedDifficulty, setStoredDifficulty] = useStorage('hiddenGemsDifficulty', '0');
    const difficulty = useRef<number>(parseInt(storedDifficulty)); // Cấp độ khó hiện tại
    const level = useRef<number>(0); // Cấp độ hiện tại (số thứ tự thực tế)
    const displayLevel = useRef<number>(1); // Cấp độ hiển thị cho người chơi (bắt đầu từ 1)
    const pointsRef = useRef<number>(0); // Điểm số của người chơi
    const hadIncorrectRef = useRef<boolean>(false); // Đánh dấu có lựa chọn sai trong toàn bộ game
    const hadIncorrectInLevelRef = useRef<boolean>(false); // Đánh dấu có lựa chọn sai trong màn chơi hiện tại
    const isShowingGemsRef = useRef<boolean>(false); // Trạng thái hiển thị các viên đá quý
    const gameOverRef = useRef<boolean>(false); // Trạng thái kết thúc màn chơi
    const isChangingLevelRef = useRef<boolean>(false); // Trạng thái đang chuyển cấp độ
    const [selectedCount, setSelectedCount] = useState<number>(0); // Số lần đã chọn ô
    // Cấu hình trò chơi dựa trên cấp độ khó và màn chơi
    const gameConfigRef = useRef({
        GEMS_COUNT: difficulties[difficulty.current].levels[level.current].GEMS_COUNT, // Số lượng đá quý
        HIDE_GEMS_TIMEOUT: difficulties[difficulty.current].levels[level.current].HIDE_GEMS_TIMEOUT, // Thời gian hiển thị đá quý
    });
    // Tham chiếu đến các modal
    const pauseModalRef = useRef<ModalBaseRef>(null) as React.RefObject<ModalBaseRef>;
    const instructionModalRef = useRef<ModalBaseRef>(null) as React.RefObject<ModalBaseRef>;
    const [ , triggerRerender ] = useState<number>(0); // Biến để kích hoạt render lại giao diện
      /**
     * Bắt đầu một màn chơi mới
     * - Thiết lập cấu hình trò chơi
     * - Hiển thị vị trí đá quý cho người chơi ghi nhớ
     * - Sau đó ẩn đá quý và cho phép người chơi bắt đầu chọn
     */
    const startGame = () => {
        // Đảm bảo isShowingGemsRef.current là false trước khi bắt đầu
        isShowingGemsRef.current = false;
        
        // Cập nhật cấu hình trò chơi theo cấp độ khó và màn chơi hiện tại
        gameConfigRef.current = {
            GEMS_COUNT: difficulties[difficulty.current].levels[level.current].GEMS_COUNT, // Số lượng đá quý
            HIDE_GEMS_TIMEOUT: difficulties[difficulty.current].levels[level.current].HIDE_GEMS_TIMEOUT, // Thời gian hiển thị đá quý
        };
        isChangingLevelRef.current = false; // Không còn trong trạng thái chuyển màn
        gameOverRef.current = false; // Không còn trong trạng thái kết thúc màn
        hadIncorrectInLevelRef.current = false; // Reset trạng thái chọn sai
        
        // Tính toán tổng thời gian cho tất cả ô xuất hiện dần dần
        const tilesCount = difficulties[difficulty.current].levels[level.current].GRID_WIDTH * 
                          difficulties[difficulty.current].levels[level.current].GRID_HEIGHT;
        const lastTileDelay = (tilesCount - 1) * ANIMATION_CONFIG.TILE_DELAY_INCREMENT; // Độ trễ cho mỗi ô
        const fadeInAnimationDuration = lastTileDelay + ANIMATION_CONFIG.ANIMATION_BUFFER; // Độ trễ cuối cùng + thời gian đệm
        
        // Kích hoạt render lại để hiển thị lưới trò chơi trước
        triggerRerender((prev) => prev + 1);
        
        // Đợi tất cả các ô xuất hiện trước khi hiển thị đá quý
        setTimeout(() => {
            isShowingGemsRef.current = true; // Hiển thị đá quý
            triggerRerender((prev) => prev + 1);
            
            // Ẩn đá quý sau khoảng thời gian đã cấu hình
            setTimeout(() => {
                isShowingGemsRef.current = false; // Ẩn đá quý
                setSelectedCount(0); // Reset số lần đã chọn
                triggerRerender((prev) => prev + 1);
            }, gameConfigRef.current.HIDE_GEMS_TIMEOUT);
        }, fadeInAnimationDuration);
    }    // Bắt đầu trò chơi khi component được tạo
    useEffect(() => {
        startGame();
    }, []);

    /**
     * Tiếp tục trò chơi sau khi tạm dừng
     * - Chỉ khởi động lại nếu chưa chọn ô nào
     */
    const continueGame = () => {
        if (selectedCount === 0) {
            startGame();
        }
    }/**
     * Chuyển sang màn chơi tiếp theo hoặc cấp độ khó tiếp theo
     * - Nếu người chơi chọn sai trong màn này, giữ nguyên màn nhưng tăng số hiển thị
     * - Nếu hoàn thành hết các màn ở cấp độ hiện tại, chuyển sang cấp độ khó hơn
     */
    const changeLevel = () => {
        isChangingLevelRef.current = true; // Đánh dấu đang trong quá trình chuyển màn
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
    
    /**
     * Xử lý khi người chơi đã chọn xong tất cả các ô trong màn hiện tại
     * - Tính toán thời gian cho hiệu ứng kết thúc màn
     * - Chuyển sang màn mới và bắt đầu màn mới
     */
    useEffect(() => {
        // Nếu chưa chọn đủ số đá quý cần thiết, không làm gì cả
        if (selectedCount < gameConfigRef.current.GEMS_COUNT) {
            return;
        } else {            
            // Tính toán tổng thời gian cho tất cả ô biến mất
            const tilesCount = difficulties[difficulty.current].levels[level.current].GRID_WIDTH * 
                              difficulties[difficulty.current].levels[level.current].GRID_HEIGHT;
            const lastTileDelay = (tilesCount - 1) * ANIMATION_CONFIG.TILE_DELAY_INCREMENT; // Độ trễ cho mỗi ô
            const exitAnimationDuration = lastTileDelay + ANIMATION_CONFIG.TILE_FADE_OUT_DURATION; // Độ trễ cuối cùng + thời gian hiệu ứng
            
            // Kích hoạt trạng thái kết thúc màn nhưng giữ hiển thị đá quý cho đến khi hoàn tất hiệu ứng
            gameOverRef.current = true;
            triggerRerender((prev) => prev + 1);
            
            // Đợi tất cả các ô hoàn tất hiệu ứng biến mất trước khi thay đổi trạng thái hiển thị đá quý
            setTimeout(() => {
                isShowingGemsRef.current = false;
                triggerRerender((prev) => prev + 1);
                
                // Chuyển sang màn tiếp theo
                changeLevel();
                
                // Bắt đầu màn mới sau một khoảng thời gian chờ
                setTimeout(() => {
                    startGame();
                }, ANIMATION_CONFIG.LEVEL_TRANSITION_DELAY);
            }, exitAnimationDuration);
        }
    }, [selectedCount]); // Theo dõi sự thay đổi của số lần đã chọn

    return (
        <View style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height, backgroundColor: '#1c535e', paddingTop: StatusBar.currentHeight }}>
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                <Header
                    currentLevel={displayLevel.current}
                    totalLevels={difficulties[difficulty.current].levels.length}
                    currentScore={pointsRef.current}
                    pauseModalRef={pauseModalRef}
                    instructionModalRef={instructionModalRef}
                />
                <View style={{ width: '100%', paddingHorizontal: 10, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    {!isChangingLevelRef.current && (
                        <>
                            <View style={{ width: '90%', paddingVertical: 3, backgroundColor: 'rgba(10, 31, 36, 0.3)', borderRadius: 30, alignItems: 'center' }}>
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>{isShowingGemsRef.current ? 'Tap the tiles to find gems 💎' : `${gameConfigRef.current.GEMS_COUNT - selectedCount} tries left`}</Text>
                            </View>
                            <View style={{ width: '100%', marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
                                <Grid
                                    key={`grid-${difficulty.current}-${level}`}
                                    difficulty={difficulty.current}
                                    level={level.current}
                                    hadIncorrectInLevelRef={hadIncorrectInLevelRef}
                                    isShowingGems={isShowingGemsRef.current}
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
            <PauseModal
                continueGame={() => { }}
                restartGame={() => { }}
                instructionModalRef={instructionModalRef}
                ref={pauseModalRef}
            />
            <InstructionModal
                ref={instructionModalRef}
            />
        </View>
    )
}

export default HiddenGems