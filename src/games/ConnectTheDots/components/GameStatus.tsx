import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { GameStatus as GameStatusType } from '../types';

interface GameStatusProps {
    status: GameStatusType;
}

const GameStatus: React.FC<GameStatusProps> = ({ status }) => {
    if (status === 'playing') return null;

    return (
        <Text 
            style={status === 'success' ? styles.success : styles.failure}
        >
            {status === 'success' ? 'Success! 🎉' : 'Try again ❌'}
        </Text>
    );
};

const styles = StyleSheet.create({
    success: {
        color: '#16a34a',
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 16,
    },
    failure: {
        color: '#dc2626',
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 16,
    },
});

export default GameStatus;