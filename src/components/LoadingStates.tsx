import React from 'react';
import { Loader2, RefreshCw, FileText, Users, BarChart3, Search, Database } from 'lucide-react';

// Skeleton loader component
export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ 
  className = '', 
  style 
}) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={style} />
);

// Card skeleton loader
export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);

// Table skeleton loader
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200">
      <Skeleton className="h-4 col-span-1" />
      <Skeleton className="h-4 col-span-4" />
      <Skeleton className="h-4 col-span-2" />
      <Skeleton className="h-4 col-span-2" />
      <Skeleton className="h-4 col-span-2" />
      <Skeleton className="h-4 col-span-1" />
    </div>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 last:border-b-0">
        <Skeleton className="h-3 col-span-1" />
        <Skeleton className="h-3 col-span-4" />
        <Skeleton className="h-3 col-span-2" />
        <Skeleton className="h-3 col-span-2" />
        <Skeleton className="h-3 col-span-2" />
        <Skeleton className="h-3 col-span-1" />
      </div>
    ))}
  </div>
);

// Chart skeleton loader
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <div className="h-64 flex items-end justify-between space-x-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="flex-1" style={{ height: `${Math.random() * 100 + 20}%` }} />
        ))}
      </div>
    </div>
  </div>
);

// List skeleton loader
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    ))}
  </div>
);

// Spinner component with different sizes
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

// Page loader with context
export const PageLoader: React.FC<{ 
  type?: 'dashboard' | 'invoices' | 'clients' | 'search' | 'data';
  message?: string;
}> = ({ type = 'dashboard', message = 'Loading...' }) => {
  const getIcon = () => {
    switch (type) {
      case 'dashboard': return <BarChart3 className="w-8 h-8 text-blue-600" />;
      case 'invoices': return <FileText className="w-8 h-8 text-blue-600" />;
      case 'clients': return <Users className="w-8 h-8 text-blue-600" />;
      case 'search': return <Search className="w-8 h-8 text-blue-600" />;
      case 'data': return <Database className="w-8 h-8 text-blue-600" />;
      default: return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      {getIcon()}
      <div className="text-center space-y-2">
        <p className="text-gray-600 font-medium">{message}</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

// Inline loading for buttons
export const ButtonLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="flex items-center space-x-2">
    <Spinner size="sm" />
    <span>{text}</span>
  </div>
);

// Progress bar for async operations
export const ProgressBar: React.FC<{ 
  progress?: number; 
  showPercentage?: boolean;
  className?: string;
}> = ({ progress = 0, showPercentage = true, className = '' }) => (
  <div className={`w-full ${className}`}>
    {showPercentage && (
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Progress</span>
        <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
      </div>
    )}
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

// Refresh indicator
export const RefreshIndicator: React.FC<{ isRefreshing?: boolean }> = ({ isRefreshing = false }) => (
  <div className={`transition-transform duration-300 ${isRefreshing ? 'animate-spin' : ''}`}>
    <RefreshCw className="w-5 h-5 text-gray-600" />
  </div>
);

// Loading overlay for modals and sections
export const LoadingOverlay: React.FC<{ 
  isVisible?: boolean;
  message?: string;
  transparent?: boolean;
}> = ({ isVisible = true, message = 'Loading...', transparent = false }) => {
  if (!isVisible) return null;

  return (
    <div className={`absolute inset-0 flex items-center justify-center z-50 ${
      transparent ? 'bg-white bg-opacity-75' : 'bg-white'
    }`}>
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Lazy loading wrapper component
export const LazyLoader: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}> = ({ children, fallback = <PageLoader />, delay = 200 }) => {
  const [showContent, setShowContent] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!showContent) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Error boundary fallback with loading state
export const ErrorLoadingState: React.FC<{
  error?: Error;
  onRetry?: () => void;
}> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-6">
    <div className="text-red-500">
      <FileText className="w-12 h-12" />
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
      <p className="text-gray-600">
        {error?.message || 'An unexpected error occurred while loading this content.'}
      </p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);
