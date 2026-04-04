import React from 'react';
import { RotateCcw } from 'lucide-react';

const ReturnManagement: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <RotateCcw className="h-8 w-8 text-orange-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Return Management</h2>
      </div>
      <div className="bg-white rounded-lg p-8 text-center">
        <RotateCcw className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Return Management</h3>
        <p className="text-gray-500">Process customer returns and refunds</p>
      </div>
    </div>
  );
};

export default ReturnManagement;
