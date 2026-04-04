import React from 'react';
import { CreditCard } from 'lucide-react';

const TaxManagement: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <CreditCard className="h-8 w-8 text-green-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Tax Management</h2>
      </div>
      <div className="bg-white rounded-lg p-8 text-center">
        <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tax Management</h3>
        <p className="text-gray-500">Configure tax rates for different jurisdictions</p>
      </div>
    </div>
  );
};

export default TaxManagement;
