import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { GameStatus } from '../types';

interface GameControlsProps {
    status: GameStatus;
    onRestart: () => void;
    onNextLevel: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
    status, 
    onRestart, 
    onNextLevel 
}) => {
    return (
        <View style={styles.container}>
            {/* Nút chuyển level khi hoàn thành */}
            {status === 'success' && (
                <TouchableOpacity style={styles.button} onPress={onNextLevel}>
                    <Text style={styles.buttonText}>Next Level</Text>
                </TouchableOpacity>
            )}

            {/* Nút khởi động lại trò chơi */}
            <TouchableOpacity style={styles.button} onPress={onRestart}>
                <Text style={styles.buttonText}>Restart Game</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    button: {
        marginVertical: 8,
        backgroundColor: '#2563eb',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default GameControls;