import React from 'react';
import { View, StyleSheet } from 'react-native';

interface DotProps {
    type: 'blue' | 'red';
    size: number;
    margin: number;
    isInPath: boolean;
    onRef: (ref: View | null) => void;
}

const Dot: React.FC<DotProps> = ({ type, size, margin, isInPath, onRef }) => {
    // Xác định màu sắc của điểm dựa vào loại và trạng thái
    const backgroundColor = type === 'red'
        ? '#ef4444'  // Màu đỏ cho điểm chướng ngại
        : isInPath
            ? '#22c55e'  // Màu xanh lá cho điểm đã nối
            : '#3b82f6'; // Màu xanh dương cho điểm cần nối
    
    const borderColor = type === 'red'
        ? '#b91c1c'  // Viền đậm hơn cho điểm đỏ
        : isInPath
            ? '#15803d'  // Viền đậm hơn cho điểm đã nối
            : '#1d4ed8';  // Viền đậm hơn cho điểm cần nối

    return (
        <View
            ref={onRef}
            style={[
                styles.dot,
                {
                    width: size,
                    height: size,
                    margin: margin,
                    borderRadius: size / 2,
                    backgroundColor,
                    borderColor
                }
            ]}
        />
    );
};

const styles = StyleSheet.create({
    dot: {
        borderWidth: 2,
    },
});

export default Dot;