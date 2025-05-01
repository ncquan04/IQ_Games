import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { TowerProps } from '../types';

/**
 * Component hiển thị một tháp trong trò chơi
 */
const Tower = ({ index, onPress, isDisabled, width, height }: TowerProps) => {
    return (
        <TouchableOpacity
            style={{
                width,
                height,
                alignItems: 'center',
                justifyContent: 'flex-end',
            }}
            onPress={() => onPress(index)}
            disabled={isDisabled}
        >
            {/* Phần trụ đứng của tháp */}
            <View
                style={{
                    width: 10,
                    height: 140,
                    backgroundColor: '#7F8C8D',
                    position: 'absolute',
                    bottom: 20,
                    zIndex: 1,
                }}
            />
            
            {/* Phần đế của tháp */}
            <View
                style={{
                    width: width,
                    height: 20,
                    backgroundColor: '#7F8C8D',
                    borderRadius: 4,
                }}
            />
        </TouchableOpacity>
    );
};

export default Tower;