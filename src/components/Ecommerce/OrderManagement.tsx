import React from 'react';
import { ShoppingCart } from 'lucide-react';

const OrderManagement: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <ShoppingCart className="h-8 w-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
      </div>
      <div className="bg-white rounded-lg p-8 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Order Management</h3>
        <p className="text-gray-500">Manage and track your orders from creation to delivery</p>
      </div>
    </div>
  );
};

export default OrderManagement;
