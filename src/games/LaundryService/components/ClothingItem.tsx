import React, { useEffect, useRef } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';

// Import icons
import BabyKitIcon from '../icons/BabyKitIcon';
import BasketIcon from '../icons/BasketIcon';
import DressIcon from '../icons/DressIcon';
import HatIcon from '../icons/HatIcon';
import JacketIcon from '../icons/JacketIcon';
import LongDressIcon from '../icons/LongDressIcon';
import ShirtIcon from '../icons/ShirtIcon';
import ShortDressIcon from '../icons/ShortDressIcon';
import ShortIcon from '../icons/ShortIcon';
import SocksIcon from '../icons/SocksIcon';
import SuitIcon from '../icons/SuitIcon';
import TankTopIcon from '../icons/TankTopIcon';

import { ClothingItem as ClothingItemType } from '../hooks/useGameLogic';
import { ItemPosition } from '../LaundryService';

// Import cấu hình từ file JSON để đảm bảo animation giống với bản gốc
import clothingItemConfig from '../config/ClothingItemConfig.json';

// Icon components map
const iconComponents: Record<string, React.ComponentType<any>> = {
  BabyKit: BabyKitIcon,
  Basket: BasketIcon,
  Dress: DressIcon,
  Hat: HatIcon,
  Jacket: JacketIcon,
  LongDress: LongDressIcon,
  Shirt: ShirtIcon,
  ShortDress: ShortDressIcon,
  Short: ShortIcon,
  Socks: SocksIcon,
  Suit: SuitIcon,
  TankTop: TankTopIcon
};

// Sử dụng cấu hình từ file JSON cho animation
export const ANIMATION_CONFIG = {
  POSITION_Y: {
    'very-top': clothingItemConfig.animation.position_y["very-top"],
    'top': clothingItemConfig.animation.position_y.top,
    'middle': clothingItemConfig.animation.position_y.middle,
    'bottom': clothingItemConfig.animation.position_y.bottom,
    'pending': clothingItemConfig.animation.position_y.pending
  },
  SCALES: {
    'very-top': clothingItemConfig.animation.scales["very-top"],
    'top': clothingItemConfig.animation.scales.top,
    'middle': clothingItemConfig.animation.scales.middle,
    'bottom': clothingItemConfig.animation.scales.bottom,
    'pending': clothingItemConfig.animation.scales.pending
  },
  OPACITIES: {
    'very-top': clothingItemConfig.animation.opacities["very-top"],
    'top': clothingItemConfig.animation.opacities.top,
    'middle': clothingItemConfig.animation.opacities.middle,
    'bottom': clothingItemConfig.animation.opacities.bottom,
    'pending': clothingItemConfig.animation.opacities.pending
  },
  TIMING: {
    FLY_TO_BASKET: clothingItemConfig.animation.timing.fly_to_basket,
    FADE_OUT: clothingItemConfig.animation.timing.fade_out,
    SHIFT_DOWN: clothingItemConfig.animation.timing.shift_down,
    SHAKE_WRONG: clothingItemConfig.animation.timing.shake_wrong
  },
  POSITION_SEQUENCE: {
    'very-top': clothingItemConfig.animation.position_sequence["very-top"],
    'top': clothingItemConfig.animation.position_sequence.top,
    'middle': clothingItemConfig.animation.position_sequence.middle,
    'pending': clothingItemConfig.animation.position_sequence.pending,
    'bottom': clothingItemConfig.animation.position_sequence.bottom
  }
};

interface ClothingItemProps {
  item: ClothingItemType;
  position: ItemPosition;
  onAnimationComplete?: () => void;
  isCorrect: boolean | null;
  targetBasketPosition: { x: number; y: number } | null;
  animationTrigger?: number;
  allItems?: ClothingItemType[];
  itemIndex?: number;
}

const { width } = Dimensions.get('window');

const ClothingItem = ({ 
  item, 
  position, 
  onAnimationComplete,
  isCorrect,
  targetBasketPosition,
  animationTrigger = 0,
  allItems = [],
  itemIndex = 0 
}: ClothingItemProps) => {
  // Animation values - sử dụng lại giá trị cấu hình từ file JSON
  const translateY = useSharedValue(ANIMATION_CONFIG.POSITION_Y[position]);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(ANIMATION_CONFIG.SCALES[position]);
  const opacity = useSharedValue(ANIMATION_CONFIG.OPACITIES[position]);
  
  // Animation completion tracking
  const animationCompleted = useRef(false);
  
  // Get the icon component
  const IconComponent = iconComponents[item.icon];
  
  // Animation complete callback
  const handleAnimationComplete = () => {
    if (onAnimationComplete && !animationCompleted.current) {
      animationCompleted.current = true;
      onAnimationComplete();
    }
  };
  
  // Reset animation tracking when item changes
  useEffect(() => {
    animationCompleted.current = false;
  }, [item.id, animationTrigger]);
  
  // Apply initial position based on the item's position in stack
  useEffect(() => {
    // Only update for non-animating items
    if (!item.animating && isCorrect !== true) {
      // Cancel any running animations
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(opacity);
      
      // Apply position values immediately
      translateY.value = ANIMATION_CONFIG.POSITION_Y[position];
      scale.value = ANIMATION_CONFIG.SCALES[position];
      opacity.value = ANIMATION_CONFIG.OPACITIES[position];
    }
  }, [position, translateY, scale, opacity, item.animating, isCorrect]);
  
  // Handle animations for correct selections
  useEffect(() => {
    const isAnimating = item.animating || isCorrect === true;
    
    if (isAnimating && targetBasketPosition) {
      // Animate item to target basket - dùng các giá trị từ config
      const screenCenter = width / 2;
      const targetX = targetBasketPosition.x - screenCenter;
      const targetY = targetBasketPosition.y - ANIMATION_CONFIG.POSITION_Y['bottom'] - 80;
      
      // Animate to basket with scaling and fading - dùng thời gian từ config
      scale.value = withTiming(ANIMATION_CONFIG.SCALES['pending'], {
        duration: ANIMATION_CONFIG.TIMING.FLY_TO_BASKET,
        easing: Easing.out(Easing.ease),
      });
      
      translateX.value = withTiming(targetX, {
        duration: ANIMATION_CONFIG.TIMING.FLY_TO_BASKET,
        easing: Easing.out(Easing.ease),
      });
      
      translateY.value = withTiming(targetY, {
        duration: ANIMATION_CONFIG.TIMING.FLY_TO_BASKET,
        easing: Easing.out(Easing.ease),
      }, (finished) => {
        if (finished) {
          // Fade out when reaching basket
          opacity.value = withTiming(0, {
            duration: ANIMATION_CONFIG.TIMING.FADE_OUT,
            easing: Easing.out(Easing.ease)
          }, () => {
            runOnJS(handleAnimationComplete)();
          });
        }
      });
    }
  }, [isCorrect, item.animating, targetBasketPosition, translateX, translateY, scale, opacity]);
  
  // Handle shifting other items when an item is selected
  useEffect(() => {
    // Skip this for the item being animated
    if (item.animating || isCorrect === true) return;
    
    // Check if any item is being animated
    const anyItemAnimating = allItems.some(item => item.animating);
    
    if (anyItemAnimating) {
      // Get the next position in the sequence
      const nextPosition = ANIMATION_CONFIG.POSITION_SEQUENCE[position] as ItemPosition | null;
      
      // Only animate if there is a next position
      if (nextPosition) {
        // Animate to the next position using timing from config
        translateY.value = withTiming(ANIMATION_CONFIG.POSITION_Y[nextPosition], {
          duration: ANIMATION_CONFIG.TIMING.SHIFT_DOWN,
          easing: Easing.inOut(Easing.ease),
        });
        
        scale.value = withTiming(ANIMATION_CONFIG.SCALES[nextPosition], {
          duration: ANIMATION_CONFIG.TIMING.SHIFT_DOWN,
          easing: Easing.inOut(Easing.ease),
        });
        
        opacity.value = withTiming(ANIMATION_CONFIG.OPACITIES[nextPosition], {
          duration: ANIMATION_CONFIG.TIMING.SHIFT_DOWN,
          easing: Easing.inOut(Easing.ease),
        });
      }
    }
  }, [allItems, item.animating, isCorrect, position, translateY, scale, opacity]);
  
  // Handle incorrect selection animation
  useEffect(() => {
    if (isCorrect === false) {
      // Quick shake animation với timing từ config
      translateX.value = withSequence(
        withTiming(5, { duration: ANIMATION_CONFIG.TIMING.SHAKE_WRONG }),
        withTiming(-5, { duration: ANIMATION_CONFIG.TIMING.SHAKE_WRONG }),
        withTiming(5, { duration: ANIMATION_CONFIG.TIMING.SHAKE_WRONG }),
        withTiming(0, { duration: ANIMATION_CONFIG.TIMING.SHAKE_WRONG })
      );
    }
  }, [isCorrect, translateX]);
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  }));
  
  const itemStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 130,
  }));
  
  return (
    <Animated.View style={containerStyle}>
      <Animated.View style={itemStyle}>
        {IconComponent && (
          <IconComponent 
            width={100}
            height={100}
            fill={item.color} 
          />
        )}
      </Animated.View>
    </Animated.View>
  );
}

export default ClothingItem;