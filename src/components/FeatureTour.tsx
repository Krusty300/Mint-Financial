import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, Play, Pause } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for target element
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // Function to execute when step is shown
  skipable?: boolean;
  feature?: string;
  isNew?: boolean;
  isEnhanced?: boolean;
}

interface FeatureTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onStart?: () => void;
  autoStart?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
}

const FeatureTour: React.FC<FeatureTourProps> = ({
  isOpen,
  onClose,
  onComplete,
  onStart,
  autoStart = false,
  showProgress = true,
  allowSkip = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const tourRef = useRef<HTMLDivElement>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Enhanced Mint Financial!',
      content: 'Let\'s take a quick tour of the powerful new features that will transform your invoicing experience.',
      position: 'center',
      feature: 'general',
      isNew: true
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Lightning Fast Keyboard Shortcuts',
      content: 'Press Ctrl+N to create a new invoice, Ctrl+S to save, Ctrl+Z to undo. Press "?" anytime to see all shortcuts!',
      target: '.keyboard-shortcuts-help',
      position: 'bottom',
      action: () => {
        // Highlight keyboard shortcuts help button
        const helpBtn = document.querySelector('.keyboard-shortcuts-help') as HTMLElement;
        if (helpBtn) {
          helpBtn.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50');
          setTimeout(() => {
            helpBtn.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50');
          }, 2000);
        }
      },
      feature: 'keyboard',
      isNew: true
    },
    {
      id: 'undo-redo',
      title: 'Powerful Undo/Redo System',
      content: 'Made a mistake? No problem! Use Ctrl+Z to undo and Ctrl+Y to redo. Track up to 50 actions with detailed history.',
      target: '.undo-redo-toolbar',
      position: 'top',
      action: () => {
        // Highlight undo/redo toolbar
        const toolbar = document.querySelector('.undo-redo-toolbar') as HTMLElement;
        if (toolbar) {
          toolbar.classList.add('ring-4', 'ring-purple-400', 'ring-opacity-50');
          setTimeout(() => {
            toolbar.classList.remove('ring-4', 'ring-purple-400', 'ring-opacity-50');
          }, 2000);
        }
      },
      feature: 'undo',
      isNew: true
    },
    {
      id: 'drag-drop',
      title: 'Drag & Drop Invoice Items',
      content: 'Easily reorder invoice items by dragging them. Works on both desktop and mobile devices with touch support!',
      target: '.draggable-invoice-items',
      position: 'left',
      action: () => {
        // Highlight draggable items area
        const dragArea = document.querySelector('.draggable-invoice-items') as HTMLElement;
        if (dragArea) {
          dragArea.classList.add('ring-4', 'ring-green-400', 'ring-opacity-50');
          setTimeout(() => {
            dragArea.classList.remove('ring-4', 'ring-green-400', 'ring-opacity-50');
          }, 2000);
        }
      },
      feature: 'dragdrop',
      isEnhanced: true
    },
    {
      id: 'live-preview',
      title: 'Live Invoice Preview',
      content: 'See your changes in real-time! The live preview updates instantly as you edit your invoice.',
      target: '.live-preview-section',
      position: 'right',
      action: () => {
        // Highlight live preview section
        const preview = document.querySelector('.live-preview-section') as HTMLElement;
        if (preview) {
          preview.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50');
          setTimeout(() => {
            preview.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50');
          }, 2000);
        }
      },
      feature: 'preview',
      isNew: true
    },
    {
      id: 'template-switching',
      title: 'Multiple Invoice Templates',
      content: 'Choose from Classic, Modern, or Minimal templates. Switch instantly without losing your data!',
      target: '.template-selector',
      position: 'bottom',
      feature: 'templates',
      isEnhanced: true
    },
    {
      id: 'dark-mode',
      title: 'Dark Mode Support',
      content: 'Work comfortably in any lighting. Toggle between light and dark themes in the preview.',
      target: '.dark-mode-toggle',
      position: 'top',
      feature: 'themes',
      isNew: true
    },
    {
      id: 'mobile-responsive',
      title: 'Mobile-Optimized Experience',
      content: 'Full mobile support with touch-friendly controls, larger touch targets, and responsive design.',
      position: 'center',
      feature: 'mobile',
      isEnhanced: true
    },
    {
      id: 'loading-states',
      title: 'Smart Loading Indicators',
      content: 'Never wonder if something is happening. See real-time feedback for all operations with beautiful loading states.',
      position: 'center',
      feature: 'loading',
      isNew: true
    },
    {
      id: 'advanced-search',
      title: 'Powerful Search & Filters',
      content: 'Find anything instantly with advanced search, filters, and smart suggestions. Press "/" to focus search.',
      target: '.advanced-search',
      position: 'bottom',
      feature: 'search',
      isEnhanced: true
    },
    {
      id: 'completion',
      title: 'You\'re All Set!',
      content: 'You\'ve seen all the major enhancements. Start exploring and enjoy your improved invoicing experience!',
      position: 'center',
      feature: 'general'
    }
  ];

  useEffect(() => {
    if (isOpen && currentStep < tourSteps.length) {
      const step = tourSteps[currentStep];
      
      // Execute step action
      if (step.action) {
        setTimeout(() => step.action!(), 300);
      }

      // Highlight target element
      if (step.target) {
        const element = document.querySelector(step.target) as HTMLElement;
        setHighlightedElement(element);
        
        // Scroll element into view if needed
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setHighlightedElement(null);
      }
    }
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (autoStart && isOpen) {
      setIsPlaying(true);
      onStart?.();
    }
  }, [autoStart, isOpen, onStart]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onClose();
    onComplete?.();
    // Mark tour as completed in localStorage
    localStorage.setItem('feature-tour-completed', 'true');
  };

  const skipTour = () => {
    handleComplete();
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentTourStep = tourSteps[currentStep];

  if (!isOpen || !currentTourStep) return null;

  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Highlighted Element Overlay */}
      {highlightedElement && (
        <div
          className="absolute z-40 pointer-events-none"
          style={{
            top: highlightedElement.offsetTop - 8,
            left: highlightedElement.offsetLeft - 8,
            width: highlightedElement.offsetWidth + 16,
            height: highlightedElement.offsetHeight + 16,
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.3)'
          }}
        />
      )}

      {/* Tour Content */}
      <div
        ref={tourRef}
        className={`fixed z-50 bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 sm:mx-auto ${
          currentTourStep.position === 'center' 
            ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
            : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
        }`}
      >
        {/* Progress Bar */}
        {showProgress && (
          <div className="h-1 bg-gray-200 rounded-t-xl overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Tour Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                  {currentTourStep.title}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {currentTourStep.isNew && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      NEW!
                    </span>
                  )}
                  {currentTourStep.isEnhanced && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      ENHANCED!
                    </span>
                  )}
                </div>
              </div>
              {showProgress && (
                <p className="text-sm text-gray-500">
                  Step {currentStep + 1} of {tourSteps.length}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 sm:p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors min-h-[44px] min-w-[44px] sm:min-h-[auto] sm:min-w-[auto]"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Tour Content */}
        <div className="p-4 sm:p-6">
          <p className="text-gray-700 leading-relaxed">
            {currentTourStep.content}
          </p>
        </div>

        {/* Tour Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {/* Mobile Layout */}
          <div className="sm:hidden space-y-3">
            <div className="flex items-center justify-between">
              {allowSkip && (
                <button
                  onClick={skipTour}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2 min-h-[44px] min-w-[44px]"
                >
                  Skip Tour
                </button>
              )}
              
              {tourSteps.length > 1 && (
                <button
                  onClick={togglePlay}
                  className="p-3 text-gray-600 hover:text-gray-900 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                  title={isPlaying ? 'Pause Auto-Play' : 'Start Auto-Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 rounded-lg transition-colors min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="sm:hidden">Back</span>
                  <span className="hidden sm:inline">Previous</span>
                </button>
              )}

              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
              >
                {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < tourSteps.length - 1 && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              )}
              
              {allowSkip && (
                <button
                  onClick={skipTour}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip Tour
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {tourSteps.length > 1 && (
                <button
                  onClick={togglePlay}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                  title={isPlaying ? 'Pause Auto-Play' : 'Start Auto-Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              )}

              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < tourSteps.length - 1 && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeatureTour;
