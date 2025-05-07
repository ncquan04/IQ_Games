import { View, Text, Dimensions, StatusBar, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import Numpad from './components/Numpad'
import VisitCardIcon from './icons/VisitCardIcon'
import Animated, { Easing, FlipInEasyX, FlipOutEasyX, StretchInX, StretchOutX } from 'react-native-reanimated'
import DIFFICULTIES from './data/difficulties.json'
import { useStorage } from '../../hooks/useStorage'
import { ModalBaseRef } from '../../components/ModalBase'
import PauseModal from '../../components/PauseModal'
import InstructionModal from '../../components/InstructionModal'

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
    const randomNumberRef = useRef<string>('');
    const currentInputRef = useRef<string[]>([]);
    const randomNameRef = useRef<string>(RandomNames[Math.floor(Math.random() * RandomNames.length)]);
    const showNumberRef = useRef<boolean>(true);
    const submittedRef = useRef<boolean>(false);
    const isCorrectRef = useRef<boolean[]>([]);
    const isChangingLevelRef = useRef<boolean>(false);
    const pointsRef = useRef<number>(0);
    const [savedDifficulty, setSavedDifficulty] = useStorage('PhoneNumbersDifficulty', '0');
    const difficultyRef = useRef<number>(savedDifficulty ? parseInt(savedDifficulty) : 0);
    const levelRef = useRef<number>(0);
    const hadIncorrectRef = useRef<boolean>(false);
    const pauseModalRef = useRef<ModalBaseRef>(null) as React.RefObject<ModalBaseRef>;
    const instructionModalRef = useRef<ModalBaseRef>(null) as React.RefObject<ModalBaseRef>;
    const gameConfigRef = useRef<{NUMBER_LENGTH: number, HIDE_NUMBER_TIMEOUT: number, POINTS_PER_DIGIT: number}>({
        NUMBER_LENGTH: DIFFICULTIES[difficultyRef.current].levels[0].NUMBER_LENGTH, 
        HIDE_NUMBER_TIMEOUT: DIFFICULTIES[difficultyRef.current].levels[0].HIDE_NUMBER_TIMEOUT, 
        POINTS_PER_DIGIT: DIFFICULTIES[difficultyRef.current].levels[0].POINTS_PER_DIGIT
    });
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

    const generateRandomNumber = (length: number): string => {
        let randomNumber = '';
        for (let i = 0; i < length; i++) {
            randomNumber += Math.floor(Math.random() * 10).toString();
        }
        return randomNumber;
    }

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
        pointsRef.current += correctDigitCount * gameConfigRef.current.POINTS_PER_DIGIT;
        setTimeout(() => {
            changeLevel();
        }, 3000);
        triggerRerender(prev => prev + 1);
    }

    const startGame = () => {
        randomNumberRef.current = generateRandomNumber(gameConfigRef.current.NUMBER_LENGTH);
        randomNameRef.current = RandomNames[Math.floor(Math.random() * RandomNames.length)];
        currentInputRef.current = Array(randomNumberRef.current.length).fill('');
        showNumberRef.current = true;
        isCorrectRef.current = [];
        submittedRef.current = false;
        triggerRerender(prev => prev + 1);
        setTimeout(() => {
            showNumberRef.current = false;
            triggerRerender(prev => prev + 1);
        }, gameConfigRef.current.HIDE_NUMBER_TIMEOUT);
    }

    const restartGame = () => {
        pauseModalRef.current.hide();
        startGame();
    }

    const continueGame = () => {
        if (currentInputRef.current.every((item) => item === '')) {
            restartGame();
            return;
        } else {
            pauseModalRef.current.hide();
            return;
        }
    }

    const changeLevel = () => {
        console.log('Current difficulty:', difficultyRef.current);
        isChangingLevelRef.current = true;
        levelRef.current++;
        if (levelRef.current > DIFFICULTIES[difficultyRef.current].levels.length - 1) {
            levelRef.current = 0;
            pointsRef.current = 0;
            if (!hadIncorrectRef.current) {
                difficultyRef.current++;
                if (difficultyRef.current > DIFFICULTIES.length - 1) {
                    difficultyRef.current = 0;
                }
                setSavedDifficulty(difficultyRef.current.toString());
            }
        }
        gameConfigRef.current = {
            NUMBER_LENGTH: DIFFICULTIES[difficultyRef.current].levels[levelRef.current].NUMBER_LENGTH, 
            HIDE_NUMBER_TIMEOUT: DIFFICULTIES[difficultyRef.current].levels[levelRef.current].HIDE_NUMBER_TIMEOUT, 
            POINTS_PER_DIGIT: DIFFICULTIES[difficultyRef.current].levels[levelRef.current].POINTS_PER_DIGIT
        };
        triggerRerender(prev => prev + 1);
        setTimeout(() => {
            isChangingLevelRef.current = false;
            startGame();
        }, 1000);
    }
 
    useEffect(() => {
        startGame();
    }, []);

    return (
        <View style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height, backgroundColor: '#1c535e', paddingTop: StatusBar.currentHeight }}>

            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                <Header
                    currentLevel={levelRef.current + 1}
                    totalLevels={DIFFICULTIES[difficultyRef.current].levels.length}
                    currentScore={pointsRef.current}
                    pauseModalRef={pauseModalRef}
                    instructionModalRef={instructionModalRef}
                />
                <View style={{ width: '100%', paddingHorizontal: 10, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '90%', paddingVertical: 3, backgroundColor: 'rgba(10, 31, 36, 0.3)', borderRadius: 30, alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>Input the number</Text>
                    </View>
                    {!isChangingLevelRef.current ?
                        <Animated.View
                            entering={StretchInX.duration(500).easing(Easing.inOut(Easing.quad))}
                            exiting={StretchOutX.duration(500).easing(Easing.inOut(Easing.quad))}
                            style={{ position: 'relative', marginTop: 10, width: '100%', aspectRatio: 379.03 / 271.81, backgroundColor: 'rgba(64, 200, 227, 0.3)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 20, overflow: 'hidden' }}
                        >
                            <VisitCardIcon
                                width="100%"
                                fill={'#40c8e3'}
                            />
                            <Text style={{ position: 'absolute', marginTop: 10, alignSelf: 'flex-start', color: 'rgba(24, 30, 31, 0.5)', fontSize: 20, fontWeight: 'bold' }}>
                                {randomNameRef.current}
                            </Text>
                            {showNumberRef.current ?
                                <Animated.View key="showNumber" exiting={FlipOutEasyX} style={{ position: 'absolute', marginBottom: 15, alignSelf: 'flex-end' }}>
                                    <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold', letterSpacing: 8 }}>
                                        {randomNumberRef.current}
                                    </Text>
                                </Animated.View>
                                :
                                <Animated.View key="showInput" entering={FlipInEasyX} exiting={FlipOutEasyX} style={{ position: 'absolute', width: '95%', height: 45, borderRadius: 30, marginBottom: 15, backgroundColor: '#113840', alignSelf: 'flex-end', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    {currentInputRef.current.map((item, index) => (
                                        <View key={index} style={{ width: 24, height: 24, marginHorizontal: 3, justifyContent: 'center', alignItems: 'center' }}>
                                            {item !== '' ? (
                                                <Text style={{ color: submittedRef.current ? (isCorrectRef.current[index] ? 'rgba(42, 244, 86, 0.8)' : 'rgba(254, 47, 20, 0.8)') : 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', lineHeight: 24 }}>{item}</Text>
                                            ) : (
                                                <View style={{ width: 24, height: 24, backgroundColor: '#236c7a', borderRadius: 100 }} />
                                            )}
                                        </View>
                                    ))}
                                </Animated.View>}
                        </Animated.View>
                        :
                        <View style={{ marginTop: 10, width: '100%', aspectRatio: 379.03 / 271.81 }}></View>}
                </View>
                <Numpad
                    currentInputRef={currentInputRef}
                    triggerRerender={() => triggerRerender(prev => prev + 1)}
                    checkResult={() => checkResult()}
                    showNumberRef={showNumberRef}
                />
            </View>

            <PauseModal
                ref={pauseModalRef} 
                continueGame={continueGame}
                restartGame={restartGame}
                onRequestClose={continueGame}
                instructionModalRef={instructionModalRef}
            />

            <InstructionModal 
                ref={instructionModalRef}
            />
        </View>
    )
}

export default PhoneNumbers