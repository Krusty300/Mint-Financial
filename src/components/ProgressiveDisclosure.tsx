import React, { useState, useEffect, useCallback } from 'react';
import { Lock, ChevronDown, ChevronRight, Star, Zap, Shield } from 'lucide-react';

interface FeatureLevel {
  level: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirements: string[];
  unlockedFeatures: string[];
}


interface ProgressiveDisclosureProps {
  children: React.ReactNode;
  userLevel?: number;
  trackUsage?: boolean;
  showProgress?: boolean;
}

const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  children,
  userLevel = 1,
  trackUsage = true,
  showProgress = true
}) => {
  const [currentLevel, setCurrentLevel] = useState(userLevel);
  const [featureUsage, setFeatureUsage] = useState<Record<string, number>>({});
  const [unlockedFeatures, setUnlockedFeatures] = useState<Set<string>>(new Set());
  const [showLevelUp, setShowLevelUp] = useState(false);

  const featureLevels: FeatureLevel[] = [
    {
      level: 1,
      name: 'Beginner',
      description: 'Essential invoicing features',
      icon: <Star className="w-4 h-4" />,
      requirements: [],
      unlockedFeatures: ['create-invoice', 'edit-invoice', 'delete-invoice', 'basic-preview']
    },
    {
      level: 2,
      name: 'Intermediate',
      description: 'Enhanced productivity tools',
      icon: <Zap className="w-4 h-4" />,
      requirements: ['create-5-invoices', 'use-keyboard-shortcuts'],
      unlockedFeatures: ['keyboard-shortcuts', 'undo-redo', 'drag-drop', 'live-preview']
    },
    {
      level: 3,
      name: 'Advanced',
      description: 'Professional features',
      icon: <Shield className="w-4 h-4" />,
      requirements: ['create-20-invoices', 'use-all-intermediate-features'],
      unlockedFeatures: ['advanced-search', 'bulk-operations', 'custom-templates', 'data-export']
    },
    {
      level: 4,
      name: 'Expert',
      description: 'Power user capabilities',
      icon: <Lock className="w-4 h-4" />,
      requirements: ['create-50-invoices', 'master-all-features'],
      unlockedFeatures: ['api-access', 'advanced-analytics', 'custom-integrations', 'white-label']
    }
  ];

  const trackFeatureUsage = useCallback((featureId: string) => {
    if (!trackUsage) return;

    const newUsage = (featureUsage[featureId] || 0) + 1;
    const newFeatureUsage = { ...featureUsage, [featureId]: newUsage };
    setFeatureUsage(newFeatureUsage);

    // Save to localStorage
    localStorage.setItem('feature-usage', JSON.stringify(newFeatureUsage));

    // Check for level progression
    checkLevelProgression(newFeatureUsage);
  }, [featureUsage, trackUsage]);

  const checkLevelProgression = (usage: Record<string, number>) => {
    const totalUsage = Object.values(usage).reduce((sum, count) => sum + count, 0);
    
    // Simple progression: level up every 10 uses
    const newLevel = Math.min(4, Math.floor(totalUsage / 10) + 1);
    
    if (newLevel > currentLevel) {
      setCurrentLevel(newLevel);
      setShowLevelUp(true);
      
      // Unlock new features
      const newUnlocked = new Set(unlockedFeatures);
      featureLevels[newLevel - 1].unlockedFeatures.forEach(feature => {
        newUnlocked.add(feature);
      });
      setUnlockedFeatures(newUnlocked);
      
      // Save progress
      localStorage.setItem('user-level', newLevel.toString());
      localStorage.setItem('unlocked-features', JSON.stringify(Array.from(newUnlocked)));
      
      // Hide level up notification after 3 seconds
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  };

  const isFeatureUnlocked = (featureId: string, requiredLevel: number) => {
    return currentLevel >= requiredLevel || unlockedFeatures.has(featureId);
  };

  
  // Load saved progress
  useEffect(() => {
    const savedLevel = localStorage.getItem('user-level');
    const savedUsage = localStorage.getItem('feature-usage');
    const savedUnlocked = localStorage.getItem('unlocked-features');

    if (savedLevel) setCurrentLevel(parseInt(savedLevel));
    if (savedUsage) setFeatureUsage(JSON.parse(savedUsage));
    if (savedUnlocked) setUnlockedFeatures(new Set(JSON.parse(savedUnlocked)));
  }, []);

  return (
    <div className="relative">
      {/* Level Up Notification */}
      {showLevelUp && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-bounce">
          <Zap className="w-5 h-5" />
          <div>
            <div className="font-semibold">Level Up!</div>
            <div className="text-sm">You've reached {featureLevels[currentLevel - 1]?.name} level</div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Feature Progress</h3>
            <span className="text-sm text-gray-500">
              Level {currentLevel} - {featureLevels[currentLevel - 1]?.name}
            </span>
          </div>
          
          <div className="flex gap-2 mb-3">
            {featureLevels.map((level, index) => (
              <div
                key={level.level}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  index < currentLevel 
                    ? 'bg-green-500' 
                    : index === currentLevel - 1 
                    ? 'bg-blue-500' 
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {featureLevels.map(level => (
              <div
                key={level.level}
                className={`p-2 rounded-lg border transition-colors ${
                  level.level <= currentLevel
                    ? 'bg-white border-gray-300'
                    : 'bg-gray-100 border-gray-200 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1 rounded ${
                    level.level <= currentLevel ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {level.icon}
                  </div>
                  <span className="text-xs font-medium">
                    {level.level <= currentLevel ? level.name : '???'}
                  </span>
                </div>
                {level.level <= currentLevel && (
                  <p className="text-xs text-gray-600">{level.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Wrapper */}
      <div>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            const featureId = (child.props as any)['data-feature-id'];
            const requiredLevel = (child.props as any)['data-required-level'] || 1;
            const isUnlocked = isFeatureUnlocked(featureId, requiredLevel);

            return (
              <FeatureWrapper
                key={featureId}
                requiredLevel={requiredLevel}
                isUnlocked={isUnlocked}
                onUsage={() => trackFeatureUsage(featureId)}
              >
                {child}
              </FeatureWrapper>
            );
          }
          return child;
        })}
      </div>
    </div>
  );
};

interface FeatureWrapperProps {
  requiredLevel: number;
  isUnlocked: boolean;
  onUsage: () => void;
  children: React.ReactNode;
}

const FeatureWrapper: React.FC<FeatureWrapperProps> = ({
  requiredLevel,
  isUnlocked,
  onUsage,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUsageHint, setShowUsageHint] = useState(false);

  const handleInteraction = () => {
    if (isUnlocked) {
      onUsage();
      setShowUsageHint(true);
      setTimeout(() => setShowUsageHint(false), 1000);
    }
  };

  if (isUnlocked) {
    return (
      <div className="relative">
        <div onClick={handleInteraction} className="relative">
          {children}
          
          {/* Usage Hint */}
          {showUsageHint && (
            <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 rounded text-xs">
              +1 XP
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      
      {/* Locked Overlay */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-10 rounded-lg flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
          <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900 mb-1">
            Feature Locked
          </div>
          <div className="text-xs text-gray-600 mb-2">
            Requires Level {requiredLevel}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {isExpanded ? 'Hide' : 'Show'} Requirements
          </button>
          
          {isExpanded && (
            <div className="mt-2 text-xs text-gray-600 text-left">
              <div className="font-medium mb-1">How to unlock:</div>
              <ul className="space-y-1">
                <li>· Use basic features more</li>
                <li>· Create more invoices</li>
                <li>· Explore current tools</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Higher-order component for wrapping features
export const withProgressiveDisclosure = <P extends object>(
  Component: React.ComponentType<P>,
  featureId: string,
  requiredLevel: number = 1
) => {
  return (props: P) => (
    <div data-feature-id={featureId} data-required-level={requiredLevel}>
      <Component {...props} />
    </div>
  );
};

export default ProgressiveDisclosure;
