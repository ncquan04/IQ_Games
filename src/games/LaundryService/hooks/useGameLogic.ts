import { useState, useEffect, useCallback, useRef } from 'react';
import { ClothingColor, LevelConfig } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// All available clothing icons
const iconTypes = [
  'BabyKit', 'Dress', 'Hat', 'Jacket', 'LongDress', 
  'Shirt', 'ShortDress', 'Short', 'Socks', 'Suit', 'TankTop'
];

// Type definitions
export interface ClothingItem {
  id: string;
  icon: string;
  color: ClothingColor;
  animating?: boolean;
  isPending?: boolean;
}

export interface GameState {
  items: ClothingItem[];
  score: number;
  timer: number;
  level: number;
  isGameActive: boolean;
  isPaused: boolean;
  animatingItemId: string | null;
  currentLevelConfig: LevelConfig;
  levelComplete?: boolean;
  levelTransition?: boolean;
}

// Utility function to create a unique ID
const generateUniqueId = (): string => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Storage key for saving the player's level
const STORAGE_KEY_LEVEL = '@laundry_service_max_level';

// Function to save player's level
const savePlayerLevel = async (level: number) => {
  try {
    // Only save if this level is higher than previously saved level
    const existingLevel = await AsyncStorage.getItem(STORAGE_KEY_LEVEL);
    const parsedExistingLevel = existingLevel ? parseInt(existingLevel) : 0;
    
    if (level > parsedExistingLevel) {
      await AsyncStorage.setItem(STORAGE_KEY_LEVEL, level.toString());
      console.log(`Saved player level: ${level}`);
    }
  } catch (error) {
    console.error('Error saving player level:', error);
  }
};

// Function to retrieve player's saved level
const getPlayerLevel = async (): Promise<number> => {
  try {
    const savedLevel = await AsyncStorage.getItem(STORAGE_KEY_LEVEL);
    return savedLevel ? parseInt(savedLevel) : 1; // Default to level 1 if nothing saved
  } catch (error) {
    console.error('Error retrieving player level:', error);
    return 1; // Default to level 1 on error
  }
};

// Level configuration is moved to an object for cleaner lookup
const levelConfigs: Record<number, LevelConfig> = {
  1: {
    id: 1,
    name: 'Level 1 - Basic',
    duration: 45,
    initialItems: 5,
    visibleItems: 4,
    baskets: [
      { id: 'basket-red', position: 'left', color: 'red', groupId: 'group-left' },
      { id: 'basket-blue', position: 'right', color: 'blue', groupId: 'group-right' }
    ],
    basketGroups: [
      { id: 'group-left', name: 'Left Side Basket', acceptedColors: ['red'], side: 'left' },
      { id: 'group-right', name: 'Right Side Basket', acceptedColors: ['blue'], side: 'right' }
    ],
    availableColors: ['red', 'blue'],
    speedMultiplier: 1,
    pointsPerItem: 13,
    pointsLostPerError: -10,
    targetScore: 1000,
    timeLimit: 45,
  },
  2: {
    id: 2,
    name: 'Level 2 - Swap',
    duration: 45,
    initialItems: 5,
    visibleItems: 4,
    baskets: [
      { id: 'basket-red', position: 'left', color: 'red', groupId: 'group-left' },
      { id: 'basket-blue', position: 'right', color: 'blue', groupId: 'group-right' }
    ],
    basketGroups: [
      { id: 'group-left', name: 'Left Side Basket', acceptedColors: ['red'], side: 'left' },
      { id: 'group-right', name: 'Right Side Basket', acceptedColors: ['blue'], side: 'right' }
    ],
    availableColors: ['red', 'blue'],
    speedMultiplier: 1.2,
    pointsPerItem: 15,
    pointsLostPerError: -12,
    targetScore: 1500,
    timeLimit: 45,
    swapTimes: [{ min: 20, max: 25 }]
  },
  3: {
    id: 3,
    name: 'Level 3 - Double Swap',
    duration: 45,
    initialItems: 5,
    visibleItems: 4,
    baskets: [
      { id: 'basket-red', position: 'left', color: 'red', groupId: 'group-left' },
      { id: 'basket-blue', position: 'right', color: 'blue', groupId: 'group-right' }
    ],
    basketGroups: [
      { id: 'group-left', name: 'Left Side Basket', acceptedColors: ['red'], side: 'left' },
      { id: 'group-right', name: 'Right Side Basket', acceptedColors: ['blue'], side: 'right' }
    ],
    availableColors: ['red', 'blue'],
    speedMultiplier: 1.4,
    pointsPerItem: 18,
    pointsLostPerError: -13,
    targetScore: 2000,
    timeLimit: 45,
    swapTimes: [{ min: 30, max: 35 }, { min: 15, max: 20 }]
  },
  4: {
    id: 4,
    name: 'Level 4 - Four Baskets',
    duration: 50,
    initialItems: 5,
    visibleItems: 4,
    baskets: [
      { id: 'basket-red', position: 'left-top', color: 'red', groupId: 'group-left' },
      { id: 'basket-yellow', position: 'left-bottom', color: 'yellow', groupId: 'group-left' },
      { id: 'basket-blue', position: 'right-top', color: 'blue', groupId: 'group-right' },
      { id: 'basket-green', position: 'right-bottom', color: 'green', groupId: 'group-right' }
    ],
    basketGroups: [
      { id: 'group-left', name: 'Left Side Baskets', acceptedColors: ['red', 'yellow'], side: 'left' },
      { id: 'group-right', name: 'Right Side Baskets', acceptedColors: ['blue', 'green'], side: 'right' }
    ],
    availableColors: ['red', 'blue', 'yellow', 'green'],
    speedMultiplier: 1.5,
    pointsPerItem: 18,
    pointsLostPerError: -14,
    targetScore: 2500,
    timeLimit: 50,
  },
  5: {
    id: 5,
    name: 'Level 5 - Four Baskets Swap',
    duration: 50,
    initialItems: 5,
    visibleItems: 4,
    baskets: [
      { id: 'basket-red', position: 'left-top', color: 'red', groupId: 'group-left' },
      { id: 'basket-yellow', position: 'left-bottom', color: 'yellow', groupId: 'group-left' },
      { id: 'basket-blue', position: 'right-top', color: 'blue', groupId: 'group-right' },
      { id: 'basket-green', position: 'right-bottom', color: 'green', groupId: 'group-right' }
    ],
    basketGroups: [
      { id: 'group-left', name: 'Left Side Baskets', acceptedColors: ['red', 'yellow'], side: 'left' },
      { id: 'group-right', name: 'Right Side Baskets', acceptedColors: ['blue', 'green'], side: 'right' }
    ],
    availableColors: ['red', 'blue', 'yellow', 'green'],
    speedMultiplier: 1.7,
    pointsPerItem: 21,
    pointsLostPerError: -16,
    targetScore: 3000,
    timeLimit: 50,
    swapTimes: [{ min: 25, max: 30 }]
  },
  6: {
    id: 6,
    name: 'Level 6 - Four Baskets Double Swap',
    duration: 50,
    initialItems: 5,
    visibleItems: 4,
    baskets: [
      { id: 'basket-red', position: 'left-top', color: 'red', groupId: 'group-left' },
      { id: 'basket-yellow', position: 'left-bottom', color: 'yellow', groupId: 'group-left' },
      { id: 'basket-blue', position: 'right-top', color: 'blue', groupId: 'group-right' },
      { id: 'basket-green', position: 'right-bottom', color: 'green', groupId: 'group-right' }
    ],
    basketGroups: [
      { id: 'group-left', name: 'Left Side Baskets', acceptedColors: ['red', 'yellow'], side: 'left' },
      { id: 'group-right', name: 'Right Side Baskets', acceptedColors: ['blue', 'green'], side: 'right' }
    ],
    availableColors: ['red', 'blue', 'yellow', 'green'],
    speedMultiplier: 2,
    pointsPerItem: 25,
    pointsLostPerError: -21,
    targetScore: 3500,
    timeLimit: 50,
    swapTimes: [{ min: 30, max: 35 }, { min: 10, max: 15 }]
  },
  7: {
    id: 7,
    name: 'Level 7 - Six Baskets',
    duration: 50,
    initialItems: 5,
    visibleItems: 4,
    baskets: [
      { id: 'basket-red', position: 'left-top', color: 'red', groupId: 'group-left' },
      { id: 'basket-yellow', position: 'left-middle', color: 'yellow', groupId: 'group-left' },
      { id: 'basket-purple', position: 'left-bottom', color: 'purple', groupId: 'group-left' },
      { id: 'basket-blue', position: 'right-top', color: 'blue', groupId: 'group-right' },
      { id: 'basket-green', position: 'right-middle', color: 'green', groupId: 'group-right' },
      { id: 'basket-orange', position: 'right-bottom', color: 'orange', groupId: 'group-right' }
    ],
    basketGroups: [
      { id: 'group-left', name: 'Left Side Baskets', acceptedColors: ['red', 'yellow', 'purple'], side: 'left' },
      { id: 'group-right', name: 'Right Side Baskets', acceptedColors: ['blue', 'green', 'orange'], side: 'right' }
    ],
    availableColors: ['red', 'blue', 'yellow', 'green', 'purple', 'orange'],
    speedMultiplier: 1.5,
    pointsPerItem: 18,
    pointsLostPerError: -14,
    targetScore: 2500,
    timeLimit: 50,
  },
  8: {
    id: 8,
    name: 'Level 8 - Six Baskets Swap',
    duration: 50,
    initialItems: 5,
    visibleItems: 4,
    baskets: [
      { id: 'basket-red', position: 'left-top', color: 'red', groupId: 'group-left' },
      { id: 'basket-yellow', position: 'left-middle', color: 'yellow', groupId: 'group-left' },
      { id: 'basket-purple', position: 'left-bottom', color: 'purple', groupId: 'group-left' },
      { id: 'basket-blue', position: 'right-top', color: 'blue', groupId: 'group-right' },
      { id: 'basket-green', position: 'right-middle', color: 'green', groupId: 'group-right' },
      { id: 'basket-orange', position: 'right-bottom', color: 'orange', groupId: 'group-right' }
    ],
    basketGroups: [
      { id: 'group-left', name: 'Left Side Baskets', acceptedColors: ['red', 'yellow', 'purple'], side: 'left' },
      { id: 'group-right', name: 'Right Side Baskets', acceptedColors: ['blue', 'green', 'orange'], side: 'right' }
    ],
    availableColors: ['red', 'blue', 'yellow', 'green', 'purple', 'orange'],
    speedMultiplier: 1.7,
    pointsPerItem: 21,
    pointsLostPerError: -16,
    targetScore: 3000,
    timeLimit: 50,
    swapTimes: [{ min: 25, max: 30 }]
  },
  9: {
    id: 9,
    name: 'Level 9 - Six Baskets Double Swap',
    duration: 50,
    initialItems: 5,
    visibleItems: 4,
    baskets: [
      { id: 'basket-red', position: 'left-top', color: 'red', groupId: 'group-left' },
      { id: 'basket-yellow', position: 'left-middle', color: 'yellow', groupId: 'group-left' },
      { id: 'basket-purple', position: 'left-bottom', color: 'purple', groupId: 'group-left' },
      { id: 'basket-blue', position: 'right-top', color: 'blue', groupId: 'group-right' },
      { id: 'basket-green', position: 'right-middle', color: 'green', groupId: 'group-right' },
      { id: 'basket-orange', position: 'right-bottom', color: 'orange', groupId: 'group-right' }
    ],
    basketGroups: [
      { id: 'group-left', name: 'Left Side Baskets', acceptedColors: ['red', 'yellow', 'purple'], side: 'left' },
      { id: 'group-right', name: 'Right Side Baskets', acceptedColors: ['blue', 'green', 'orange'], side: 'right' }
    ],
    availableColors: ['red', 'blue', 'yellow', 'green', 'purple', 'orange'],
    speedMultiplier: 2,
    pointsPerItem: 25,
    pointsLostPerError: -21,
    targetScore: 3500,
    timeLimit: 50,
    swapTimes: [{ min: 30, max: 35 }, { min: 10, max: 15 }]
  },
};

// Helper function to get level config - simplifies access to the config
const getDefaultLevelConfig = (level: number = 1): LevelConfig => {
  return levelConfigs[level] || levelConfigs[1];
};

interface UseGameLogicProps {
  initialLevel?: number;
}

export const useGameLogic = ({ initialLevel = 1 }: UseGameLogicProps = {}) => {
  // Initial level config
  const initialLevelConfig = getDefaultLevelConfig(initialLevel);
  
  // Track the max level the player has unlocked
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(initialLevel);
  
  // Tách timer thành ref để không gây re-render
  const timerRef = useRef(initialLevelConfig.timeLimit || 45);
  
  // Core game state
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
  
  // Ref to avoid unnecessary rerenders
  const levelConfigRef = useRef<LevelConfig>(initialLevelConfig);
  
  // Sync ref when state changes
  useEffect(() => {
    levelConfigRef.current = state.currentLevelConfig;
    timerRef.current = state.timer;
  }, [state.currentLevelConfig, state.timer]);
  
  // Load saved level from AsyncStorage on initial mount
  useEffect(() => {
    const loadSavedLevel = async () => {
      const savedLevel = await getPlayerLevel();
      if (savedLevel > initialLevel) {
        setMaxUnlockedLevel(savedLevel);
        // We don't auto-start at the highest level, but keep the information for level selection
        console.log(`Loaded saved player level: ${savedLevel}`);
      }
    };
    
    loadSavedLevel();
  }, [initialLevel]);
  
  // Buffer for upcoming items to improve performance
  const [pendingItems, setPendingItems] = useState<ClothingItem[]>([]);

  // Generate a random item - pure function with no state dependencies
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
  }, []); // No dependencies

  // Prefill the buffer with pending items
  const generatePendingItemsBuffer = useCallback(() => {
    const buffer = Array(10).fill(null).map(() => generateRandomItem(true));
    setPendingItems(buffer);
  }, [generateRandomItem]);

  // Start or restart the game - simplified logic
  const startGame = useCallback(() => {
    const levelConfig = getDefaultLevelConfig(1);
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
  }, [generateRandomItem, generatePendingItemsBuffer, initialLevel]);
  
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
      levelComplete: false,
      levelTransition: false
    });
  }, [generateRandomItem, generatePendingItemsBuffer]);

  // Toggle pause state - simple function
  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Check if color is accepted in basket - pure function with no state dependencies
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
  
  // Remove completed item and add new one - simplified logic
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
  
  // Timer countdown logic - tối ưu hóa bằng cách tách biệt timer
  useEffect(() => {
    // Only run timer when game is active and not paused
    if (!state.isGameActive || state.isPaused || state.timer <= 0) return;
    
    const timerInterval = setInterval(() => {
      const newTimer = timerRef.current - 1;
      timerRef.current = newTimer;
      
      // Chỉ cập nhật state tại các mốc quan trọng hoặc định kỳ
      if (
        newTimer === 0 || // Khi hết thời gian
        newTimer % 5 === 0 || // Cập nhật mỗi 5 giây
        (state.currentLevelConfig.swapTimes && // Khi cần swap baskets
         state.currentLevelConfig.swapTimes.some(
           swap => newTimer >= swap.min && newTimer <= swap.max
         ))
      ) {
        // Chỉ cập nhật timer mà không phải toàn bộ state
        setState(prev => ({ ...prev, timer: newTimer }));
      }
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [state.isGameActive, state.isPaused, state.currentLevelConfig]);
  
  // Thêm hàm để lấy thời gian chính xác
  const getCurrentTimer = useCallback(() => timerRef.current, []);

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
          savePlayerLevel(nextLevel);
        }
      }
      
      setState(prev => ({
        ...prev,
        isGameActive: false,
        levelComplete: levelCompleted
      }));
    }
  }, [state.timer, state.isGameActive, state.score, state.currentLevelConfig, state.level, maxUnlockedLevel]);
  
  // Handle item selection - simplified with clearer logic flow
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
  
  // Update level configuration
  const setCurrentLevelConfig = useCallback((newConfig: LevelConfig) => {
    levelConfigRef.current = newConfig;
    setState(prev => ({ ...prev, currentLevelConfig: newConfig }));
  }, []);

  return {
    state,
    startGame,
    setLevel,
    togglePause,
    handleItemSelection,
    completeAnimation,
    setCurrentLevelConfig,
    maxUnlockedLevel,
    getCurrentTimer, // Thêm hàm này để lấy thời gian chính xác
  };
};

export default useGameLogic;