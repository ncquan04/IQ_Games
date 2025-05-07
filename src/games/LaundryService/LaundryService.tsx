import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ClothingItem from './components/ClothingItem';
import BasketButton from './components/BasketButton';
import TimerDisplay from './components/TimerDisplay';
import GameOverModal from './components/GameOverModal';
import ParallaxBackground from './components/ParallaxBackground';
import { ClothingColor, GameConfig, LevelConfig } from './types';
import Animated, {
  useSharedValue,
  withSequence,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import game configuration
import gameConfig from './config/gameConfig.json';
import { getDefaultLevelConfig } from './config/levelConfigs';

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

// All available clothing icons
const iconTypes = [
  'BabyKit', 'Dress', 'Hat', 'Jacket', 'LongDress', 
  'Shirt', 'ShortDress', 'Short', 'Socks', 'Suit', 'TankTop'
];

// Type definitions for clothing items
export interface ClothingItem {
  id: string;
  icon: string;
  color: ClothingColor;
  animating?: boolean;
  isPending?: boolean;
}

// Game state interface
interface GameState {
  items: ClothingItem[];
  score: number;
  timer: number;
  level: number;
  isGameActive: boolean;
  isPaused: boolean;
  animatingItemId: string | null;
  currentLevelConfig: LevelConfig;
  levelComplete?: boolean;
}

// Utility function to create a unique ID
const generateUniqueId = (): string => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Storage key for saving the player's level
const STORAGE_KEY_LEVEL = '@laundry_service_max_level';

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

  // Initial level config
  const initialLevel = 1;
  const initialLevelConfig = getDefaultLevelConfig(initialLevel);

  // Track the max level the player has unlocked
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(initialLevel);
  
  // Game state
  const [state, setState] = useState<GameState>({
    items: [],
    score: 0,
    timer: initialLevelConfig.timeLimit || 45,
    level: initialLevel,
    isGameActive: false,
    isPaused: false,
    animatingItemId: null,
    currentLevelConfig: initialLevelConfig,
  });

  // Timer reference to avoid unnecessary re-renders
  const timerRef = useRef(initialLevelConfig.timeLimit || 45);
  
  // Level config reference
  const levelConfigRef = useRef<LevelConfig>(initialLevelConfig);
  
  // Keep modal visibility as state since it directly affects rendering
  const [gameOverVisible, setGameOverVisible] = useState(false);
  
  // Animation refs
  const animationTriggerRef = useRef(0);
  const lastCorrectBasketIdRef = useRef<string | null>(null);
  const resetPositionTriggerRef = useRef(0);
  
  // Pending items buffer
  const [pendingItems, setPendingItems] = useState<ClothingItem[]>([]);
  
  // Basket swap optimization using ref
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

  // Sync refs when state changes
  useEffect(() => {
    levelConfigRef.current = state.currentLevelConfig;
    timerRef.current = state.timer;
  }, [state.currentLevelConfig, state.timer]);

  // Load saved level from AsyncStorage on initial mount
  useEffect(() => {
    const loadSavedLevel = async () => {
      try {
        const savedLevel = await AsyncStorage.getItem(STORAGE_KEY_LEVEL);
        const parsedLevel = savedLevel ? parseInt(savedLevel) : initialLevel;
        
        if (parsedLevel > initialLevel) {
          setMaxUnlockedLevel(parsedLevel);
          console.log(`Loaded saved player level: ${parsedLevel}`);
        }
      } catch (error) {
        console.error('Error loading saved level:', error);
      }
    };
    
    loadSavedLevel();
  }, []);

  // Generate a random item
  const generateRandomItem = useCallback((isPending = false): ClothingItem => {
    const availableColors = levelConfigRef.current.availableColors;
    const randomIcon = iconTypes[Math.floor(Math.random() * iconTypes.length)];
    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    
    return {
      id: generateUniqueId(),
      icon: randomIcon,
      color: randomColor,
      isPending,
    };
  }, []);

  // Fill the pending items buffer
  const generatePendingItemsBuffer = useCallback(() => {
    const buffer = Array(10).fill(null).map(() => generateRandomItem(true));
    setPendingItems(buffer);
  }, [generateRandomItem]);

  // Check if color is accepted in basket group
  const isColorAcceptedInGroup = useCallback((color: ClothingColor, basketId: string): boolean => {
    // Find the basket
    const basket = levelConfigRef.current.baskets.find(b => b.id === basketId);
    
    // Direct color match if no group
    if (!basket || !basket.groupId) {
      return basket?.color === color;
    }
    
    // Check group color acceptance
    const group = levelConfigRef.current.basketGroups.find(g => g.id === basket.groupId);
    if (!group) return basket.color === color;
    
    return group.acceptedColors.includes(color);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    const levelConfig = getDefaultLevelConfig(8);
    levelConfigRef.current = levelConfig;
    
    // Generate initial items
    const visibleCount = levelConfig.visibleItems;
    const initialItems = Array(visibleCount + 1)
      .fill(null)
      .map((_, index) => generateRandomItem(index === visibleCount));
    
    // Create buffer of pending items
    generatePendingItemsBuffer();
    
    // Initialize game state
    setState({
      items: initialItems,
      score: 0,
      timer: levelConfig.timeLimit || 45,
      level: initialLevel,
      isGameActive: true,
      isPaused: false,
      animatingItemId: null,
      currentLevelConfig: levelConfig,
    });
  }, [generateRandomItem, generatePendingItemsBuffer]);

  // Set a specific level
  const setLevel = useCallback((level: number) => {
    const levelConfig = getDefaultLevelConfig(level);
    levelConfigRef.current = levelConfig;
    
    // Generate initial items
    const visibleCount = levelConfig.visibleItems;
    const initialItems = Array(visibleCount + 1)
      .fill(null)
      .map((_, index) => generateRandomItem(index === visibleCount));
    
    // Reset buffer
    generatePendingItemsBuffer();
    
    setState({
      items: initialItems,
      score: 0,
      timer: levelConfig.timeLimit || 45,
      level,
      isGameActive: true,
      isPaused: false,
      animatingItemId: null,
      currentLevelConfig: levelConfig,
      levelComplete: false
    });
  }, [generateRandomItem, generatePendingItemsBuffer]);

  // Toggle pause state
  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Get current timer value
  const getCurrentTimer = useCallback(() => timerRef.current, []);

  // Handle item selection logic
  const handleItemSelection = useCallback((selectedBasketColor: ClothingColor, itemId?: string, basketId?: string) => {
    // Skip if game is not active or animation is in progress
    if (!state.isGameActive || state.isPaused || 
        state.items.length === 0 || state.animatingItemId) {
      return false;
    }
    
    // Find target item
    const targetItemId = itemId || state.items[0].id;
    const targetItem = state.items.find(item => item.id === targetItemId);
    if (!targetItem) return false;
    
    // Check if selection is correct
    const isCorrect = basketId 
      ? isColorAcceptedInGroup(targetItem.color, basketId)
      : selectedBasketColor === targetItem.color;
    
    if (isCorrect) {
      // Correct selection - mark item for animation
      setState(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === targetItemId ? { ...item, animating: true } : item
        ),
        animatingItemId: targetItemId,
      }));
    } else {
      // Incorrect selection - apply penalty
      const pointsPenalty = levelConfigRef.current.pointsLostPerError || -10;
      setState(prev => ({
        ...prev,
        score: Math.max(0, prev.score + pointsPenalty),
      }));
    }
    
    return isCorrect;
  }, [state, isColorAcceptedInGroup]);

  // Complete animation and update game state
  const completeAnimation = useCallback((itemId: string) => {
    setState(prev => {
      // Find item index
      const itemIndex = prev.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return prev;
      
      // Create new items array without the completed item
      const newItems = [...prev.items];
      newItems.splice(itemIndex, 1);
      
      // Update next pending item if available
      if (newItems.length > 0) {
        const lastIndex = newItems.length - 1;
        newItems[lastIndex] = { ...newItems[lastIndex], isPending: false };
      }
      
      // Calculate points
      const pointsEarned = prev.currentLevelConfig.pointsPerItem || 10;
      
      // Add new pending item from buffer
      const updatedItems = [...newItems];
      
      if (pendingItems.length > 0) {
        // Use an item from the pending buffer
        const [nextItem, ...remainingItems] = pendingItems;
        updatedItems.push(nextItem);
        
        // Update pending items buffer if running low
        if (remainingItems.length < 5) {
          const additionalItems = Array(10 - remainingItems.length)
            .fill(null)
            .map(() => generateRandomItem(true));
          
          setPendingItems([...remainingItems, ...additionalItems]);
        } else {
          setPendingItems(remainingItems);
        }
      } else {
        // Generate a new item if buffer is empty
        updatedItems.push(generateRandomItem(true));
      }
      
      // Return updated state
      return {
        ...prev,
        items: updatedItems,
        score: prev.score + pointsEarned,
        animatingItemId: null,
      };
    });
  }, [pendingItems, generateRandomItem]);

  // Update level configuration
  const setCurrentLevelConfig = useCallback((newConfig: LevelConfig) => {
    levelConfigRef.current = newConfig;
    setState(prev => ({ ...prev, currentLevelConfig: newConfig }));
  }, []);
  
  // Start game on component mount
  useEffect(() => {
    startGame();
  }, [startGame]);
  
  // Timer countdown logic
  useEffect(() => {
    // Only run timer when game is active and not paused
    if (!state.isGameActive || state.isPaused || state.timer <= 0) return;
    
    const timerInterval = setInterval(() => {
      const newTimer = timerRef.current - 1;
      timerRef.current = newTimer;
      
      // Update state only at important milestones or periodically
      if (
        newTimer === 0 || // When time runs out
        newTimer % 5 === 0 || // Update every 5 seconds
        (state.currentLevelConfig.swapTimes && // When basket swaps are needed
         state.currentLevelConfig.swapTimes.some(
           swap => newTimer >= swap.min && newTimer <= swap.max
         ))
      ) {
        setState(prev => ({ ...prev, timer: newTimer }));
      }
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [state.isGameActive, state.isPaused, state.currentLevelConfig]);
  
  // Check for game over condition
  useEffect(() => {
    if (state.timer <= 0 && state.isGameActive) {
      // Game is over, check if player has enough points
      const targetScore = state.currentLevelConfig.targetScore ?? 0;
      const levelCompleted = state.score >= targetScore;
      
      // If level is completed, save progress and unlock next level
      if (levelCompleted) {
        const nextLevel = state.level + 1;
        // Update max level if this is a new achievement
        if (nextLevel > maxUnlockedLevel) {
          setMaxUnlockedLevel(nextLevel);
          
          // Save to AsyncStorage
          (async () => {
            try {
              await AsyncStorage.setItem(STORAGE_KEY_LEVEL, nextLevel.toString());
              console.log(`Saved player level: ${nextLevel}`);
            } catch (error) {
              console.error('Error saving player level:', error);
            }
          })();
        }
      }
      
      setState(prev => ({
        ...prev,
        isGameActive: false,
        levelComplete: levelCompleted
      }));
      
      setGameOverVisible(true);
    }
  }, [state.timer, state.isGameActive, state.score, state.currentLevelConfig, state.level, maxUnlockedLevel]);
  
  // Reset basket state when starting a new level
  useEffect(() => {
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
  
  // Monitor time to trigger basket swaps
  useEffect(() => {
    // Skip if conditions aren't met
    if (state.isPaused || !state.isGameActive) return;
    
    const swapTimes = state.currentLevelConfig?.swapTimes;
    if (!swapTimes || swapTimes.length === 0 || basketSwapRef.current.completedSwaps >= swapTimes.length) return;
    
    console.log(`Monitoring for swap ${basketSwapRef.current.completedSwaps + 1}/${swapTimes.length}, timer=${getCurrentTimer()}`);
    
    const checkSwapInterval = setInterval(() => {
      // Only check when not currently swapping
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
      }
    }, 500);
    
    return () => clearInterval(checkSwapInterval);
  }, [state.isPaused, state.isGameActive, state.currentLevelConfig, getCurrentTimer]);

  // Function to swap two random baskets
  const triggerRandomBasketSwap = useCallback(() => {
    // Only proceed if we have enough baskets
    if (!state.currentLevelConfig?.baskets || state.currentLevelConfig.baskets.length < 2) return;

    // Create groups of baskets by groupId
    const basketsByGroup: Record<string, any[]> = {};
    
    // Classify baskets by group
    state.currentLevelConfig.baskets.forEach(basket => {
      if (!basket.groupId) return;
      
      if (!basketsByGroup[basket.groupId]) {
        basketsByGroup[basket.groupId] = [];
      }
      basketsByGroup[basket.groupId].push(basket);
    });
    
    // Get list of group IDs
    const groupIds = Object.keys(basketsByGroup);
    
    // Need at least 2 groups to swap between different groups
    if (groupIds.length < 2) return;
    
    // Randomly select 2 different groups
    const shuffledGroups = [...groupIds].sort(() => 0.5 - Math.random());
    const group1Id = shuffledGroups[0];
    const group2Id = shuffledGroups[1];
    
    // Randomly select one basket from each group
    const basket1 = basketsByGroup[group1Id][Math.floor(Math.random() * basketsByGroup[group1Id].length)];
    const basket2 = basketsByGroup[group2Id][Math.floor(Math.random() * basketsByGroup[group2Id].length)];
    
    if (!basket1 || !basket2) return;
    
    // Update config only if baskets are from different groups
    const updatedConfig = JSON.parse(JSON.stringify(state.currentLevelConfig));
    
    const updatedBasket1 = updatedConfig.baskets.find((b: any) => b.id === basket1.id);
    const updatedBasket2 = updatedConfig.baskets.find((b: any) => b.id === basket2.id);
    
    if (updatedBasket1 && updatedBasket2) {
      // Only swap groupId, keep the original basket color
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
  
  // Get target score
  const getTargetScore = useCallback(() => (
    state.currentLevelConfig?.targetScore || 100
  ), [state.currentLevelConfig]);
  
  // Restart game handler
  const handleRestart = useCallback(() => {
    setGameOverVisible(false);
    // Use setLevel with the current level to restart at the same level
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
  }, [state.level, maxUnlockedLevel, setLevel]);
  
  // Get target basket position for animation
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