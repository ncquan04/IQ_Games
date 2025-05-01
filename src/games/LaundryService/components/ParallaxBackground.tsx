import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface ParallaxBackgroundProps {
  isPaused: boolean;
}

const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ isPaused }) => {
  const translateY1 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  const translateY3 = useSharedValue(0);

  // Create parallax effect with animated bubbles
  useEffect(() => {
    if (!isPaused) {
      translateY1.value = 0;
      translateY2.value = 0;
      translateY3.value = 0;
      
      translateY1.value = withRepeat(
        withTiming(-height, { duration: 25000, easing: Easing.linear }),
        -1,
        false
      );
      
      translateY2.value = withRepeat(
        withTiming(-height, { duration: 30000, easing: Easing.linear }),
        -1,
        false
      );
      
      translateY3.value = withRepeat(
        withTiming(-height, { duration: 20000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [isPaused]);

  const animatedBubble1 = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY1.value }],
    };
  });

  const animatedBubble2 = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY2.value }],
    };
  });

  const animatedBubble3 = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY3.value }],
    };
  });

  return (
    <>
      <Animated.View style={[styles.bubble, styles.bubble1, animatedBubble1]} />
      <Animated.View style={[styles.bubble, styles.bubble2, animatedBubble2]} />
      <Animated.View style={[styles.bubble, styles.bubble3, animatedBubble3]} />
    </>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.2,
  },
  bubble1: {
    width: 200,
    height: 200,
    backgroundColor: '#FF6B6B',
    left: -50,
    top: height,
  },
  bubble2: {
    width: 150,
    height: 150,
    backgroundColor: '#4CAF50',
    right: -30,
    top: height + 200,
  },
  bubble3: {
    width: 120,
    height: 120,
    backgroundColor: '#FFD166',
    left: width / 2 - 60,
    top: height + 100,
  },
});

export default ParallaxBackground;