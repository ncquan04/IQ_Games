import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import PauseIcon from '../../../assets/icons/PauseIcon'
import QuestionMarkIcon from '../../../assets/icons/QuestionMarkIcon'
import { ModalBaseRef } from '../../../components/ModalBase';

interface HeaderProps {
    currentLevel: number;
    totalLevels: number;
    currentScore: number;
    pauseModalRef: React.RefObject<ModalBaseRef>;
    instructionModalRef: React.RefObject<ModalBaseRef>;
}

const Header = ({ currentLevel, totalLevels, currentScore, pauseModalRef, instructionModalRef}: HeaderProps) => {

    return (
        <View style={{width: '100%', paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <TouchableOpacity 
                style={{width: 40, height: 40, backgroundColor: '#236c7a', borderRadius: '100%', justifyContent: 'center', alignItems: 'center'}}
                onPress={() => pauseModalRef.current.show()}
            >
                <PauseIcon width={20} height={20} fill={'#fff'}/>
            </TouchableOpacity>
            <View style={{width: '70%', paddingHorizontal: 10, backgroundColor: '#0a1f24', borderRadius: 30, paddingVertical: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View/>
                <View>
                    <Text style={{color: 'white', fontSize: 16, fontWeight: 500}}>{currentLevel} / {totalLevels}</Text>
                </View>
                <View>
                    <Text style={{color: 'white', fontSize: 16, fontWeight: 500}}>{currentScore}</Text>
                </View>
            </View>
            <TouchableOpacity 
                style={{width: 40, height: 40, backgroundColor: '#236c7a', borderRadius: '100%', justifyContent: 'center', alignItems: 'center'}}
                onPress={() => instructionModalRef.current.show()}
            >
                <QuestionMarkIcon width={20} height={20} fill={'#fff'}/>
            </TouchableOpacity>
        </View>
    )
}

export default Header