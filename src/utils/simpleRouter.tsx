// Simple routing utility for the Mint Financial app
import { useState } from 'react';

// Simple navigation that works with the existing app structure
export const navigateToPage = (path: string) => {
  // For dropdown menu items, we need to handle them differently
  // Since we don't have React Router, we'll use a different approach
  
  // Check if this is a dropdown menu item that should be handled by the app
  if (path.startsWith('/client-') || path.startsWith('/ecommerce/')) {
    // For now, we'll use window.location.href but you can enhance this later
    window.location.href = path;
  } else {
    // For regular navigation, use window.location.href
    window.location.href = path;
  }
};

// Enhanced navigation for dropdown menus
export const handleDropdownNavigation = (path: string, setActiveTab?: any) => {
  // For dropdown menu items, we need to set the appropriate tab
  if (path === '/clients' || path.startsWith('/client-')) {
    // Set the clients tab as active
    if (setActiveTab) {
      setActiveTab('clients');
    }
  } else if (path === '/ecommerce' || path.startsWith('/ecommerce/')) {
    // Set the ecommerce tab as active
    if (setActiveTab) {
      setActiveTab('ecommerce');
    }
  }
  
  // Navigate to the path
  window.location.href = path;
};

// For future implementation, you can use React Router
export const useSimpleRouter = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  const navigate = (path: string) => {
    window.location.href = path;
    setCurrentPath(path);
  };
  
  return { currentPath, navigate };
};
