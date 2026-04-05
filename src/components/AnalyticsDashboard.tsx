import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle,
  X,
  Plus,
  Bell,
  RefreshCw,
  Eye,
  BarChart3,
  Activity,
  GripVertical,
  Maximize2,
  Minimize2,
  Search
} from 'lucide-react';
import { useInvoiceStore } from '../stores/invoiceStore';

interface Widget {
  id: string;
  type: 'revenue' | 'invoices' | 'clients' | 'alerts' | 'quickActions' | 'recentActivity' | 'paymentStats';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  isMinimized: boolean;
  isExpanded: boolean;
  data?: any;
}

interface Alert {
  id: string;
  type: 'overdue' | 'dueSoon' | 'newClient' | 'highValue' | 'system';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

interface Activity {
  id: string;
  type: 'invoice' | 'payment' | 'client' | 'system';
  title: string;
  description?: string;
  timestamp: Date;
  icon: React.ElementType;
  color: string;
}

export const AnalyticsDashboard: React.FC = () => {
  const { invoices, clients, setCurrentInvoice, loadData } = useInvoiceStore();
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'revenue',
      type: 'revenue',
      title: 'Revenue Overview',
      size: 'large',
      position: { x: 0, y: 0 },
      isMinimized: false,
      isExpanded: false
    },
    {
      id: 'invoices',
      type: 'invoices',
      title: 'Invoice Status',
      size: 'medium',
      position: { x: 1, y: 0 },
      isMinimized: false,
      isExpanded: false
    },
    {
      id: 'clients',
      type: 'clients',
      title: 'Client Metrics',
      size: 'medium',
      position: { x: 2, y: 0 },
      isMinimized: false,
      isExpanded: false
    },
    {
      id: 'alerts',
      type: 'alerts',
      title: 'Alerts Center',
      size: 'medium',
      position: { x: 0, y: 1 },
      isMinimized: false,
      isExpanded: false
    },
    {
      id: 'quickActions',
      type: 'quickActions',
      title: 'Quick Actions',
      size: 'small',
      position: { x: 1, y: 1 },
      isMinimized: false,
      isExpanded: false
    },
    {
      id: 'recentActivity',
      type: 'recentActivity',
      title: 'Recent Activity',
      size: 'medium',
      position: { x: 2, y: 1 },
      isMinimized: false,
      isExpanded: false
    }
  ]);
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);

  // Calculate dashboard metrics
  const metrics = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const outstandingRevenue = totalRevenue - paidRevenue;
    const overdueInvoices = invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      return inv.status !== 'paid' && dueDate < new Date();
    });
    const dueSoonInvoices = invoices.filter(inv => {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() - 3);
      const dueDate = new Date(inv.dueDate);
      return inv.status !== 'paid' && dueDate <= threeDaysFromNow && dueDate >= new Date();
    });
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const paymentRate = totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0;
    const averageInvoiceValue = totalInvoices > 0 ? (totalRevenue / totalInvoices) : 0;
    
    return {
      totalRevenue,
      paidRevenue,
      outstandingRevenue,
      totalInvoices,
      paidInvoices,
      totalClients,
      activeClients,
      paymentRate,
      averageInvoiceValue,
      overdueInvoices,
      dueSoonInvoices
    };
  }, [invoices, clients]);

  // Generate alerts based on data
  useEffect(() => {
    const newAlerts: Alert[] = [];

    // Overdue invoices
    if (metrics.overdueInvoices.length > 0) {
      newAlerts.push({
        id: 'overdue-' + Date.now(),
        type: 'overdue',
        title: 'Overdue Invoices',
        message: `${metrics.overdueInvoices.length} invoice(s) are overdue - Action required!`,
        severity: metrics.overdueInvoices.length > 5 ? 'critical' : 'high',
        timestamp: new Date(),
        isRead: false,
        actionUrl: '/invoices?status=overdue'
      });
    }

    // Due soon invoices
    if (metrics.dueSoonInvoices.length > 0) {
      newAlerts.push({
        id: 'dueSoon-' + Date.now(),
        type: 'dueSoon',
        title: 'Payments Due Soon',
        message: `${metrics.dueSoonInvoices.length} invoice(s) due in next 3 days - Send reminders!`,
        severity: 'medium',
        timestamp: new Date(),
        isRead: false,
        actionUrl: '/invoices?status=dueSoon'
      });
    }

    // High value invoices
    const highValueInvoices = invoices.filter(inv => inv.total > 10000 && inv.status !== 'paid');
    if (highValueInvoices.length > 0) {
      newAlerts.push({
        id: 'highValue-' + Date.now(),
        type: 'highValue',
        title: 'High Value Invoices',
        message: `${highValueInvoices.length} high-value invoice(s) pending - Follow up!`,
        severity: 'medium',
        timestamp: new Date(),
        isRead: false,
        actionUrl: '/invoices?minAmount=10000'
      });
    }

    setAlerts(prev => {
      const updatedAlerts = newAlerts.concat(prev);
      return Array.from(updatedAlerts).slice(0, 50);
    });
  }, [metrics]);

  // Generate recent activities
  useEffect(() => {
    const recentActivities: Activity[] = [];

    // Recent invoices
    const recentInvoices = invoices
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
      .slice(0, 5);

    for (let i = 0; i < recentInvoices.length; i++) {
      const invoice = recentInvoices[i];
      recentActivities.push({
        id: 'inv-' + invoice.id,
        type: 'invoice',
        title: `Invoice ${invoice.invoiceNumber}`,
        description: `Created for ${clients.find(c => c.id === invoice.clientId)?.name || 'Unknown'}`,
        timestamp: new Date(invoice.issueDate),
        icon: FileText,
        color: 'text-blue-600'
      });
    }

    // Recent payments
    const recentPayments = invoices
      .filter(inv => inv.status === 'paid')
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
      .slice(0, 3);

    for (let i = 0; i < recentPayments.length; i++) {
      const invoice = recentPayments[i];
      recentActivities.push({
        id: 'pay-' + invoice.id,
        type: 'payment',
        title: `Payment Received`,
        description: `${invoice.invoiceNumber} - $${invoice.total.toFixed(2)}`,
        timestamp: new Date(invoice.issueDate),
        icon: CheckCircle,
        color: 'text-green-600'
      });
    }

    // Recent clients
    const recentClients = clients
      .slice(0, 3);

    for (let i = 0; i < recentClients.length; i++) {
      const client = recentClients[i];
      recentActivities.push({
        id: 'client-' + client.id,
        type: 'client',
        title: 'New Client',
        description: client.name + (client.company ? ` - ${client.company}` : ''),
        timestamp: new Date(),
        icon: Users,
        color: 'text-purple-600'
      });
    }

    setActivities(recentActivities.slice(0, 10));
  }, [invoices, clients]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadData();
        setLastUpdate(new Date());
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, loadData]);

  // Drag and drop handlers
  const handleDragStart = useCallback((widgetId: string) => {
    setIsDragging(widgetId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    if (!isDragging || isDragging === targetWidgetId) return;

    setWidgets(prev => {
      const draggedWidget = prev.find(w => w.id === isDragging);
      const targetWidget = prev.find(w => w.id === targetWidgetId);
      
      if (!draggedWidget || !targetWidget) return prev;

      return prev.map(widget => {
        if (widget.id === isDragging) {
          return { ...widget, position: targetWidget.position };
        } else if (widget.id === targetWidgetId) {
          return { ...widget, position: draggedWidget.position };
        }
        return widget;
      });
    });

    setIsDragging(null);
  }, [isDragging]);

  const toggleWidgetSize = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(widget => {
      if (widget.id === widgetId) {
        const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
        const currentIndex = sizes.indexOf(widget.size);
        const nextIndex = (currentIndex + 1) % sizes.length;
        return { ...widget, size: sizes[nextIndex] };
      }
      return widget;
    }));
  }, []);

  const toggleWidgetMinimized = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId ? { ...widget, isMinimized: !widget.isMinimized } : widget
    ));
  }, []);

  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Widget renderers
  const renderWidget = (widget: Widget) => {
    const unreadAlerts = alerts.filter(a => !a.isRead).length;

    switch (widget.type) {
      case 'revenue':
        return (
          <div className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
                title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold text-green-900">${metrics.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-700 mt-1">All time</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-blue-800">Outstanding</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">${metrics.outstandingRevenue.toFixed(2)}</p>
                <p className="text-xs text-blue-700 mt-1">{metrics.overdueInvoices.length} overdue</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Payment Rate</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{metrics.paymentRate.toFixed(1)}%</p>
                <p className="text-xs text-purple-700 mt-1">{metrics.paidInvoices} of {metrics.totalInvoices}</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Avg Invoice</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">
                  ${metrics.totalInvoices > 0 ? (metrics.totalRevenue / metrics.totalInvoices).toFixed(0) : '0'}
                </p>
                <p className="text-xs text-orange-700 mt-1">Per invoice</p>
              </div>
            </div>
          </div>
        );

      case 'invoices':
        return (
          <div className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Status</h3>
              <button 
                onClick={() => setCurrentInvoice(null)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Create New Invoice"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Total Invoices</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{metrics.totalInvoices}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Paid</span>
                </div>
                <span className="text-lg font-bold text-green-900">{metrics.paidInvoices}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Pending</span>
                </div>
                <span className="text-lg font-bold text-blue-900">{metrics.totalInvoices - metrics.paidInvoices}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Overdue</span>
                </div>
                <span className="text-lg font-bold text-red-900">{metrics.overdueInvoices.length}</span>
              </div>
            </div>
          </div>
        );

      case 'clients':
        return (
          <div className="p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Metrics</h3>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Total Clients</span>
                </div>
                <span className="text-lg font-bold text-purple-900">{metrics.totalClients}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Active</span>
                </div>
                <span className="text-lg font-bold text-green-900">{metrics.activeClients}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Avg Revenue/Client</span>
                </div>
                <span className="text-lg font-bold text-blue-900">
                  ${metrics.totalClients > 0 ? (metrics.totalRevenue / metrics.totalClients).toFixed(0) : '0'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alerts Center</h3>
              <div className="flex items-center gap-2">
                {unreadAlerts > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    {unreadAlerts}
                  </span>
                )}
                <button
                  onClick={clearAllAlerts}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Clear All Alerts"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No alerts at this time</p>
                </div>
              ) : (
                alerts.slice(0, 5).map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      alert.isRead ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200'
                    }`}
                    onClick={() => markAlertAsRead(alert.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        alert.severity === 'critical' ? 'bg-red-600' :
                        alert.severity === 'high' ? 'bg-orange-600' :
                        alert.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'quickActions':
        return (
          <div className="p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => setCurrentInvoice(null)}
                className="w-full flex items-center gap-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">New Invoice</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/clients'}
                className="w-full flex items-center gap-3 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Add Client</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/invoices'}
                className="w-full flex items-center gap-3 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">View All Invoices</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/clients'}
                className="w-full flex items-center gap-3 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Add Client</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/data'}
                className="w-full flex items-center gap-3 p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Export Data</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/search'}
                className="w-full flex items-center gap-3 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm font-medium">Advanced Search</span>
              </button>
            </div>
          </div>
        );

      case 'recentActivity':
        return (
          <div className="p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            
            <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                activities.map(activity => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${activity.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getWidgetSizeClasses = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1';
      case 'medium': return 'col-span-1 row-span-2 sm:col-span-2 sm:row-span-1';
      case 'large': return 'col-span-1 row-span-2 sm:col-span-2 sm:row-span-2 lg:col-span-3';
      default: return 'col-span-1 row-span-1';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Expert analytics and strategic recommendations
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'text-green-600 animate-spin' : 'text-gray-400'}`} />
              <span className="truncate">Auto-refresh: {autoRefresh ? 'On' : 'Off'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAlertsPanel(!showAlertsPanel)}
                className="relative p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Bell className="w-4 h-4 text-gray-600" />
                {alerts.filter(a => !a.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                    {alerts.filter(a => !a.isRead).length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => loadData()}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Manual Refresh"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Last updated: {lastUpdate.toLocaleString()}
        </div>
      </div>

      {/* Widget Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
          {widgets.map(widget => (
            <div
              key={widget.id}
              className={`
                ${getWidgetSizeClasses(widget.size)}
                bg-white rounded-lg shadow-lg border border-gray-200
                transition-all duration-200 hover:shadow-xl
                ${isDragging === widget.id ? 'opacity-50 scale-95' : ''}
                ${widget.isMinimized ? 'h-16' : 'h-full'}
              `}
              draggable
              onDragStart={() => handleDragStart(widget.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, widget.id)}
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <h4 className="text-sm font-semibold text-gray-900">{widget.title}</h4>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleWidgetSize(widget.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Change Size"
                  >
                    {widget.size === 'large' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => toggleWidgetMinimized(widget.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title={widget.isMinimized ? 'Expand' : 'Minimize'}
                  >
                    {widget.isMinimized ? <Plus className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              
              {/* Widget Content */}
              {!widget.isMinimized && (
                <div className="h-full overflow-hidden">
                  {renderWidget(widget)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Panel */}
      {showAlertsPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Alerts</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAllAlerts}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowAlertsPanel(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No alerts</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        alert.isRead ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200'
                      }`}
                      onClick={() => markAlertAsRead(alert.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          alert.severity === 'critical' ? 'bg-red-600' :
                          alert.severity === 'high' ? 'bg-orange-600' :
                          alert.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1">
                            <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(alert.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
