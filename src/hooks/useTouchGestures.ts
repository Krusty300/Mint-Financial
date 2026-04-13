import { useState, useRef, createElement } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDelay?: number;
}

export const useTouchGestures = (options: TouchGestureOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onLongPress,
    threshold = 50,
    longPressDelay = 500
  } = options;

  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const longPressTimerRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const startTime = Date.now();
      
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: startTime
      });

      // Start long press timer
      longPressTimerRef.current = setTimeout(() => {
        if (onLongPress) {
          onLongPress();
        }
      }, longPressDelay);
    } else if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setInitialDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Clear long press timer on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (e.touches.length === 2 && onPinch && initialDistance !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const newScale = currentDistance / initialDistance;
      setScale(newScale);
      onPinch(newScale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (e.touches.length === 0 && touchStart) {
      const touch = e.changedTouches[0];
      const endTime = Date.now();

      // Calculate swipe
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = endTime - touchStart.time;

      // Only consider it a swipe if it's fast enough and long enough
      if (deltaTime < 300) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0 && onSwipeRight) {
              onSwipeRight();
            } else if (deltaX < 0 && onSwipeLeft) {
              onSwipeLeft();
            }
          }
        } else {
          // Vertical swipe
          if (Math.abs(deltaY) > threshold) {
            if (deltaY > 0 && onSwipeDown) {
              onSwipeDown();
            } else if (deltaY < 0 && onSwipeUp) {
              onSwipeUp();
            }
          }
        }
      }
    }

    // Reset pinch state
    if (e.touches.length < 2) {
      setInitialDistance(null);
      setScale(1);
    }

    setTouchStart(null);
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    scale
  };
};

interface SwipeableProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
}

export const Swipeable: React.FC<SwipeableProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = ''
}) => {
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  });

  return createElement(
    'div',
    {
      className,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    children
  );
};
