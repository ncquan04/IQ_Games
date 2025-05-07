import { View, Text, TouchableOpacity } from 'react-native'
import React, { RefObject } from 'react'
import BackspaceIcon from '../icons/BackspaceIcon'

interface NumpadProps {
    currentInputRef: RefObject<string[]>;
    triggerRerender: () => void;
    checkResult: () => void;
    showNumberRef: RefObject<boolean>;
}

const Numpad = ({ currentInputRef, triggerRerender, checkResult, showNumberRef }: NumpadProps) => {
    const handleNumberPress = (number: number) => {
        const currentInput = currentInputRef.current;
        const emptyIndex = currentInput.findIndex(item => item === '');
        if (emptyIndex !== -1) {
            currentInput[emptyIndex] = number.toString();
            triggerRerender();
        }
    }

    const handleDeletePress = () => {
        if (currentInputRef.current.length === 0) return;

        const currentInput = currentInputRef.current;
        let lastFilledIndex = currentInput.length - 1;
        while (lastFilledIndex >= 0 && currentInput[lastFilledIndex] === '') {
            lastFilledIndex--;
        }
        
        if (lastFilledIndex >= 0) {
            currentInput[lastFilledIndex] = '';
            triggerRerender();
        }
    }

    const handleSubmitPress = () => {
        checkResult();
    }

    return (
        <View style={{width: '100%', backgroundColor: '#113840', paddingVertical: 20, paddingHorizontal: 10, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(1)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(2)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(3)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>3</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginTop: 10, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(4)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>4</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(5)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>5</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(6)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>6</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginTop: 10, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(7)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>7</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(8)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>8</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(9)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>9</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginTop: 10, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: 'rgba(35, 108, 122, 0.3)', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    onPress={() => handleDeletePress()}
                >
                    <BackspaceIcon width={30} height={30} fill={'#fff'}/>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: '#236c7a', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    disabled={showNumberRef.current}
                    onPress={() => handleNumberPress(0)}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width: '32%', paddingVertical: 8, backgroundColor: currentInputRef.current.some(item => item === '') ? 'rgba(35, 108, 122, 0.3)' : 'rgba(42, 244, 86, 0.8)', borderRadius: 10, justifyContent: 'center', alignItems: 'center'}} 
                    onPress={() => handleSubmitPress()}
                    disabled={currentInputRef.current.some(item => item === '')}
                >
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>submit</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Numpad