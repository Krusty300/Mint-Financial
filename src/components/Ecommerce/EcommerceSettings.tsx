import React from 'react';
import { Settings } from 'lucide-react';

const EcommerceSettings: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Settings className="h-8 w-8 text-gray-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">E-commerce Settings</h2>
      </div>
      <div className="bg-white rounded-lg p-8 text-center">
        <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
        <p className="text-gray-500">Configure e-commerce preferences and system settings</p>
      </div>
    </div>
  );
};

export default EcommerceSettings;
