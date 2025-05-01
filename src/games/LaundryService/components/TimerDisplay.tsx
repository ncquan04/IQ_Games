import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence, 
  useSharedValue, 
  Easing 
} from 'react-native-reanimated';

interface TimerDisplayProps {
  timer: number;
  score: number;
  level: number;
  isPaused: boolean;
  onPausePress: () => void;
  onLevelPress?: () => void; // Added optional onLevelPress prop
  targetScore?: number; // Thêm điểm mục tiêu
}

// Sử dụng React.memo để tránh re-render không cần thiết
const TimerDisplay: React.FC<TimerDisplayProps> = React.memo(({ 
  timer, 
  score, 
  level,
  isPaused,
  onPausePress,
  onLevelPress,
  targetScore
}) => {
  // Warning animation for low time
  const warningOpacity = useSharedValue(1);

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start warning animation when timer is low
  React.useEffect(() => {
    if (timer <= 10) {
      warningOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      warningOpacity.value = withTiming(1);
    }
  }, [timer, warningOpacity]);

  const timerStyle = useAnimatedStyle(() => {
    return {
      opacity: warningOpacity.value,
    };
  });

  // Kiểm tra nếu đã đạt điểm mục tiêu
  const isTargetReached = targetScore !== undefined && score >= targetScore;

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        {onLevelPress ? (
          <TouchableOpacity onPress={onLevelPress}>
            <Text style={[styles.levelText, styles.clickable]}>Level: {level}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.levelText}>Level: {level}</Text>
        )}
        <Animated.View style={[styles.timerContainer, timerStyle]}>
          <Text style={[
            styles.timerText, 
            timer <= 10 ? styles.warningText : null
          ]}>
            {formatTime(timer)}
          </Text>
        </Animated.View>
        <View>
          <Text style={[
            styles.scoreText,
            isTargetReached ? styles.targetReachedText : undefined
          ]}>
            {score}
            {targetScore !== undefined && (
              <Text style={styles.targetScoreText}> / {targetScore}</Text>
            )}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.pauseButton}
        onPress={onPausePress}
      >
        <Text style={styles.pauseText}>{isPaused ? "▶" : "⏸"}</Text>
      </TouchableOpacity>
    </View>
  );
}, (prevProps, nextProps) => {
  // Tối ưu função memo chỉ re-render khi các props này thay đổi
  return (
    prevProps.timer === nextProps.timer &&
    prevProps.score === nextProps.score &&
    prevProps.level === nextProps.level &&
    prevProps.isPaused === nextProps.isPaused &&
    prevProps.targetScore === nextProps.targetScore
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clickable: {
    textDecorationLine: 'underline',
    color: '#2196F3',
  },
  timerContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningText: {
    color: 'red',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  targetScoreText: {
    fontSize: 14,
    color: '#666',
  },
  targetReachedText: {
    color: '#4CAF50',
  },
  pauseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginLeft: 10,
  },
  pauseText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TimerDisplay;