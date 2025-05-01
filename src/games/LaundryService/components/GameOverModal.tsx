import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  runOnJS, 
  withDelay 
} from 'react-native-reanimated';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  onRestart: () => void;
  onClose: () => void;
  targetScore?: number; // Điểm mục tiêu cần đạt được
  level?: number; // Level hiện tại
  nextLevel?: () => void; // Hàm để chuyển đến level tiếp theo
}

const { width, height } = Dimensions.get('window');

const GameOverModal: React.FC<GameOverModalProps> = ({ 
  visible, 
  score, 
  onRestart, 
  onClose,
  targetScore,
  level = 1,
  nextLevel
}) => {
  const modalScale = useSharedValue(0.5);
  const isPassed = targetScore !== undefined && score >= targetScore;

  // Đảm bảo animation hoạt động đúng khi modal được hiển thị hoặc ẩn
  React.useEffect(() => {
    if (visible) {
      // Sử dụng timeout để đảm bảo Modal hiển thị trước khi animation chạy
      const timeout = setTimeout(() => {
        modalScale.value = withSpring(1, {
          damping: 12,
          stiffness: 100,
          mass: 0.8,
          overshootClamping: false
        });
      }, 50);
      
      return () => clearTimeout(timeout);
    } else {
      // Đặt scale về giá trị ban đầu khi ẩn modal
      modalScale.value = 0.5;
    }
  }, [visible, modalScale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: modalScale.value }],
      opacity: modalScale.value, // Thêm opacity để tránh hiện ảo
    };
  });

  // Chỉ render khi modal đang visible để tránh các vấn đề về hiệu suất
  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalBackground}>
        <Animated.View style={[styles.modalContainer, animatedStyle]}>
          <Text style={styles.gameOverText}>
            {isPassed ? 'Màn chơi hoàn thành!' : 'Hết thời gian!'}
          </Text>

          <Text style={styles.levelText}>Level {level}</Text>
          
          <Text style={styles.scoreText}>Điểm của bạn</Text>
          <Text style={[styles.scoreValue, isPassed ? styles.passedScore : undefined]}>
            {score}
          </Text>
          
          {targetScore !== undefined && (
            <Text style={styles.targetScoreText}>
              Điểm mục tiêu: {targetScore}
            </Text>
          )}

          {isPassed && nextLevel && (
            <TouchableOpacity
              style={[styles.button, styles.nextLevelButton]}
              onPress={nextLevel}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Màn tiếp theo</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.button, styles.restartButton]}
            onPress={onRestart}
          >
            <Text style={styles.buttonText}>Chơi lại</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.closeButton]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, styles.closeButtonText]}>Đóng</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gameOverText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  passedScore: {
    color: '#4CAF50',
  },
  targetScoreText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
  },
  nextLevelButton: {
    backgroundColor: '#2196F3',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButtonText: {
    color: '#333',
  },
});

export default GameOverModal;