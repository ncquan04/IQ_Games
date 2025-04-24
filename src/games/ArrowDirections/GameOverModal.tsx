import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, BackHandler, Platform } from 'react-native';

// Lấy kích thước màn hình
const { width, height } = Dimensions.get('screen');

interface GameOverModalProps {
  visible: boolean;
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ 
  visible, 
  score, 
  highScore, 
  onRestart 
}) => {
  // Xử lý nút back trên Android khi modal hiện
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onRestart();
        return true;
      }
      return false;
    });
    
    return () => backHandler.remove();
  }, [visible, onRestart]);

  if (!visible) return null;

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Time's Up!</Text>
        <Text style={styles.modalScore}>Score: {score}</Text>
        {score === highScore && score > 0 && (
          <Text style={styles.newHighScore}>New High Score!</Text>
        )}
        <TouchableOpacity
          style={styles.restartButton}
          activeOpacity={0.8}
          onPress={onRestart}
        >
          <Text style={styles.restartButtonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1E1E2A',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#3A3A4A',
    width: Math.min(300, width * 0.8),
    maxWidth: width * 0.9,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  modalScore: {
    fontSize: 24,
    color: 'white',
    marginBottom: 12,
  },
  newHighScore: {
    fontSize: 20,
    color: '#FFC107',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    marginTop: 15,
    minWidth: 150,
    alignItems: 'center',
  },
  restartButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default GameOverModal;