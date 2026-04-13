import React from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { LoadingOverlay } from './LoadingStates';

export const GlobalLoadingIndicator: React.FC = () => {
  const { isAnyLoading } = useLoading();

  return (
    <LoadingOverlay 
      isVisible={isAnyLoading()} 
      message="Loading..."
      transparent={true}
    />
  );
};
