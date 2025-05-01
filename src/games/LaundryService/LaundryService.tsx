import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ClothingItem from './components/ClothingItem';
import BasketButton from './components/BasketButton';
import TimerDisplay from './components/TimerDisplay';
import GameOverModal from './components/GameOverModal';
import ParallaxBackground from './components/ParallaxBackground';
import useGameLogic from './hooks/useGameLogic';
import { ClothingColor, GameConfig } from './types';
import Animated, {
  useSharedValue,
  withSequence,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';

// Import game configuration
import gameConfig from './config/gameConfig.json';

const { width, height } = Dimensions.get('window');

// Properly typed game configuration
const typedGameConfig = gameConfig as unknown as GameConfig;

// Positions for stacked items
export type ItemPosition = 'very-top' | 'top' | 'middle' | 'bottom' | 'pending';

// Animation timing constants
const ANIMATION_TIMING = {
  SHAKE_SCREEN: 10, // Duration for each step in screen shake animation
  BASKET_SWAP: 150,  // Duration for basket swap animation (updated from 600ms to 150ms)
};

// Define the interface for TimerDisplayWrapper props
interface TimerDisplayWrapperProps {
  initialTime: number;
  isPaused: boolean;
  getCurrentTimer: () => number;
  score: number;
  level: number;
  onPausePress: () => void;
  targetScore: number;
}

// Tạo một wrapper component để tách biệt timer và tránh re-render không cần thiết
const TimerDisplayWrapper = React.memo<TimerDisplayWrapperProps>(({ 
  initialTime,
  isPaused,
  getCurrentTimer,
  score, 
  level, 
  onPausePress, 
  targetScore 
}) => {
  // Tạo state local để hiển thị timer
  const [displayTime, setDisplayTime] = useState(initialTime);
  
  // Setup interval để cập nhật thời gian hiển thị
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      const currentTime = getCurrentTimer();
      setDisplayTime(currentTime);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPaused, getCurrentTimer]);
  
  return (
    <TimerDisplay
      timer={displayTime}
      score={score}
      level={level}
      isPaused={isPaused}
      onPausePress={onPausePress}
      targetScore={targetScore}
    />
  );
}, (prevProps, nextProps) => {
  // Tối ưu memo bằng cách chỉ re-render khi các props quan trọng thay đổi
  return (
    prevProps.isPaused === nextProps.isPaused &&
    prevProps.score === nextProps.score && 
    prevProps.level === nextProps.level &&
    prevProps.targetScore === nextProps.targetScore
  );
});

const LaundryService = () => {
  console.log('LaundryService component rendered');

  // Use game logic hook
  const { 
    state, 
    startGame, 
    togglePause, 
    handleItemSelection, 
    completeAnimation, 
    setCurrentLevelConfig,
    maxUnlockedLevel,  // Get the max unlocked level
    getCurrentTimer, // Sử dụng hàm mới để lấy thời gian chính xác
    setLevel  // We'll use this to go to the next level
  } = useGameLogic();

  // Keep modal visibility as state since it directly affects rendering
  const [gameOverVisible, setGameOverVisible] = useState(false);
  
  // Convert animation trigger to ref - doesn't need to cause re-renders
  const animationTriggerRef = useRef(0);
  const lastCorrectBasketIdRef = useRef<string | null>(null);
  const resetPositionTriggerRef = useRef(0);
  
  // Optimized basket swap using ref instead of state
  const basketSwapRef = useRef({
    basket1Id: null as string | null,
    basket2Id: null as string | null,
    swapTrigger: 0,
    inProgress: false,
    completedSwaps: 0,
    lastSwapTime: 0
  });
    
  // Animation values
  const shakeX = useSharedValue(0);
  
  // References for basket positions
  const basketRefs = useRef<Record<string, { x: number, y: number }>>({});
  
  // Start game on component mount
  useEffect(() => {
    startGame();
  }, [startGame]);
  
  // Combined effect for game state management - tối ưu bằng cách giảm dependency
  useEffect(() => {
    // Reset swap state when starting a new level
    if (state.timer === state.currentLevelConfig?.timeLimit) {
      basketSwapRef.current = {
        basket1Id: null,
        basket2Id: null,
        swapTrigger: 0,
        inProgress: false,
        completedSwaps: 0,
        lastSwapTime: 0
      };
      
      // Reset all basket positions when a new level starts
      resetPositionTriggerRef.current += 1;
    }
  }, [state.level, state.timer, state.currentLevelConfig]);
  
  // Tách effect cho game over để giảm re-render
  useEffect(() => {
    // Show game over modal when game ends
    if (!state.isGameActive && state.timer === 0) {
      setGameOverVisible(true);
      
      // Reset all basket positions when game ends (level completed or failed)
      resetPositionTriggerRef.current += 1;
    }
  }, [state.isGameActive, state.timer]);
  
  // Monitor time to trigger basket swaps - tối ưu để sử dụng getCurrentTimer
  useEffect(() => {
    // Skip if conditions aren't met
    if (state.isPaused || !state.isGameActive) return;
    
    const swapTimes = state.currentLevelConfig?.swapTimes;
    if (!swapTimes || swapTimes.length === 0 || basketSwapRef.current.completedSwaps >= swapTimes.length) return;
    
    // Log for debugging
    console.log(`Monitoring for swap ${basketSwapRef.current.completedSwaps + 1}/${swapTimes.length}, timer=${getCurrentTimer()}`);
    
    const checkSwapInterval = setInterval(() => {
      // Chỉ kiểm tra khi không đang thực hiện swap
      if (basketSwapRef.current.inProgress) return;
      
      const currentTime = getCurrentTimer();
      
      // Get current swap time config
      const currentSwapConfig = swapTimes[basketSwapRef.current.completedSwaps];
      
      // Check if time is in swap window
      if (currentTime >= currentSwapConfig.min && 
          currentTime <= currentSwapConfig.max &&
          currentTime !== basketSwapRef.current.lastSwapTime) {
        
        console.log(`Triggering swap ${basketSwapRef.current.completedSwaps + 1} at time ${currentTime}`);
        triggerRandomBasketSwap();
        
        // Update swap state
        const newCompletedSwaps = basketSwapRef.current.completedSwaps + 1;
        basketSwapRef.current = {
          ...basketSwapRef.current,
          completedSwaps: newCompletedSwaps,
          lastSwapTime: currentTime
        };
        
        console.log(`Updated completedSwaps=${basketSwapRef.current.completedSwaps}`);
      }
    }, 1000); // Kiểm tra thường xuyên hơn (500ms thay vì 1000ms)
    
    return () => clearInterval(checkSwapInterval);
  }, [state.isPaused, state.isGameActive, state.currentLevelConfig, getCurrentTimer]);
  
  // Function to swap two random baskets
  const triggerRandomBasketSwap = useCallback(() => {
    // Only proceed if we have enough baskets
    if (!state.currentLevelConfig?.baskets || state.currentLevelConfig.baskets.length < 2) return;

    // Tạo mảng chứa các basket được nhóm theo groupId
    const basketsByGroup: Record<string, any[]> = {};
    
    // Phân loại basket theo group
    state.currentLevelConfig.baskets.forEach(basket => {
      if (!basket.groupId) return;
      
      if (!basketsByGroup[basket.groupId]) {
        basketsByGroup[basket.groupId] = [];
      }
      basketsByGroup[basket.groupId].push(basket);
    });
    
    // Lấy danh sách các group id
    const groupIds = Object.keys(basketsByGroup);
    
    // Cần ít nhất 2 nhóm để swap giữa các nhóm khác nhau
    if (groupIds.length < 2) return;
    
    // Chọn ngẫu nhiên 2 nhóm khác nhau
    const shuffledGroups = [...groupIds].sort(() => 0.5 - Math.random());
    const group1Id = shuffledGroups[0];
    const group2Id = shuffledGroups[1];
    
    // Chọn ngẫu nhiên một basket từ mỗi nhóm
    const basket1 = basketsByGroup[group1Id][Math.floor(Math.random() * basketsByGroup[group1Id].length)];
    const basket2 = basketsByGroup[group2Id][Math.floor(Math.random() * basketsByGroup[group2Id].length)];
    
    if (!basket1 || !basket2) return;
    
    // Update config only if baskets are from different groups - which they are now guaranteed to be
    const updatedConfig = JSON.parse(JSON.stringify(state.currentLevelConfig));
    
    const updatedBasket1 = updatedConfig.baskets.find((b: any) => b.id === basket1.id);
    const updatedBasket2 = updatedConfig.baskets.find((b: any) => b.id === basket2.id);
    
    if (updatedBasket1 && updatedBasket2) {
      // THAY ĐỔI: Chỉ swap groupId, giữ nguyên màu sắc bên ngoài của basket
      // Lưu ID ban đầu để cập nhật đúng visual
      const originalBasket1Id = updatedBasket1.id;
      const originalBasket2Id = updatedBasket2.id;
      const originalBasket1Position = updatedBasket1.position;
      const originalBasket2Position = updatedBasket2.position;
      
      // Swap group IDs
      const tempGroupId = updatedBasket1.groupId;
      updatedBasket1.groupId = updatedBasket2.groupId;
      updatedBasket2.groupId = tempGroupId;
      
      // Update colors for each group
      if (updatedBasket1.groupId && updatedBasket2.groupId) {
        const updateGroupColors = (groupId: string) => {
          const group = updatedConfig.basketGroups.find((g: any) => g.id === groupId);
          if (group) {
            const basketsInGroup = updatedConfig.baskets.filter((b: any) => b.groupId === groupId);
            group.acceptedColors = basketsInGroup.map((b: any) => b.color);
          }
        };
        
        updateGroupColors(updatedBasket1.groupId);
        updateGroupColors(updatedBasket2.groupId);
      }
      
      setCurrentLevelConfig(updatedConfig);
    }
    
    // Trigger visual swap animation by updating ref
    basketSwapRef.current = {
      ...basketSwapRef.current,
      basket1Id: basket1.id,
      basket2Id: basket2.id,
      swapTrigger: Date.now(),
      inProgress: true
    };
    
    // Reset swap animation state after completion
    setTimeout(() => {
      basketSwapRef.current = { 
        ...basketSwapRef.current,
        inProgress: false 
      };
    }, ANIMATION_TIMING.BASKET_SWAP + 100);
  }, [state.currentLevelConfig, setCurrentLevelConfig]);

  // Animation completed callback
  const onAnimationComplete = useCallback(() => {
    if (state.animatingItemId) {
      completeAnimation(state.animatingItemId);
      lastCorrectBasketIdRef.current = null;
    }
  }, [state.animatingItemId, completeAnimation]);

  // Handle basket position updates
  const handleBasketPosition = useCallback((basketId: string, position: { x: number, y: number }) => {
    basketRefs.current[basketId] = position;
  }, []);

  // Handle basket selection with simplified logic
  const onBasketPress = useCallback((color: ClothingColor, basketId: string) => {
    // Skip if no items, animation in progress, or basket swap in progress
    if (state.items.length === 0 || state.animatingItemId || basketSwapRef.current.inProgress) return;
    
    // Always target the bottom item
    const targetItem = state.items[0];
    const isCorrect = handleItemSelection(color, targetItem.id, basketId);
    
    if (isCorrect) {
      lastCorrectBasketIdRef.current = basketId;
      animationTriggerRef.current += 1;
    } else {
      // Play shake animation for incorrect selection
      shakeX.value = withSequence(
        withTiming(-10, { duration: ANIMATION_TIMING.SHAKE_SCREEN }),
        withTiming(10, { duration: ANIMATION_TIMING.SHAKE_SCREEN }),
        withTiming(-8, { duration: ANIMATION_TIMING.SHAKE_SCREEN }),
        withTiming(8, { duration: ANIMATION_TIMING.SHAKE_SCREEN }),
        withTiming(0, { duration: ANIMATION_TIMING.SHAKE_SCREEN })
      );
    }
  }, [handleItemSelection, shakeX, state.items, state.animatingItemId]);
  
  // Get target score - lấy từ level hiện tại
  const getTargetScore = useCallback(() => (
    state.currentLevelConfig?.targetScore || 100
  ), [state.currentLevelConfig]);
  
  // Restart game handler
  const handleRestart = useCallback(() => {
    setGameOverVisible(false);
    // Instead of startGame(), use setLevel with the current level to restart at the same level
    setLevel(state.level);
    
    // Reset basket positions when restarting current level
    resetPositionTriggerRef.current += 1;
  }, [setLevel, state.level]);
  
  // Move to the next level if available
  const handleNextLevel = useCallback(() => {
    const nextLevel = state.level + 1;
    // Only allow progression if the next level is unlocked
    if (nextLevel <= maxUnlockedLevel) {
      setGameOverVisible(false);
      setLevel(nextLevel);
      
      // Reset basket positions when moving to next level
      resetPositionTriggerRef.current += 1;
    }
  }, [state.level, maxUnlockedLevel, setLevel, setGameOverVisible]);
  
  // Get target basket position for animation with improved readability
  const getTargetBasketPosition = useCallback((itemColor: ClothingColor) => {
    // Case 1: Use last selected basket if available
    if (lastCorrectBasketIdRef.current && basketRefs.current[lastCorrectBasketIdRef.current]) {
      return basketRefs.current[lastCorrectBasketIdRef.current];
    }
    
    // Case 2: Find matching baskets by group color
    const matchingBasketIds: string[] = [];
    
    state.currentLevelConfig?.basketGroups.forEach(group => {
      if (group.acceptedColors.includes(itemColor)) {
        const groupBaskets = state.currentLevelConfig?.baskets
          .filter(b => b.groupId === group.id)
          .map(b => b.id);
        
        matchingBasketIds.push(...groupBaskets);
      }
    });
    
    if (matchingBasketIds.length > 0) {
      const randomId = matchingBasketIds[Math.floor(Math.random() * matchingBasketIds.length)];
      if (basketRefs.current[randomId]) return basketRefs.current[randomId];
    }
    
    // Case 3: Find a basket with matching color
    const matchingBasket = state.currentLevelConfig?.baskets.find(b => b.color === itemColor);
    if (matchingBasket && basketRefs.current[matchingBasket.id]) {
      return basketRefs.current[matchingBasket.id];
    }
    
    // Fallback position
    return { x: width / 2, y: height - 100 };
  }, [state.currentLevelConfig]);
  
  // Render baskets
  const renderBaskets = useMemo(() => {
    if (!state.currentLevelConfig) return null;
    
    // Determine basket sizes based on count per side
    const getBasketSize = (basketConfig: any) => {
      if (!basketConfig.groupId) return 'medium';
      
      // Count baskets in the same group
      const groupBasketCount = state.currentLevelConfig.baskets.filter(
        b => b.groupId === basketConfig.groupId
      ).length;
      
      if (groupBasketCount >= 3) return 'small';
      if (groupBasketCount === 2) return 'medium';
      
      return 'medium';
    };
    
    const { basket1Id, basket2Id, swapTrigger } = basketSwapRef.current;
    
    return state.currentLevelConfig.baskets.map((basket) => (
      <BasketButton
        key={basket.id}
        position={basket.position}
        color={basket.color}
        onPress={(color) => onBasketPress(color, basket.id)}
        getPosition={() => basketRefs.current[basket.id] || { x: 0, y: 0 }}
        onPositionUpdate={(position) => handleBasketPosition(basket.id, position)}
        offsetX={basket.offsetX}
        offsetY={basket.offsetY}
        basketId={basket.id}
        groupId={basket.groupId}
        allBasketPositions={basketRefs.current}
        swapWithId={basket.id === basket1Id ? basket2Id : 
                   basket.id === basket2Id ? basket1Id : null}
        swapTrigger={swapTrigger}
        size={getBasketSize(basket)}
        resetPositionTrigger={resetPositionTriggerRef.current}
      />
    ));
  }, [
    state.currentLevelConfig, 
    onBasketPress, 
    handleBasketPosition 
  ]);
  
  // Render items with optimized position calculation
  const renderItems = useMemo(() => {
    return state.items.map((item, index) => {
      // Determine position based on index
      let position: ItemPosition = item.isPending ? 'pending' : 'bottom';
      
      if (!item.isPending) {
        const visibleIndex = state.items.slice(0, index).filter(i => !i.isPending).length;
        position = ['bottom', 'middle', 'top', 'very-top'][Math.min(visibleIndex, 3)] as ItemPosition;
      }
      
      // Determine target position for animating items
      const isAnimating = item.animating || item.id === state.animatingItemId;
      const targetPosition = isAnimating ? getTargetBasketPosition(item.color) : null;
      
      return (
        <ClothingItem
          key={item.id}
          item={item}
          position={position}
          isCorrect={isAnimating ? true : null}
          targetBasketPosition={targetPosition}
          onAnimationComplete={onAnimationComplete}
          animationTrigger={animationTriggerRef.current}
          allItems={state.items}
          itemIndex={index}
        />
      );
    });
  }, [
    state.items, 
    state.animatingItemId, 
    getTargetBasketPosition, 
    onAnimationComplete
  ]);

  // Screen shake animation style
  const screenAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }]
  }));
  
  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Animated.View style={[styles.gameContainer, screenAnimStyle]}>
            {/* Background */}
            <ParallaxBackground isPaused={state.isPaused} />

            {/* Top status bar - Sử dụng component được tối ưu hóa */}
            {state.isGameActive && (
              <TimerDisplayWrapper
                initialTime={state.timer}
                isPaused={state.isPaused}
                getCurrentTimer={getCurrentTimer}
                score={state.score}
                level={state.level}
                onPausePress={togglePause}
                targetScore={getTargetScore()}
              />
            )}

            {/* Clothing items */}
            <View style={styles.clothingContainer}>
              <View style={styles.itemsStack}>
                {renderItems}
              </View>
            </View>

            {/* Baskets */}
            {renderBaskets}
          </Animated.View>
        </SafeAreaView>
      </GestureHandlerRootView>
      
      <View>
      {/* Game over modal */}
      {gameOverVisible && <GameOverModal
        visible={gameOverVisible}
        score={state.score}
        onRestart={handleRestart}
        onClose={() => setGameOverVisible(false)}
        targetScore={getTargetScore()}
        level={state.level}
        nextLevel={handleNextLevel}
      />}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  gameContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clothingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  itemsStack: {
    position: 'relative',
    width: 140,
    height: 450,
    alignSelf: 'center',
    borderColor: 'transparent', 
    justifyContent: 'center',
    marginTop: -50, // Move stack higher on screen
  }
});

export default LaundryService;