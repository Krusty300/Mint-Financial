import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Zap
} from 'lucide-react';
import { useInvoiceStore } from '../stores/invoiceStore';


const WelcomeDashboard: React.FC = () => {
  const { invoices, clients } = useInvoiceStore();
  const [userName, setUserName] = useState('User');
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({
    invoicesThisWeek: 0,
    totalRevenue: 0,
    newClients: 0,
    pendingPayments: 0
  });

  // Get the App component's state through a custom event system
  const triggerNavigation = (path: string, action?: string) => {
    console.log('Quick Start: triggerNavigation called', { path, action });
    
    // Use a more direct approach with URL parameters
    const url = new URL(window.location.href);
    if (action) {
      url.searchParams.set('action', action);
    } else {
      url.searchParams.delete('action');
    }
    
    const finalUrl = path + url.search;
    console.log('Quick Start: navigating to', finalUrl);
    
    // Navigate to the new URL
    window.history.pushState({}, '', finalUrl);
    
    // Trigger a popstate event to notify the App component
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    console.log('Quick Start: popstate event dispatched');
  };

  // Set personalized greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    const name = localStorage.getItem('user-name') || 'User';
    setUserName(name);
    
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  // Calculate stats
  useEffect(() => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    
    // Calculate weekly stats using real data structure
    const invoicesThisWeek = invoices.filter(invoice => 
      new Date(invoice.issueDate) >= weekStart
    ).length;
    
    const totalRevenue = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    
    const newClients = clients.length;
    const pendingPayments = invoices.filter(invoice => 
      invoice.status === 'sent' || invoice.status === 'overdue'
    ).length;

    setStats({
      invoicesThisWeek,
      totalRevenue,
      newClients,
      pendingPayments
    });
  }, [invoices, clients]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Quick Start Actions
  const quickStartActions = [
    {
      id: 'create-invoice',
      title: 'Create Invoice',
      description: 'Generate professional invoices',
      action: () => triggerNavigation('/invoices', 'new'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'add-client',
      title: 'Add Client',
      description: 'Manage your client database',
      action: () => triggerNavigation('/clients', 'new'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Track business performance',
      action: () => triggerNavigation('/analytics-dashboard'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'search',
      title: 'Search',
      description: 'Find invoices and clients',
      action: () => triggerNavigation('/search'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
      {/* Simple Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-6 sm:px-8 sm:py-8 text-white shadow-lg">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
          {greeting}, {userName}!
        </h1>
        <p className="text-blue-100 text-sm sm:text-base">
          Welcome back! Here's your business overview.
        </p>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Clients</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{clients.length}</p>
            </div>
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Invoices</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">This Week</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.invoicesThisWeek}</p>
            </div>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-white p-3 sm:p-4 shadow-sm border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
          Quick Start
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {quickStartActions.slice(0, 4).map(action => (
            <button
              key={action.id}
              onClick={action.action}
              className={`p-3 sm:p-4 text-white font-medium transition-colors ${action.color}`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {action.id === 'create-invoice' && <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
                {action.id === 'add-client' && <Users className="w-4 h-4 sm:w-5 sm:h-5" />}
                {action.id === 'view-analytics' && <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
                {action.id === 'search' && <Zap className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <div className="text-left">
                <div className="font-medium text-sm sm:text-base">{action.title}</div>
                <div className="text-xs sm:text-sm opacity-90">{action.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboard;
