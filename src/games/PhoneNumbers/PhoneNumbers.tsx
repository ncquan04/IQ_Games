/**
 * Trò chơi Số Điện Thoại - Một trò chơi luyện trí nhớ, người chơi ghi nhớ và nhập lại các số điện thoại
 * trong khoảng thời gian giới hạn, với độ khó tăng dần.
 * 
 * Cách chơi:
 * - Số điện thoại hiển thị trong một khoảng thời gian ngắn
 * - Người chơi phải ghi nhớ và nhập lại số đó
 * - Điểm được tính dựa trên số chữ số đúng
 * - Độ khó tăng dần theo cấp độ và số lượng chữ số
 */
import { View, Text, Dimensions, StatusBar, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Header from '../../components/Header'
import Numpad from './components/Numpad'
import VisitCardIcon from './icons/VisitCardIcon'
import Animated, { Easing, FlipInEasyX, FlipOutEasyX, StretchInX, StretchOutX } from 'react-native-reanimated'
import DIFFICULTIES from './data/difficulties.json'
import { useStorage } from '../../hooks/useStorage'
import { ModalBaseRef } from '../../components/ModalBase'
import PauseModal from '../../components/PauseModal'
import InstructionModal from '../../components/InstructionModal'

// Danh sách tên người ngẫu nhiên để hiển thị trên thẻ liên hệ
const RandomNames = [
    'John Doe',
    'Jane Smith',
    'Alice Johnson',
    'Bob Brown',
    'Charlie Davis',
    'Emily Wilson',
    'David Miller',
    'Sophia Taylor',
    'Michael Anderson',
    'Olivia Thomas',
    'James Jackson',
    'Isabella White',
    'Emma Thompson',
    'William Garcia',
    'Ava Martinez',
    'Noah Rodriguez',
    'Sophia Lee',
    'Liam Walker',
    'Charlotte Hall',
    'Mason Allen',
    'Amelia Young',
    'Ethan Hernandez',
    'Harper Scott',
    'Lucas King',
    'Mia Wright',
    'Benjamin Turner',
    'Lily Nelson',
    'Elijah Carter',
    'Abigail Adams',
    'Daniel Lewis',
    'Sofia Clark',
    'Matthew Hill',
    'Grace Baker',
    'Andrew Parker',
    'Chloe Evans',
    'Samuel Morris',
    'Zoe Collins',
    'Joseph Phillips',
    'Victoria Stewart',
    'Henry Cooper',
    'Penelope Reed',
    'Alexander Russell',
    'Hannah Butler',
    'Ryan Brooks',
    'Natalie Price',
    'Jack Morgan',
    'Evelyn Kelly'
]

const PhoneNumbers = () => {
    // Lưu trữ số điện thoại ngẫu nhiên hiện tại
    const randomNumberRef = useRef<string>('');
    // Mảng lưu trữ các chữ số mà người dùng đã nhập
    const currentInputRef = useRef<string[]>([]);
    // Tên ngẫu nhiên hiển thị trên thẻ liên hệ
    const randomNameRef = useRef<string>(RandomNames[Math.floor(Math.random() * RandomNames.length)]);
    // Trạng thái hiển thị số điện thoại (true) hoặc ẩn số (false)
    const showNumberRef = useRef<boolean>(true);
    // Trạng thái đã nộp kết quả hay chưa
    const submittedRef = useRef<boolean>(false);
    // Mảng lưu trạng thái đúng/sai của từng chữ số
    const isCorrectRef = useRef<boolean[]>([]);
    // Đánh dấu khi đang chuyển cấp độ
    const isChangingLevelRef = useRef<boolean>(false);
    // Điểm số hiện tại của người chơi
    const pointsRef = useRef<number>(0);
    // Lưu trữ độ khó vào bộ nhớ để giữ giữa các lần chơi
    const [savedDifficulty, setSavedDifficulty] = useStorage('PhoneNumbersDifficulty', '0');
    // Độ khó hiện tại (lấy từ bộ nhớ hoặc mặc định là 0)
    const difficultyRef = useRef<number>(savedDifficulty ? parseInt(savedDifficulty) : 0);
    // Cấp độ hiện tại trong độ khó
    const levelRef = useRef<number>(0);
    // Đánh dấu nếu người chơi đã có câu trả lời sai
    const hadIncorrectRef = useRef<boolean>(false);
    // Tham chiếu đến modal tạm dừng
    const pauseModalRef = useRef<ModalBaseRef>(null) as React.RefObject<ModalBaseRef>;
    // Tham chiếu đến modal hướng dẫn
    const instructionModalRef = useRef<ModalBaseRef>(null) as React.RefObject<ModalBaseRef>;
    // Cấu hình trò chơi dựa trên độ khó và cấp độ hiện tại
    const gameConfigRef = useRef<{NUMBER_LENGTH: number, HIDE_NUMBER_TIMEOUT: number, POINTS_PER_DIGIT: number}>({
        NUMBER_LENGTH: DIFFICULTIES[difficultyRef.current].levels[0].NUMBER_LENGTH, 
        HIDE_NUMBER_TIMEOUT: DIFFICULTIES[difficultyRef.current].levels[0].HIDE_NUMBER_TIMEOUT, 
        POINTS_PER_DIGIT: DIFFICULTIES[difficultyRef.current].levels[0].POINTS_PER_DIGIT
    });
    // State rỗng được sử dụng để kích hoạt render lại UI
    const [ , triggerRerender] = useState(0);
    
    // AsyncStorage.setItem('PhoneNumbersDifficulty', '0');
    
    // useEffect(() => {
    //     const fetchDifficulty = async () => {
    //         try {
    //             const savedDiffivulty = await AsyncStorage.getItem('PhoneNumbersDifficulty');
    //             if (savedDiffivulty) {
    //                 difficultyRef.current = parseInt(savedDiffivulty);
    //                 triggerRerender(prev => prev + 1);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching difficulty:', error);
    //         }
    //     }
    //     fetchDifficulty();
    // }, []);
    
    // Hàm tạo số điện thoại ngẫu nhiên với độ dài xác định
    const generateRandomNumber = (length: number): string => {
        let randomNumber = '';
        for (let i = 0; i < length; i++) {
            randomNumber += Math.floor(Math.random() * 10).toString();
        }
        return randomNumber;
    }
    
    // Hàm kiểm tra kết quả người chơi đã nhập
    const checkResult = () => {
        submittedRef.current = true;
        let correctDigitCount = 0;
        for (let i = 0; i < currentInputRef.current.length; i++) {
            if (currentInputRef.current[i] === randomNumberRef.current[i]) {
                correctDigitCount++;
                isCorrectRef.current[i] = true;
            } else {
                isCorrectRef.current[i] = false;
                hadIncorrectRef.current = true;
            }
        }
        // Tính điểm dựa trên số chữ số đúng
        pointsRef.current += correctDigitCount * gameConfigRef.current.POINTS_PER_DIGIT;
        setTimeout(() => {
            changeLevel();
        }, 3000);
        triggerRerender(prev => prev + 1);
    }
    
    // Hàm bắt đầu trò chơi, khởi tạo số điện thoại và hiển thị trong thời gian giới hạn
    const startGame = () => {
        // Tạo số ngẫu nhiên mới với độ dài tương ứng với cấp độ
        randomNumberRef.current = generateRandomNumber(gameConfigRef.current.NUMBER_LENGTH);
        // Chọn tên ngẫu nhiên từ danh sách
        randomNameRef.current = RandomNames[Math.floor(Math.random() * RandomNames.length)];
        // Khởi tạo mảng input trống
        currentInputRef.current = Array(randomNumberRef.current.length).fill('');
        // Hiển thị số điện thoại
        showNumberRef.current = true;
        isCorrectRef.current = [];
        submittedRef.current = false;
        triggerRerender(prev => prev + 1);
        // Sau thời gian quy định, ẩn số điện thoại để người chơi nhập
        setTimeout(() => {
            showNumberRef.current = false;
            triggerRerender(prev => prev + 1);
        }, gameConfigRef.current.HIDE_NUMBER_TIMEOUT);
    }
    
    // Hàm khởi động lại trò chơi, đặt lại tất cả về ban đầu
    const restartGame = () => {
        pauseModalRef.current.hide();
        startGame();
    }

    // Hàm tiếp tục trò chơi sau khi tạm dừng
    const continueGame = () => {
        // Nếu người chơi chưa nhập số nào, bắt đầu lại
        if (currentInputRef.current.every((item) => item === '')) {
            restartGame();
            return;
        } else {
            // Nếu đã nhập, chỉ ẩn modal tạm dừng
            pauseModalRef.current.hide();
            return;
        }
    }
    
    // Hàm chuyển sang cấp độ tiếp theo sau khi hoàn thành cấp độ hiện tại
    const changeLevel = () => {
        console.log('Current difficulty:', difficultyRef.current);
        // Đánh dấu đang trong quá trình chuyển cấp độ
        isChangingLevelRef.current = true;
        levelRef.current++;
        // Kiểm tra nếu đã hoàn thành tất cả các cấp độ trong độ khó hiện tại
        if (levelRef.current > DIFFICULTIES[difficultyRef.current].levels.length - 1) {
            // Đặt lại về cấp độ đầu tiên
            levelRef.current = 0;
            pointsRef.current = 0;
            // Nếu người chơi không mắc lỗi nào, tăng độ khó
            if (!hadIncorrectRef.current) {
                difficultyRef.current++;
                // Nếu đã vượt qua tất cả các độ khó, quay lại độ khó đầu tiên
                if (difficultyRef.current > DIFFICULTIES.length - 1) {
                    difficultyRef.current = 0;
                }
                // Lưu độ khó mới vào bộ nhớ
                setSavedDifficulty(difficultyRef.current.toString());
            }
        }
        // Cập nhật cấu hình trò chơi theo cấp độ và độ khó mới
        gameConfigRef.current = {
            NUMBER_LENGTH: DIFFICULTIES[difficultyRef.current].levels[levelRef.current].NUMBER_LENGTH, 
            HIDE_NUMBER_TIMEOUT: DIFFICULTIES[difficultyRef.current].levels[levelRef.current].HIDE_NUMBER_TIMEOUT, 
            POINTS_PER_DIGIT: DIFFICULTIES[difficultyRef.current].levels[levelRef.current].POINTS_PER_DIGIT
        };
        triggerRerender(prev => prev + 1);
        // Sau một khoảng thời gian chuyển tiếp, bắt đầu cấp độ mới
        setTimeout(() => {
            isChangingLevelRef.current = false;
            startGame();
        }, 1000);
    }    /**
     * Khởi tạo trò chơi khi component được render lần đầu
     * Gọi hàm startGame để bắt đầu trò chơi
     */
    useEffect(() => {
        startGame();
    }, []);

    return (
        <View style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height, backgroundColor: '#1c535e', paddingTop: StatusBar.currentHeight }}>

            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Header hiển thị thông tin cấp độ và điểm số */}
                <Header
                    currentLevel={levelRef.current + 1}
                    totalLevels={DIFFICULTIES[difficultyRef.current].levels.length}
                    currentScore={pointsRef.current}
                    pauseModalRef={pauseModalRef}
                    instructionModalRef={instructionModalRef}
                />                {/* Khu vực hiển thị thẻ liên hệ và số điện thoại */}
                <View style={{ width: '100%', paddingHorizontal: 10, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {/* Tiêu đề hướng dẫn */}
                    <View style={{ width: '90%', paddingVertical: 3, backgroundColor: 'rgba(10, 31, 36, 0.3)', borderRadius: 30, alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>Input the number</Text>
                    </View>
                    {/* Hiển thị thẻ liên hệ với hiệu ứng khi không đang chuyển cấp độ */}
                    {!isChangingLevelRef.current ?
                        <Animated.View
                            entering={StretchInX.duration(500).easing(Easing.inOut(Easing.quad))}
                            exiting={StretchOutX.duration(500).easing(Easing.inOut(Easing.quad))}
                            style={{ position: 'relative', marginTop: 10, width: '100%', aspectRatio: 379.03 / 271.81, backgroundColor: 'rgba(64, 200, 227, 0.3)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 20, overflow: 'hidden' }}
                        >                            {/* Hình nền thẻ liên hệ */}
                            <VisitCardIcon
                                width="100%"
                                fill={'#40c8e3'}
                            />
                            {/* Hiển thị tên ngẫu nhiên */}
                            <Text style={{ position: 'absolute', marginTop: 10, alignSelf: 'flex-start', color: 'rgba(24, 30, 31, 0.5)', fontSize: 20, fontWeight: 'bold' }}>
                                {randomNameRef.current}
                            </Text>
                            {/* Điều kiện hiển thị: số điện thoại hoặc ô nhập liệu */}
                            {showNumberRef.current ?
                                <Animated.View key="showNumber" exiting={FlipOutEasyX} style={{ position: 'absolute', marginBottom: 15, alignSelf: 'flex-end' }}>
                                    {/* Hiển thị số điện thoại cần ghi nhớ */}
                                    <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold', letterSpacing: 8 }}>
                                        {randomNumberRef.current}
                                    </Text>
                                </Animated.View>
                                :
                                <Animated.View key="showInput" entering={FlipInEasyX} exiting={FlipOutEasyX} style={{ position: 'absolute', width: '95%', height: 45, borderRadius: 30, marginBottom: 15, backgroundColor: '#113840', alignSelf: 'flex-end', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>                                    {/* Render từng ô nhập số */}
                                    {currentInputRef.current.map((item, index) => (
                                        <View key={index} style={{ width: 24, height: 24, marginHorizontal: 3, justifyContent: 'center', alignItems: 'center' }}>
                                            {item !== '' ? (
                                                // Hiển thị số đã nhập với màu sắc phản ánh đúng/sai khi đã nộp đáp án
                                                <Text style={{ color: submittedRef.current ? (isCorrectRef.current[index] ? 'rgba(94, 245, 126, 0.8)' : 'rgba(242, 87, 66, 0.8)') : 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', lineHeight: 24 }}>{item}</Text>
                                            ) : (
                                                // Hiển thị ô trống khi chưa nhập số
                                                <View style={{ width: 24, height: 24, backgroundColor: '#236c7a', borderRadius: 100 }} />
                                            )}
                                        </View>
                                    ))}
                                </Animated.View>}                        
                        </Animated.View>
                        :
                        // Hiển thị khoảng trống khi đang chuyển cấp độ
                        <View style={{ marginTop: 10, width: '100%', aspectRatio: 379.03 / 271.81 }}></View>}
                </View>
                {/* Bàn phím số để người chơi nhập số điện thoại */}
                <Numpad
                    currentInputRef={currentInputRef}
                    triggerRerender={() => triggerRerender(prev => prev + 1)}
                    checkResult={() => checkResult()}
                    showNumberRef={showNumberRef}
                />            </View>

            {/* Modal hiển thị khi người chơi tạm dừng trò chơi */}
            <PauseModal
                ref={pauseModalRef} 
                continueGame={continueGame}
                restartGame={restartGame}
                onRequestClose={continueGame}
                instructionModalRef={instructionModalRef}
            />

            {/* Modal hiển thị hướng dẫn cách chơi */}
            <InstructionModal 
                ref={instructionModalRef}
            />
        </View>
    )
}

export default PhoneNumbers