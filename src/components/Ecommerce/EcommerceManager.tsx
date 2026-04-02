import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  RotateCcw, 
  Settings, 
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Bell
} from 'lucide-react';
import { useEcommerceStore, useInventoryAlerts } from '../../stores/ecommerceStore';

// Import components
import OrderManagement from './OrderManagement';
import TaxManagement from './TaxManagement';
import ShippingManagement from './ShippingManagement';
import ReturnManagement from './ReturnManagement';
import EcommerceAnalytics from './EcommerceAnalytics';
import EcommerceSettings from './EcommerceSettings';

// Dynamic import for ProductCatalog
let ProductCatalog: React.ComponentType<any>;
try {
  // @ts-ignore
  ProductCatalog = require('./ProductCatalog').default;
} catch (error) {
  console.error('Failed to import ProductCatalog:', error);
  ProductCatalog = () => (
    <div className="p-8 text-center">
      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Product Catalog</h3>
      <p className="text-gray-500">Product catalog is temporarily unavailable</p>
    </div>
  );
}

type TabType = 'products' | 'orders' | 'tax' | 'shipping' | 'returns' | 'analytics' | 'settings';

const EcommerceManager: React.FC = () => {
  const {
    analytics,
    generateAnalytics,
    loadFromLocalStorage
  } = useEcommerceStore();
  
  const inventoryAlerts = useInventoryAlerts();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadFromLocalStorage();
    generateAnalytics();
  }, [loadFromLocalStorage, generateAnalytics]);

  const tabs = [
    { id: 'products' as TabType, label: 'Products', icon: Package, count: 0 },
    { id: 'orders' as TabType, label: 'Orders', icon: ShoppingCart, count: 0 },
    { id: 'tax' as TabType, label: 'Tax', icon: CreditCard, count: 0 },
    { id: 'shipping' as TabType, label: 'Shipping', icon: Truck, count: 0 },
    { id: 'returns' as TabType, label: 'Returns', icon: RotateCcw, count: 0 },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3, count: 0 },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings, count: 0 }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductCatalog />;
      case 'orders':
        return <OrderManagement />;
      case 'tax':
        return <TaxManagement />;
      case 'shipping':
        return <ShippingManagement />;
      case 'returns':
        return <ReturnManagement />;
      case 'analytics':
        return <EcommerceAnalytics />;
      case 'settings':
        return <EcommerceSettings />;
      default:
        return <ProductCatalog />;
    }
  };

  const overviewStats = analytics?.overview || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    cartAbandonmentRate: 0,
    customerLifetimeValue: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">E-commerce Manager</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <Bell className="h-5 w-5" />
                  {inventoryAlerts.length > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Inventory Alerts</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {inventoryAlerts.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No inventory alerts</div>
                      ) : (
                        inventoryAlerts.map((alert, index) => (
                          <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-start">
                              <AlertTriangle className={`h-4 w-4 mt-0.5 mr-2 ${
                                alert.status === 'out_of_stock' ? 'text-red-500' : 'text-yellow-500'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{alert.product.name}</p>
                                <p className="text-xs text-gray-500">
                                  {alert.status === 'out_of_stock' ? 'Out of stock' : 'Low stock'} - 
                                  {alert.currentStock} units (reorder at {alert.reorderLevel})
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${overviewStats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overviewStats.totalOrders.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${overviewStats.averageOrderValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(overviewStats.conversionRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default EcommerceManager;
