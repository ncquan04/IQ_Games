import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import ModalBase, { ModalBaseRef } from './ModalBase'
import ContinueIcon from '../assets/icons/ContinueIcon';
import RestartIcon from '../assets/icons/RestartIcon';
import QuestionMarkIcon from '../assets/icons/QuestionMarkIcon';
import ExitIcon from '../assets/icons/ExitIcon';

interface PauseModalProps {
    ref: React.RefObject<ModalBaseRef>;
    continueGame: () => void;
    restartGame: () => void;
    onRequestClose?: () => void;
    instructionModalRef?: React.RefObject<ModalBaseRef>;
}

const PauseModal = ({ref, continueGame, restartGame, onRequestClose, instructionModalRef}: PauseModalProps) => {
    return (
        <ModalBase
            ref={ref}
            onRequestClose={onRequestClose}
        >
            <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20}}>
                <TouchableOpacity
                    style={{width: '100%', backgroundColor: 'rgba(42, 244, 86, 0.8)', borderRadius: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, marginVertical: 10}}
                    onPress={continueGame}
                >
                    <ContinueIcon width={30} height={30} fill={'#fff'}/>
                    <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>Continue</Text>
                    <View style={{width: 30}}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{width: '100%', backgroundColor: '#113840', borderRadius: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, marginVertical: 10}}
                    onPress={restartGame}
                >
                    <RestartIcon width={30} height={30} fill={'#fff'}/>
                    <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>Restart</Text>
                    <View style={{width: 30}}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{width: '100%', backgroundColor: '#113840', borderRadius: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, marginVertical: 10}}
                    onPress={() => instructionModalRef?.current.show()}
                >
                    <QuestionMarkIcon width={30} height={30} fill={'#fff'}/>
                    <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>How to play</Text>
                    <View style={{width: 30}}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{width: '100%', backgroundColor: '#113840', borderRadius: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, marginVertical: 10}}
                    onPress={() => {}}
                >
                    <ExitIcon style={{ marginLeft: 8}} width={25} height={25} fill={'#fff'}/>
                    <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>Leave game</Text>
                    <View style={{width: 30}}/>
                </TouchableOpacity>
            </View>
        </ModalBase>
    )
}

export default PauseModal