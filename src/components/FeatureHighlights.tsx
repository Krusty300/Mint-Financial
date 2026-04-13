import React, { useState, useEffect } from 'react';
import { Sparkles, X, Info, TrendingUp, CheckCircle } from 'lucide-react';

interface FeatureHighlight {
  id: string;
  feature: string;
  type: 'new' | 'enhanced' | 'improved';
  title: string;
  description: string;
  target?: string; // CSS selector for target element
  dismissible?: boolean;
  autoHide?: number; // Auto-hide after X milliseconds
  priority?: 'low' | 'medium' | 'high';
  category?: 'ui' | 'functionality' | 'performance' | 'accessibility';
}

interface FeatureHighlightsProps {
  enabled?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
  autoHideOnCompletion?: boolean;
}

const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({
  enabled = true,
  position = 'top-right',
  maxVisible = 3,
  autoHideOnCompletion = true
}) => {
  const [highlights, setHighlights] = useState<FeatureHighlight[]>([]);
  const [visibleHighlights, setVisibleHighlights] = useState<string[]>([]);
  const [expandedHighlight, setExpandedHighlight] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Define feature highlights
  const featureHighlights: FeatureHighlight[] = [
    {
      id: 'keyboard-shortcuts',
      feature: 'keyboard-shortcuts',
      type: 'new',
      title: 'New Keyboard Shortcuts',
      description: 'Press Ctrl+N for new invoice, Ctrl+S to save, Ctrl+Z to undo. Press "?" for help!',
      target: '.keyboard-shortcuts-help',
      priority: 'high',
      category: 'functionality',
      autoHide: 8000
    },
    {
      id: 'undo-redo',
      feature: 'undo-redo',
      type: 'new',
      title: 'Undo/Redo System',
      description: 'Track and reverse up to 50 actions with detailed history. Ctrl+Z/Ctrl+Y to use.',
      target: '.undo-redo-toolbar',
      priority: 'high',
      category: 'functionality',
      autoHide: 10000
    },
    {
      id: 'drag-drop',
      feature: 'drag-drop',
      type: 'enhanced',
      title: 'Enhanced Drag & Drop',
      description: 'Reorder invoice items with improved touch support and visual feedback.',
      target: '.draggable-invoice-items',
      priority: 'medium',
      category: 'ui',
      autoHide: 7000
    },
    {
      id: 'live-preview',
      feature: 'live-preview',
      type: 'new',
      title: 'Live Invoice Preview',
      description: 'Real-time preview updates as you edit. Switch templates instantly!',
      target: '.live-preview-section',
      priority: 'high',
      category: 'ui',
      autoHide: 9000
    },
    {
      id: 'dark-mode',
      feature: 'dark-mode',
      type: 'new',
      title: 'Dark Mode Support',
      description: 'Work comfortably in any lighting with beautiful dark themes.',
      target: '.dark-mode-toggle',
      priority: 'medium',
      category: 'accessibility',
      autoHide: 6000
    },
    {
      id: 'mobile-responsive',
      feature: 'mobile-responsive',
      type: 'enhanced',
      title: 'Mobile Optimization',
      description: 'Touch-friendly controls with 44px minimum touch targets.',
      priority: 'medium',
      category: 'accessibility',
      autoHide: 7000
    },
    {
      id: 'loading-states',
      feature: 'loading-states',
      type: 'new',
      title: 'Smart Loading States',
      description: 'Beautiful loading indicators for all async operations.',
      priority: 'low',
      category: 'performance',
      autoHide: 5000
    },
    {
      id: 'advanced-search',
      feature: 'advanced-search',
      type: 'enhanced',
      title: 'Enhanced Search',
      description: 'Real-time search with fuzzy matching and smart suggestions.',
      target: '.advanced-search',
      priority: 'medium',
      category: 'functionality',
      autoHide: 8000
    }
  ];

  // Check for completion status
  useEffect(() => {
    const checkCompletion = () => {
      const tourCompleted = localStorage.getItem('feature-tour-completed') === 'true';
      const userLevel = parseInt(localStorage.getItem('user-level') || '1');
      const dismissedHighlights = JSON.parse(localStorage.getItem('dismissed-highlights') || '[]');
      const dismissedCount = dismissedHighlights.length;
      
      console.log('FeatureHighlights completion check:', {
        tourCompleted,
        userLevel,
        dismissedCount,
        dismissedHighlights,
        shouldComplete: tourCompleted && userLevel >= 2 && dismissedCount >= 6
      });
      
      // Consider completed if:
      // 1. Tour is completed
      // 2. User is at least level 2 (intermediate)
      // 3. Most highlights have been dismissed (at least 6 out of 8)
      const shouldComplete = tourCompleted && userLevel >= 2 && dismissedCount >= 6;
      
      if (shouldComplete && !isCompleted) {
        console.log('FeatureHighlights: Triggering completion and auto-hide');
        setIsCompleted(true);
        if (autoHideOnCompletion) {
          // Auto-hide all highlights after completion
          setTimeout(() => {
            console.log('FeatureHighlights: Hiding all highlights');
            setVisibleHighlights([]);
          }, 2000); // Give 2 seconds to see completion message
        }
      }
    };

    checkCompletion();
    
    // Check completion periodically
    const interval = setInterval(checkCompletion, 5000);
    return () => clearInterval(interval);
  }, [isCompleted, autoHideOnCompletion]);

  useEffect(() => {
    if (!enabled || isCompleted) return;

    // Check if user has seen highlights before
    const dismissedHighlights = JSON.parse(localStorage.getItem('dismissed-highlights') || '[]');
    const activeHighlights = featureHighlights.filter(h => !dismissedHighlights.includes(h.id));

    setHighlights(activeHighlights);

    // Show highlights based on target elements being visible
    const visible: string[] = [];
    activeHighlights.forEach(highlight => {
      if (highlight.target) {
        const element = document.querySelector(highlight.target);
        if (element) {
          visible.push(highlight.id);
        }
      } else {
        visible.push(highlight.id);
      }
    });

    setVisibleHighlights(visible.slice(0, maxVisible));
  }, [enabled, maxVisible, isCompleted]);

  const dismissHighlight = (highlightId: string) => {
    const dismissed = JSON.parse(localStorage.getItem('dismissed-highlights') || '[]');
    dismissed.push(highlightId);
    localStorage.setItem('dismissed-highlights', JSON.stringify(dismissed));

    setVisibleHighlights(prev => prev.filter(id => id !== highlightId));
    setExpandedHighlight(null);
  };

  const dismissAll = () => {
    const allIds = visibleHighlights;
    const dismissed = JSON.parse(localStorage.getItem('dismissed-highlights') || '[]');
    allIds.forEach(id => dismissed.push(id));
    localStorage.setItem('dismissed-highlights', JSON.stringify(dismissed));

    setVisibleHighlights([]);
    setExpandedHighlight(null);
  };

  const getHighlightColor = (type: FeatureHighlight['type']) => {
    switch (type) {
      case 'new':
        return 'bg-green-500';
      case 'enhanced':
        return 'bg-purple-500';
      case 'improved':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHighlightBgColor = (type: FeatureHighlight['type']) => {
    switch (type) {
      case 'new':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'enhanced':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'improved':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (visibleHighlights.length === 0) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-40 space-y-2 max-w-sm sm:max-w-md`}>
      {/* Completion Message */}
      {isCompleted && (
        <div className="w-full p-3 sm:p-4 bg-green-100 border border-green-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-3 text-green-800">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm sm:text-base">Feature Discovery Complete!</div>
              <div className="text-xs sm:text-sm">You've mastered all the features. Highlights will disappear soon.</div>
            </div>
          </div>
        </div>
      )}

      {/* Dismiss All Button */}
      {!isCompleted && visibleHighlights.length > 1 && (
        <button
          onClick={dismissAll}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm text-gray-600 min-h-[44px]"
        >
          <X className="w-4 h-4 sm:w-3 sm:h-3" />
          <span className="hidden sm:inline">Dismiss All ({visibleHighlights.length})</span>
          <span className="sm:hidden">Dismiss All</span>
        </button>
      )}

      {/* Feature Highlights */}
      {visibleHighlights.map(highlightId => {
        const highlight = highlights.find(h => h.id === highlightId);
        if (!highlight) return null;

        const isExpanded = expandedHighlight === highlight.id;

        return (
          <div
            key={highlight.id}
            className={`relative bg-white border rounded-lg shadow-lg transition-all duration-300 ${
              isExpanded ? 'max-h-48 sm:max-h-40' : 'max-h-12 sm:max-h-12'
            } overflow-hidden`}
          >
            {/* Priority Indicator */}
            {highlight.priority === 'high' && (
              <div className="absolute -top-1 -right-1">
                <TrendingUp className="w-4 h-4 text-red-500" />
              </div>
            )}

            {/* Main Content */}
            <div className="p-3 sm:p-3">
              <div className="flex items-start gap-2">
                {/* Icon */}
                <div className={`p-1.5 sm:p-1 rounded-full ${getHighlightColor(highlight.type)} text-white flex-shrink-0`}>
                  <Sparkles className="w-3 h-3 sm:w-3 sm:h-3" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <span className={`text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full ${getHighlightBgColor(highlight.type)}`}>
                      {highlight.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {highlight.category}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {highlight.title}
                  </h4>
                  
                  {isExpanded && (
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {highlight.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpandedHighlight(isExpanded ? null : highlight.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => dismissHighlight(highlight.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Auto-hide Progress Bar */}
            {highlight.autoHide && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                <div 
                  className="h-full bg-blue-500 transition-all ease-linear"
                  style={{
                    animation: `shrink ${highlight.autoHide}ms linear forwards`
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default FeatureHighlights;
