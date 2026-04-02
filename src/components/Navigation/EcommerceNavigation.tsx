import React, { useState } from 'react';
import { 
  ChevronDown, 
  ShoppingCart, 
  Package, 
  FileText, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  BarChart3, 
  Settings,
  ExternalLink
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const EcommerceNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: 'E-commerce Manager',
      path: '/ecommerce',
      icon: ShoppingCart,
      description: 'Main e-commerce dashboard and overview'
    },
    {
      label: 'Product Catalog',
      path: '/ecommerce/products',
      icon: Package,
      description: 'Manage products, inventory, and pricing'
    },
    {
      label: 'Order Management',
      path: '/ecommerce/orders',
      icon: FileText,
      description: 'Process and track customer orders'
    },
    {
      label: 'Tax Configuration',
      path: '/ecommerce/tax',
      icon: CreditCard,
      description: 'Set up tax rates and jurisdictions'
    },
    {
      label: 'Shipping Methods',
      path: '/ecommerce/shipping',
      icon: Truck,
      description: 'Configure shipping options and carriers'
    },
    {
      label: 'Return Management',
      path: '/ecommerce/returns',
      icon: RotateCcw,
      description: 'Handle customer returns and refunds'
    },
    {
      label: 'Analytics Dashboard',
      path: '/ecommerce/analytics',
      icon: BarChart3,
      description: 'View sales reports and business insights'
    },
    {
      label: 'System Settings',
      path: '/ecommerce/settings',
      icon: Settings,
      description: 'Configure e-commerce preferences'
    }
  ];

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (path: string) => {
    // For now, navigate to the path
    // In a real app, you'd want to use React Router or state management
    window.location.href = path;
    setIsOpen(false);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Navigation Button */}
      <button
        onClick={handleClick}
        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        E-commerce
        <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className="flex items-start w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100 text-gray-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item.label}
                    </div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">
                Quick access to all e-commerce features
              </span>
              <button
                onClick={() => handleNavClick('/ecommerce')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcommerceNavigation;
