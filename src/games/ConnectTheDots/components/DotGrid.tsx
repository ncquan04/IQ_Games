import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Dot as DotType } from '../types';
import Dot from './Dot';

interface DotGridProps {
    dots: DotType[][];
    dotRefs: React.MutableRefObject<(View | null)[][]>;
    isDotInPath: (row: number, col: number) => boolean;
}

const DotGrid: React.FC<DotGridProps> = ({ dots, dotRefs, isDotInPath }) => {
    return (
        <>
            {dots.map((rowDots, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {rowDots.map((dot, colIndex) => {
                        // Tính toán kích thước điểm dựa trên kích thước lưới
                        const dotSize = Math.min(
                            36, // Kích thước tối đa của điểm
                            Math.floor(300 / Math.max(dots.length, dots[0]?.length || 1))
                        );
                        const dotMargin = Math.max(4, Math.min(8, dotSize / 5));
                        
                        return (
                            <Dot
                                key={colIndex}
                                type={dot.type}
                                size={dotSize}
                                margin={dotMargin}
                                isInPath={isDotInPath(rowIndex, colIndex)}
                                onRef={ref => {
                                    if (ref) {
                                        // Đảm bảo mảng được khởi tạo đúng cách
                                        if (!dotRefs.current[rowIndex]) {
                                            dotRefs.current[rowIndex] = [];
                                        }
                                        dotRefs.current[rowIndex][colIndex] = ref;
                                    }
                                }}
                            />
                        );
                    })}
                </View>
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
    },
});

export default DotGrid;