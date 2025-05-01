import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, PanResponder } from 'react-native';

// Import các component và hooks mới
import DotGrid from './components/DotGrid';
import ConnectionLines from './components/ConnectionLines';
import GameStatus from './components/GameStatus';
import GameControls from './components/GameControls';
import useGameLogic from './hooks/useGameLogic';

const ConnectTheDots: React.FC = () => {
    // Sử dụng hook để quản lý logic game
    const {
        path,
        status,
        level,
        dots,
        dotRefs,
        containerRef,
        containerLayoutRef,
        dotsWithLayoutRef,
        handleTouchEvents,
        retryGame,
        nextLevel,
        isDotInPath,
        measureAllDots,
        totalLevels
    } = useGameLogic();
    
    // Tạo PanResponder để xử lý các cử chỉ chạm
    const panResponder = useMemo(() => {
        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderStart: handleTouchEvents,
            onPanResponderMove: handleTouchEvents,
            onPanResponderRelease: handleTouchEvents,
        });
    }, [handleTouchEvents]);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Connect the Dots</Text>
            <Text style={{fontSize: 16, marginBottom: 10, color: 'black'}}>
                Level {level + 1} / {totalLevels}
            </Text>

            {/* Container chính chứa lưới điểm */}
            <View
                ref={containerRef}
                style={styles.gridContainer}
                {...panResponder.panHandlers}
                onLayout={measureAllDots}
            >
                {/* Component để vẽ đường nối giữa các điểm */}
                <ConnectionLines 
                    path={path} 
                    dotsWithLayout={dotsWithLayoutRef.current} 
                    containerLayout={containerLayoutRef.current} 
                />

                {/* Component hiển thị lưới điểm */}
                <DotGrid 
                    dots={dots} 
                    dotRefs={dotRefs} 
                    isDotInPath={isDotInPath} 
                />
            </View>

            {/* Component hiển thị trạng thái game */}
            <GameStatus status={status} />

            {/* Component hiển thị các nút điều khiển */}
            <GameControls 
                status={status}
                onRestart={retryGame}
                onNextLevel={nextLevel}
            />
        </SafeAreaView>
    );
};

// Định nghĩa kiểu dáng cho các thành phần
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    gridContainer: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 24
    }
});

export default ConnectTheDots;
