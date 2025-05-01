import { ComponentType } from 'react';
import { SvgProps } from 'react-native-svg';

// Expanded to include more color options for future levels
export type ClothingColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange';

// Position types for animation
export type PositionType = 'very-top' | 'top' | 'middle' | 'bottom' | 'pending';

// Animation configuration for clothing items
export interface AnimationConfig {
  position_y: Record<PositionType, number>;
  scales: Record<PositionType, number>;
  opacities: Record<PositionType, number>;
  timing: {
    fly_to_basket: number;
    fade_out: number;
    shift_down: number;
    shake_wrong: number;
  };
  position_sequence: {
    'very-top': 'top';
    'top': 'middle';
    'middle': 'bottom';
    'pending': 'very-top';
    'bottom': null;
  };
}

// Game configuration type definition for level scoring and time settings
export interface LevelConfigData {
  pointsPerCorrect: number;
  pointsPerIncorrect: number;
  targetScore: number;
  timeLimit: number;
}

// Game config structure for the JSON file
export interface GameConfig {
  levels: {
    [key: string]: LevelConfigData;
  }
}

export interface ClothingItemType {
  id: string;
  icon: ComponentType<SvgProps>;
  color: ClothingColor;
}

// Extended position types for basket placement
export type BasketPosition = 'left' | 'right' | 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 
                             'left-top' | 'left-middle' | 'left-bottom' | 'right-top' | 'right-middle' | 'right-bottom';

// New basket configuration type
export interface BasketConfig {
  id: string;
  position: BasketPosition;
  color: ClothingColor;
  offsetX?: number; // Allow custom positioning adjustments
  offsetY?: number;
  groupId?: string; // ID of the basket group this basket belongs to
}

// New basket group configuration
export interface BasketGroupConfig {
  id: string;
  name: string;
  acceptedColors: ClothingColor[]; // Colors that are accepted by any basket in this group
  side: 'left' | 'right' | 'top' | 'bottom' | 'center'; // General side of the screen
}

// Swap time range config
export interface SwapTimeRange {
  min: number; // Minimum time remaining to trigger swap
  max: number; // Maximum time remaining to trigger swap
}

// Level configuration type
export interface LevelConfig {
  id: number;
  name: string;
  duration: number;
  initialItems: number;
  visibleItems: number;
  baskets: BasketConfig[];
  basketGroups: BasketGroupConfig[]; // Added basket groups configuration
  availableColors: ClothingColor[];
  speedMultiplier: number; // For controlling item generation speed
  pointsPerItem: number;
  pointsLostPerError?: number; // Points lost for incorrect selection
  targetScore?: number; // Score needed to advance to next level
  timeLimit?: number; // Time limit for the level in seconds
  swapTimes?: SwapTimeRange[]; // Times to trigger basket swaps
}

export interface GameState {
  items: ClothingItemType[];
  currentScore: number;
  timeLeft: number;
  currentLevel: number;
  isGameOver: boolean;
  isPaused: boolean;
}