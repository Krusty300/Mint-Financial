import React from 'react';
import { Truck } from 'lucide-react';

const ShippingManagement: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Truck className="h-8 w-8 text-purple-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Shipping Management</h2>
      </div>
      <div className="bg-white rounded-lg p-8 text-center">
        <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping Management</h3>
        <p className="text-gray-500">Configure shipping methods and carrier integrations</p>
      </div>
    </div>
  );
};

export default ShippingManagement;
