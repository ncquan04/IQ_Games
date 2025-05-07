import { View, Text, TouchableOpacity, StatusBar } from 'react-native'
import React from 'react'
import ModalBase, { ModalBaseRef } from './ModalBase'

interface InstructionModalProps {
    ref: React.RefObject<ModalBaseRef>;
}

const InstructionModal = ({ref}: InstructionModalProps) => {
    return (
        <ModalBase
            ref={ref}
        >
            <View style={{width: '100%', height: '100%', paddingHorizontal: 20, paddingBottom: StatusBar.currentHeight, flexDirection: 'column', justifyContent: 'space-between'}}>
                <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold'}}>How to play</Text>
                <View>

                </View>
                <TouchableOpacity 
                    style={{width: '100%', backgroundColor: 'white', borderRadius: 50, justifyContent: 'center', alignItems: 'center', paddingVertical: 10}}
                    onPress={() => ref.current.hide()}
                >
                    <Text style={{fontSize: 16, color: '#1c535e', fontWeight: 'bold'}}>Got it</Text>
                </TouchableOpacity>
            </View>
        </ModalBase>
    )
}

export default InstructionModal