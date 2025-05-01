import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { GameControlsProps } from '../types';

/**
 * Component chứa các nút điều khiển trò chơi
 */
const GameControls = ({ onPrevLevel, onResetLevel, onNextLevel, isDisabled }: GameControlsProps) => {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '80%' }}>
            {/* Nút chuyển level trước */}
            <TouchableOpacity
                style={{
                    backgroundColor: '#3498DB',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                }}
                onPress={onPrevLevel}
                disabled={isDisabled}
            >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Previous</Text>
            </TouchableOpacity>

            {/* Nút Reset để bắt đầu lại trò chơi */}
            <TouchableOpacity
                style={{
                    backgroundColor: '#E74C3C',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                }}
                onPress={onResetLevel}
                disabled={isDisabled}
            >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Reset</Text>
            </TouchableOpacity>

            {/* Nút chuyển level tiếp theo */}
            <TouchableOpacity
                style={{
                    backgroundColor: '#3498DB',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                }}
                onPress={onNextLevel}
                disabled={isDisabled}
            >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Next</Text>
            </TouchableOpacity>
        </View>
    );
};

export default GameControls;