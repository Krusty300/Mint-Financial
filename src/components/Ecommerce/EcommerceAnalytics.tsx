import React from 'react';
import { BarChart3 } from 'lucide-react';

const EcommerceAnalytics: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="h-8 w-8 text-indigo-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">E-commerce Analytics</h2>
      </div>
      <div className="bg-white rounded-lg p-8 text-center">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
        <p className="text-gray-500">View comprehensive e-commerce metrics and insights</p>
      </div>
    </div>
  );
};

export default EcommerceAnalytics;
