import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Clock, 
  Star,
  Activity,
  DollarSign,
  Zap
} from 'lucide-react';
import { useInvoiceStore } from '../stores/invoiceStore';
import MobileQuickStartCard from './MobileQuickStartCard';

interface QuickStartCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  gradient: string;
}

interface ActivityItem {
  id: string;
  type: 'invoice' | 'client' | 'payment' | 'milestone';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

const WelcomeDashboard: React.FC = () => {
  const { invoices, clients } = useInvoiceStore();
  const [userName, setUserName] = useState('User');
  const [greeting, setGreeting] = useState('');
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
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

  // Calculate stats and recent activity
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

    // Generate recent activity using real data structure
    const activities: ActivityItem[] = [
      ...invoices.slice(0, 3).map(invoice => {
        const client = clients.find(c => c.id === invoice.clientId);
        return {
          id: invoice.id,
          type: 'invoice' as const,
          title: `Invoice #${invoice.invoiceNumber}`,
          description: `Created for ${client?.name || 'Unknown Client'}`,
          time: formatTimeAgo(new Date(invoice.issueDate)),
          icon: <FileText className="w-4 h-4" />,
          color: invoice.status === 'paid' ? 'green' : invoice.status === 'overdue' ? 'red' : 'blue'
        };
      }),
      ...clients.slice(0, 2).map(client => ({
        id: client.id,
        type: 'client' as const,
        title: client.name,
        description: 'Client added to database',
        time: formatTimeAgo(new Date(client.createdAt)),
        icon: <Users className="w-4 h-4" />,
        color: 'green'
      }))
    ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 4);

    setRecentActivity(activities);
  }, [invoices, clients]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Quick Start Cards
  const quickStartCards: QuickStartCard[] = [
    {
      id: 'new-invoice',
      title: 'Create Invoice',
      description: 'Generate a new professional invoice',
      icon: <FileText className="w-6 h-6" />,
      action: () => {
        triggerNavigation('/invoices', 'new');
      },
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'new-client',
      title: 'Add Client',
      description: 'Add a new client to your database',
      icon: <Users className="w-6 h-6" />,
      action: () => {
        triggerNavigation('/clients', 'new');
      },
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'See your business performance insights',
      icon: <TrendingUp className="w-6 h-6" />,
      action: () => {
        triggerNavigation('/analytics-dashboard');
      },
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'search',
      title: 'Search',
      description: 'Find invoices, clients, and more',
      icon: <Zap className="w-6 h-6" />,
      action: () => {
        triggerNavigation('/search');
      },
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-3 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold mb-2">
              {greeting}, {userName}! 
            </h1>
            <p className="text-blue-100 text-sm sm:text-lg">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold">{stats.invoicesThisWeek}</div>
              <div className="text-xs sm:text-sm text-blue-100">Invoices this week</div>
            </div>
          </div>
        </div>
        
        {/* Mobile Swipe Indicator */}
        <div className="flex justify-center sm:hidden mt-2">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Active Clients</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.newClients}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Pending Payments</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">This Week</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.invoicesThisWeek}</p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
              <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Start Cards - Mobile Optimized */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            Quick Start
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickStartCards.map(card => (
              <MobileQuickStartCard
                key={card.id}
                title={card.title}
                description={card.description}
                icon={card.icon}
                action={card.action}
                gradient={card.gradient}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            Recent Activity
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-1.5 sm:p-2 bg-${activity.color}-100 rounded-lg flex-shrink-0`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{activity.title}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <Activity className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                <p className="text-sm sm:text-base">No recent activity</p>
                <p className="text-xs sm:text-sm">Start by creating your first invoice!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Clients Section */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          Top Clients
        </h2>
        <div className="space-y-2 sm:space-y-3">
          {clients.slice(0, 3).map(client => {
            const clientInvoices = invoices.filter(inv => inv.clientId === client.id);
            const clientRevenue = clientInvoices
              .filter(inv => inv.status === 'paid')
              .reduce((sum, inv) => sum + inv.total, 0);
            
            return (
              <div key={client.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm sm:text-base">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{client.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{clientInvoices.length} invoices</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm sm:text-base text-gray-900">{formatCurrency(clientRevenue)}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Total revenue</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips & Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-indigo-200">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
              <Star className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base">Pro Tip</h3>
              <p className="text-gray-700 text-xs sm:text-sm">
                Did you know? You can press <kbd className="px-2 py-1 bg-white rounded text-xs sm:text-sm font-mono">Ctrl+N</kbd> to create a new invoice instantly, 
                or press <kbd className="px-2 py-1 bg-white rounded text-xs sm:text-sm font-mono">?</kbd> to start the feature tour anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default WelcomeDashboard;
