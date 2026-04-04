import React, { useState } from 'react';
import { 
  ChevronDown, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Star,
  ExternalLink,
  UserCheck,
  Activity,
  MessageSquare,
  CreditCard
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const ClientNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: 'Client Manager',
      path: '/clients',
      icon: Users,
      description: 'Manage client information and relationships'
    },
    {
      label: 'Client Dashboard',
      path: '/client-dashboard',
      icon: BarChart3,
      description: 'View client analytics and performance metrics'
    },
    {
      label: 'Client Reports',
      path: '/client-reports',
      icon: TrendingUp,
      description: 'Generate detailed client reports and insights'
    },
    {
      label: 'Client Communications',
      path: '/client-communications',
      icon: MessageSquare,
      description: 'View and manage client interactions'
    },
    {
      label: 'Client Portal Access',
      path: '/client-portal',
      icon: UserCheck,
      description: 'Manage client portal access and permissions'
    },
    {
      label: 'Client Feedback',
      path: '/client-feedback',
      icon: Star,
      description: 'View client feedback and satisfaction ratings'
    },
    {
      label: 'Client Activity Log',
      path: '/client-activity',
      icon: Activity,
      description: 'Track all client activities and interactions'
    },
    {
      label: 'Client Financials',
      path: '/client-financials',
      icon: CreditCard,
      description: 'View client financial history and payments'
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
    // For now, navigate to path using pathname to avoid full page reload
    window.location.pathname = path;
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
        <Users className="h-4 w-4 mr-2" />
        Clients
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
                  <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100 text-blue-600">
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
                Complete client relationship management
              </span>
              <button
                onClick={() => handleNavClick('/clients')}
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

export default ClientNavigation;
