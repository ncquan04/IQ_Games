import { LevelConfig } from '../types';

// Level configurations
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

// Helper function to get level config
export const getDefaultLevelConfig = (level: number = 1): LevelConfig => {
  return levelConfigs[level] || levelConfigs[1];
};

export default levelConfigs;