import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface MobileQuickStartCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  gradient: string;
  className?: string;
}

const MobileQuickStartCard: React.FC<MobileQuickStartCardProps> = ({
  title,
  description,
  icon,
  action,
  gradient,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isPressedLong, setIsPressedLong] = useState(false);
  const [rippleStyle, setRippleStyle] = useState<React.CSSProperties>({});

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsPressed(true);
    setIsPressedLong(false);

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = 'touches' in e 
      ? e.touches[0].clientX - rect.left - size / 2
      : e.clientX - rect.left - size / 2;
    const y = 'touches' in e 
      ? e.touches[0].clientY - rect.top - size / 2
      : e.clientY - rect.top - size / 2;

    setRippleStyle({
      width: size,
      height: size,
      left: x,
      top: y,
    });

    // Long press detection
    const longPressTimer = setTimeout(() => {
      setIsPressedLong(true);
    }, 300);

    return () => clearTimeout(longPressTimer);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    setIsPressedLong(false);
    setRippleStyle({});
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('MobileQuickStartCard: clicked', { title, description });
    action();
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      className={`
        relative overflow-hidden
        p-4 sm:p-4 rounded-2xl
        bg-gradient-to-r ${gradient}
        text-white
        shadow-lg
        transform transition-all duration-200
        hover:scale-105 active:scale-95
        min-h-[120px] sm:min-h-[100px]
        touch-manipulation
        select-none
        ${isPressed ? 'scale-95' : ''}
        ${isPressedLong ? 'scale-105' : ''}
        ${className}
      `}
    >
      {/* Ripple Effect */}
      <span
        className="absolute bg-white opacity-30 rounded-full pointer-events-none"
        style={{
          ...rippleStyle,
          transform: 'translate(-50%, -50%)',
          animation: rippleStyle.width ? 'ripple 0.6s ease-out' : 'none',
        }}
      />

      {/* Content */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 relative z-10">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-bold text-base sm:text-lg mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-white/90 line-clamp-2">
            {description}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center">
          <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4 opacity-80" />
        </div>
      </div>

      {/* Pressed State Indicator */}
      {isPressedLong && (
        <div className="absolute inset-0 bg-white/10 rounded-2xl" />
      )}

      <style>{`
        @keyframes ripple {
          to {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
};

export default MobileQuickStartCard;
