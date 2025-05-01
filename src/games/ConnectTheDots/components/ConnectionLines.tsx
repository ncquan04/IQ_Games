import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Dot, DotLayout } from '../types';

interface ConnectionLinesProps {
    path: Dot[];
    dotsWithLayout: DotLayout[];
    containerLayout: { x: number, y: number, width: number, height: number } | null;
}

const ConnectionLines: React.FC<ConnectionLinesProps> = ({ 
    path, 
    dotsWithLayout, 
    containerLayout 
}) => {
    return (
        <Svg
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
        >
            {path.length > 1 &&
                path.map((dot, index) => {
                    if (index === 0) return null;

                    // Tìm thông tin vị trí của điểm trước và điểm hiện tại
                    const prev = dotsWithLayout.find(d =>
                        d.row === path[index - 1].row && d.col === path[index - 1].col
                    );
                    const curr = dotsWithLayout.find(d =>
                        d.row === dot.row && d.col === dot.col
                    );

                    if (!prev || !curr) return null;

                    // Tính toán tọa độ để vẽ đường thẳng
                    const x1 = prev.layout.x - (containerLayout?.x ?? 0) + prev.layout.width / 2;
                    const y1 = prev.layout.y - (containerLayout?.y ?? 0) + prev.layout.height / 2;
                    const x2 = curr.layout.x - (containerLayout?.x ?? 0) + curr.layout.width / 2;
                    const y2 = curr.layout.y - (containerLayout?.y ?? 0) + curr.layout.height / 2;

                    return (
                        <Line
                            key={index}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#22c55e"
                            strokeWidth={4}
                            strokeLinecap="round"
                        />
                    );
                })}
        </Svg>
    );
};

export default ConnectionLines;