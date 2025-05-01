import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, View } from 'react-native';
import BasketIcon from '../icons/BasketIcon';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { ClothingColor, BasketPosition } from '../types';

const { width, height } = Dimensions.get('window');

interface BasketButtonProps {
  position: BasketPosition;
  color: ClothingColor;
  onPress: (color: ClothingColor, basketId: string) => void;
  getPosition: () => { x: number; y: number };
  onPositionUpdate: (position: { x: number; y: number }) => void;
  offsetX?: number;
  offsetY?: number;
  swapWithId?: string | null;
  swapTrigger?: number;
  basketId: string;
  allBasketPositions?: Record<string, { x: number; y: number }>;
  groupId?: string; 
  size?: 'small' | 'medium' | 'large';
  resetPositionTrigger?: number; // New prop to trigger position reset when level ends
}

const BasketButton: React.FC<BasketButtonProps> = ({ 
  position, 
  color, 
  onPress,
  getPosition,
  onPositionUpdate,
  offsetX = 0,
  offsetY = 0,
  swapWithId = null,
  swapTrigger = 0,
  basketId,
  allBasketPositions = {},
  groupId,
  size = 'medium',
  resetPositionTrigger = 0, // Default value for the reset trigger
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  // Basket position tracking
  const basketRef = useRef<View>(null);
  const [isPositionMeasured, setIsPositionMeasured] = useState(false);
  const [customPosition, setCustomPosition] = useState<{left?: number, right?: number, top?: number, bottom?: number} | null>(null);
  
  // Current basket position for reference
  const currentPosition = useRef({ x: 0, y: 0 });
  
  // Measure and update basket position
  const measureAndUpdatePosition = () => {
    if (basketRef.current) {
      basketRef.current.measure((x, y, width, height, pageX, pageY) => {
        if (width && height && pageX !== undefined && pageY !== undefined) {
          // Calculate basket center
          const centerX = pageX + width / 2;
          const centerY = pageY + height / 2;
          
          // Store position for reference
          currentPosition.current = { x: centerX, y: centerY };
          onPositionUpdate({ x: centerX, y: centerY });
          setIsPositionMeasured(true);
        } else {
          // Retry if measurement failed
          setTimeout(measureAndUpdatePosition, 100);
        }
      });
    }
  };
  
  // Handle layout changes
  const handleLayout = () => {
    setTimeout(measureAndUpdatePosition, 100);
  };
  
  // Initial position measurement
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isPositionMeasured) {
        measureAndUpdatePosition();
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [position, onPositionUpdate, isPositionMeasured]);
  
  // Listen for screen dimension changes
  useEffect(() => {
    const dimensionChangeHandler = () => {
      setIsPositionMeasured(false);
      setTimeout(measureAndUpdatePosition, 100);
    };
    
    // Add dimension change listener
    const dimensionSubscription = Dimensions.addEventListener('change', dimensionChangeHandler);
    
    return () => {
      // Clean up listener
      dimensionSubscription.remove();
    };
  }, []);
  
  // Handle basket swapping with animation
  useEffect(() => {
    // Only proceed if we have a valid basket to swap with and the trigger has changed
    if (swapWithId && swapTrigger > 0 && allBasketPositions[swapWithId]) {
      const targetBasket = allBasketPositions[swapWithId];
      const myPosition = currentPosition.current;
      
      if (targetBasket && myPosition.x && myPosition.y) {
        // Calculate delta to move from current position to target position
        const deltaX = targetBasket.x - myPosition.x;
        const deltaY = targetBasket.y - myPosition.y;
        
        // Animated swap với thời gian nhanh hơn (150ms thay vì 600ms)
        translateX.value = withTiming(deltaX, { 
          duration: 150, 
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        
        translateY.value = withTiming(deltaY, { 
          duration: 150, 
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        
        // Thêm một hiệu ứng nhỏ ở cuối để nhấn mạnh việc hoàn thành
        scale.value = withSequence(
          withDelay(
            120, // Đợi gần xong animation di chuyển
            withSequence(
              withTiming(1.05, { duration: 50 }),
              withTiming(1, { duration: 50 })
            )
          )
        );
        
        // Update position sau khi animation hoàn thành
        // Tăng thời gian timeout lên một chút để đảm bảo animation hoàn thành trước
        const animationDuration = 170; // 150ms + buffer nhỏ
        
        // Calculate new absolute position based on the current layout position and deltas
        setTimeout(() => {
          // Update to new position after animation
          updatePositionAfterSwap(deltaX, deltaY);
          
          // Đặt lại giá trị animation sau khi đã cập nhật position để tránh nháy
          setTimeout(() => {
            translateX.value = 0;
            translateY.value = 0;
            
            // Re-measure position sau khi mọi thứ đã ổn định
            setTimeout(measureAndUpdatePosition, 10);
          }, 10);
        }, animationDuration);
      }
    }
  }, [swapTrigger, swapWithId, allBasketPositions]);

  // Handle reset position when resetPositionTrigger changes
  useEffect(() => {
    if (resetPositionTrigger > 0) {
      // Reset to original position by clearing customPosition
      setCustomPosition(null);
      
      // Add a small bounce animation for visual feedback
      scale.value = withSequence(
        withTiming(0.9, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(1.1, { duration: 150, easing: Easing.bounce }),
        withTiming(1, { duration: 100 })
      );
      
      // Reset animation values
      translateX.value = 0;
      translateY.value = 0;
      
      // Re-measure after animation completes
      setTimeout(measureAndUpdatePosition, 350);
      
      console.log(`Basket ${basketId} position reset to original position`);
    }
  }, [resetPositionTrigger, basketId]);
  
  // Update position after swap animation
  const updatePositionAfterSwap = (deltaX: number, deltaY: number) => {
    // Lấy style vị trí hiện tại, ưu tiên customPosition nếu đã có
    let currentStyleValues: any;
    
    if (customPosition) {
      // Nếu đã có customPosition (từ swap trước), sử dụng nó làm cơ sở
      currentStyleValues = { ...customPosition };
    } else {
      // Ngược lại sử dụng style gốc
      const currentStyle = getPositionStyle();
      currentStyleValues = StyleSheet.flatten(currentStyle);
    }
    
    // Calculate new position
    const newPosition: {left?: number, right?: number, top?: number, bottom?: number} = {};
    
    // Handle horizontal position
    if ('left' in currentStyleValues && typeof currentStyleValues.left === 'number') {
      newPosition.left = currentStyleValues.left + deltaX;
    } else if ('right' in currentStyleValues && typeof currentStyleValues.right === 'number') {
      newPosition.right = currentStyleValues.right - deltaX;
    }
    
    // Handle vertical position
    if ('top' in currentStyleValues && typeof currentStyleValues.top === 'number') {
      newPosition.top = currentStyleValues.top + deltaY;
    } else if ('bottom' in currentStyleValues && typeof currentStyleValues.bottom === 'number') {
      newPosition.bottom = currentStyleValues.bottom - deltaY;
    }

    // Đảm bảo vị trí mới không vượt ra ngoài màn hình
    if ('left' in newPosition && newPosition.left !== undefined) {
      newPosition.left = Math.max(-width/2, Math.min(width - 50, newPosition.left));
    }
    if ('right' in newPosition && newPosition.right !== undefined) {
      newPosition.right = Math.max(-width/2, Math.min(width - 50, newPosition.right));
    }
    if ('top' in newPosition && newPosition.top !== undefined) {
      newPosition.top = Math.max(0, Math.min(height - 100, newPosition.top));
    }
    if ('bottom' in newPosition && newPosition.bottom !== undefined) {
      newPosition.bottom = Math.max(0, Math.min(height - 100, newPosition.bottom));
    }
    
    // Update custom position
    setCustomPosition(newPosition);
    
    // Log vị trí để debug
    console.log(`Basket ${basketId} new position:`, newPosition);
  };
  
  // Handle press animation
  const handlePress = () => {
    // Lively press animation
    scale.value = withSequence(
      withTiming(1.2, { duration: 100, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(0.95, { duration: 100, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(1.05, { duration: 100, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(1, { duration: 100, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    
    // Call onPress handler with basket color and ID
    onPress(color, basketId);
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value }
    ],
  }));

  // Get basket size
  const basketSize = (() => {
    switch(size) {
      case 'small': return { width: 90, height: 90 };
      case 'large': return { width: 150, height: 150 };
      default: return { width: 120, height: 120 };
    }
  })();

  // Get position style based on position prop
  const getPositionStyle = () => {
    switch (position) {
      case 'left': return styles.leftPosition;
      case 'right': return styles.rightPosition;
      case 'center': return styles.centerPosition;
      case 'top-left': return styles.topLeftPosition;
      case 'top-right': return styles.topRightPosition;
      case 'bottom-left': return styles.bottomLeftPosition;
      case 'bottom-right': return styles.bottomRightPosition;
      case 'left-top': return styles.leftTopPosition;
      case 'left-middle': return styles.leftMiddlePosition;
      case 'left-bottom': return styles.leftBottomPosition;
      case 'right-top': return styles.rightTopPosition;
      case 'right-middle': return styles.rightMiddlePosition;
      case 'right-bottom': return styles.rightBottomPosition;
      default: return styles.bottomPosition;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        styles.container,
        { width: basketSize.width, height: basketSize.height },
        customPosition || getPositionStyle(),
        offsetX || offsetY ? { marginLeft: offsetX, marginTop: offsetY } : {}
      ]}
    >
      <Animated.View
        ref={basketRef}
        onLayout={handleLayout}
        style={[
          styles.iconContainer,
          { width: basketSize.width, height: basketSize.height },
          animatedStyle
        ]}
      >
        <BasketIcon 
          width={basketSize.width * 1.25} 
          height={basketSize.height * 1.25} 
          fill={color} 
          stroke="#000000"
          strokeWidth={0.3}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Position styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Basic positions
  leftPosition: { left: 15, bottom: 15 },
  rightPosition: { right: 15, bottom: 15 },
  centerPosition: { bottom: 15, alignSelf: 'center' },
  
  // Corner positions
  topLeftPosition: { left: 15, top: 150 },
  topRightPosition: { right: 15, top: 150 },
  bottomLeftPosition: { left: 15, bottom: 15 },
  bottomRightPosition: { right: 15, bottom: 15 },
  
  // Left stacked positions
  leftTopPosition: { left: 15, bottom: 200 },
  leftMiddlePosition: { left: 15, bottom: 120 },
  leftBottomPosition: { left: 15, bottom: 40 },
  
  // Right stacked positions
  rightTopPosition: { right: 15, bottom: 200 },
  rightMiddlePosition: { right: 15, bottom: 120 },
  rightBottomPosition: { right: 15, bottom: 40 },
  
  // Default position
  bottomPosition: { bottom: 15, alignSelf: 'center' },
});

export default BasketButton;