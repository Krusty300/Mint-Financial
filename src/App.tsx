import React, { useState, useEffect } from 'react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceList } from './components/InvoiceList';
import { ClientManager } from './components/ClientManager';
import { DataManager } from './components/DataManager';
import { Dashboard } from './components/Dashboard';
import { useInvoiceStore } from './stores/invoiceStore';
import type { Client } from './types';
import { FileText, Users, Home, Database, BarChart3, ShoppingCart, Package, Settings, TrendingUp, Star, CheckCircle, Truck, AlertCircle, MessageSquare, Phone, Calendar, UserCheck, Activity, CreditCard, RotateCcw, Menu, X } from 'lucide-react';

type Tab = 'dashboard' | 'invoices' | 'clients' | 'data' | 'ecommerce';

export const App: React.FC = () => {
  const { currentInvoice, setCurrentInvoice, loadData, clients } = useInvoiceStore();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
    
    // Handle URL-based routing for dropdown menu items
    const currentPath = window.location.pathname;
    
    // Set active tab based on current URL
    if (currentPath === '/' || currentPath === '/dashboard') {
      setActiveTab('dashboard');
    } else if (currentPath === '/invoices') {
      setActiveTab('invoices');
    } else if (currentPath === '/clients') {
      setActiveTab('clients');
    } else if (currentPath === '/ecommerce' || currentPath.startsWith('/ecommerce/')) {
      setActiveTab('ecommerce');
    } else if (currentPath === '/data') {
      setActiveTab('data');
    }
    
    // Listen for browser navigation (back/forward buttons)
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '/dashboard') {
        setActiveTab('dashboard');
      } else if (path === '/invoices') {
        setActiveTab('invoices');
      } else if (path === '/clients') {
        setActiveTab('clients');
      } else if (path === '/ecommerce' || path.startsWith('/ecommerce/')) {
        setActiveTab('ecommerce');
      } else if (path === '/data') {
        setActiveTab('data');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loadData]);

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: Home },
    { id: 'invoices' as Tab, label: 'Invoices', icon: FileText },
    { id: 'clients' as Tab, label: 'Clients', icon: Users },
    { id: 'ecommerce' as Tab, label: 'E-commerce', icon: ShoppingCart },
    { id: 'data' as Tab, label: 'Data', icon: Database }
  ];

  const handleTabClick = (tabId: Tab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    // Update browser URL to match the tab
    const path = tabId === 'dashboard' ? '/' : `/${tabId}`;
    window.history.pushState({}, '', path);
  };

  const renderContent = () => {
    if (currentInvoice || isCreatingInvoice) {
      return <InvoiceForm 
        onClose={() => {
          setCurrentInvoice(null);
          setIsCreatingInvoice(false);
        }}
      />;
    }

    // Check for specific dropdown menu items based on URL
    const currentPath = window.location.pathname;
    
    // Handle main navigation paths first to prevent flash
    if (currentPath === '/clients') {
      return <ClientManager />;
    }
    if (currentPath === '/invoices') {
      return <InvoiceList onCreateInvoice={() => setIsCreatingInvoice(true)} />;
    }
    if (currentPath === '/data') {
      return <DataManager />;
    }
    if (currentPath === '/ecommerce') {
      return (
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading E-commerce...</span>
          </div>
        }>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">E-commerce Manager</h2>
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">E-commerce Features</h3>
              <p className="text-gray-500 mb-4">Complete e-commerce management system</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-gray-900">Products</h4>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-gray-900">Orders</h4>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-gray-900">Analytics</h4>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <Settings className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-gray-900">Settings</h4>
                </div>
              </div>
            </div>
          </div>
        </React.Suspense>
      );
    }
    
    // Handle client dropdown menu items
    if (currentPath === '/client-dashboard') {
      const [selectedClientFilter, setSelectedClientFilter] = useState('All Clients');
      const [showReportModal, setShowReportModal] = useState(false);
      const [reportData, setReportData] = useState({
        type: 'summary',
        dateRange: 'last30days',
        format: 'pdf'
      });

      const handleGenerateReport = () => {
        setShowReportModal(true);
      };

      const handleDownloadReport = () => {
        // Simulate report generation and download
        const reportContent = `
          Client Dashboard Report
          =====================
          Generated: ${new Date().toLocaleDateString()}
          Filter: ${selectedClientFilter}
          Date Range: ${reportData.dateRange}
          
          Key Metrics:
          - Active Clients: 48
          - Growth Rate: 23%
          - Engagement: 89%
          - Satisfaction: 4.7/5.0
          
          Top Clients:
          1. John Doe Enterprises - $12,450
          2. Smith & Co - $8,200  
          3. RJohnson LLC - $6,800
          
          Health Metrics:
          - Response Rate: 85%
          - Retention Rate: 92%
          - Satisfaction Rate: 88%
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `client-dashboard-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setShowReportModal(false);
      };

      const handleClientClick = (clientName: string) => {
        alert(`Viewing detailed profile for: ${clientName}\n\nThis would navigate to the client's detailed profile page with:\n- Complete contact information\n- Transaction history\n- Project timeline\n- Communication logs\n- Performance metrics`);
      };

      const handleMetricClick = (metricName: string) => {
        const metricDetails: { [key: string]: string } = {
          'Active Clients': '48 total active clients\n- 35 enterprise clients\n- 13 small business clients\n- 4 new clients this month\n- 89% retention rate',
          'Growth Rate': '23% month-over-month growth\n- 12 new client acquisitions\n- 8 client upgrades\n- 3 client referrals\n- $45,000 increased revenue',
          'Engagement': '89% client engagement score\n- 92% email open rate\n- 78% meeting attendance\n- 85% project completion\n- 4.6/5.0 client satisfaction',
          'Satisfaction': '4.7/5.0 average satisfaction\n- 45 positive reviews\n- 3 neutral reviews\n- 1 negative review\n- 94% would recommend'
        };
        alert(`${metricName} Details:\n\n${metricDetails[metricName]}`);
      };

      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Client Dashboard</h2>
            <div className="flex items-center space-x-3">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedClientFilter}
                onChange={(e) => setSelectedClientFilter(e.target.value)}
              >
                <option>All Clients</option>
                <option>Active Clients</option>
                <option>New Clients</option>
                <option>VIP Clients</option>
              </select>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={handleGenerateReport}
              >
                Generate Report
              </button>
            </div>
          </div>
          
          {/* Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Client Report</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={reportData.type}
                      onChange={(e) => setReportData({...reportData, type: e.target.value})}
                    >
                      <option value="summary">Summary Report</option>
                      <option value="detailed">Detailed Report</option>
                      <option value="financial">Financial Report</option>
                      <option value="performance">Performance Report</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={reportData.dateRange}
                      onChange={(e) => setReportData({...reportData, dateRange: e.target.value})}
                    >
                      <option value="last7days">Last 7 Days</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="last90days">Last 90 Days</option>
                      <option value="thisyear">This Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={reportData.format}
                      onChange={(e) => setReportData({...reportData, format: e.target.value})}
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                      <option value="txt">Text</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    onClick={() => setShowReportModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={handleDownloadReport}
                  >
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleMetricClick('Active Clients')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">48</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Active Clients</h3>
              <p className="text-gray-600 text-sm mb-4">Total active client accounts</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+4 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleMetricClick('Growth Rate')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">23%</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Growth Rate</h3>
              <p className="text-gray-600 text-sm mb-4">Month-over-month client growth</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">Above target</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleMetricClick('Engagement')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">89%</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Engagement</h3>
              <p className="text-gray-600 text-sm mb-4">Client engagement score</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+5% improvement</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleMetricClick('Satisfaction')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">4.7</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Satisfaction</h3>
              <p className="text-gray-600 text-sm mb-4">Average client satisfaction</p>
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-yellow-600">Excellent rating</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Top Performing Clients</h3>
                <select className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="revenue">By Revenue</option>
                  <option value="growth">By Growth</option>
                  <option value="health">By Health</option>
                </select>
              </div>
              <div className="space-y-3">
                {clients.slice(0, 5).map((client: Client, index: number) => {
                  const clientMetrics = {
                    revenue: Math.random() * 15000 + 5000,
                    growth: Math.random() * 40 - 10,
                    healthScore: Math.random() * 30 + 70,
                    invoiceCount: Math.floor(Math.random() * 20) + 5,
                    avgPaymentTime: Math.floor(Math.random() * 30) + 10
                  };
                  
                  const getHealthGrade = (score: number) => {
                    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
                    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
                    if (score >= 70) return { grade: 'B+', color: 'text-yellow-600', bg: 'bg-yellow-100' };
                    if (score >= 60) return { grade: 'B', color: 'text-yellow-600', bg: 'bg-yellow-100' };
                    return { grade: 'C', color: 'text-red-600', bg: 'bg-red-100' };
                  };
                  
                  const health = getHealthGrade(clientMetrics.healthScore);
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                  
                  return (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleClientClick(client.name)}>
                      <div className="flex items-center flex-1">
                        <div className={`w-10 h-10 ${colors[index % colors.length]} rounded-full flex items-center justify-center text-white text-sm font-bold mr-3`}>
                          {client.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900">{client.name}</p>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${health.bg} ${health.color}`}>
                              {health.grade}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                            <div className="flex items-center">
                              <span className="font-medium">${clientMetrics.revenue.toFixed(0)}</span>
                              <span className="ml-1">revenue</span>
                            </div>
                            <div className="flex items-center">
                              <span className={`font-medium ${clientMetrics.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {clientMetrics.growth >= 0 ? '+' : ''}{clientMetrics.growth.toFixed(1)}%
                              </span>
                              <span className="ml-1">growth</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">{clientMetrics.invoiceCount}</span>
                              <span className="ml-1">invoices</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Health Score</span>
                              <span className="font-medium">{clientMetrics.healthScore.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  clientMetrics.healthScore >= 80 ? 'bg-green-500' :
                                  clientMetrics.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{width: `${clientMetrics.healthScore}%`}}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-3 flex flex-col items-center">
                        <button className="text-blue-600 hover:text-blue-800 text-xs mb-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-xs">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All Clients →
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Client Health Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Retention Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">92%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Satisfaction</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '88%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">88%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPath === '/client-reports') {
      const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');
      const [showReportModal, setShowReportModal] = useState(false);
      const [reportData, setReportData] = useState({
        type: 'revenue',
        format: 'pdf',
        includeCharts: true
      });

      const handleExportReport = () => {
        setShowReportModal(true);
      };

      const handleDownloadReport = () => {
        // Simulate report generation and download
        const reportContent = `
          Client Reports Analysis
          ========================
          Generated: ${new Date().toLocaleDateString()}
          Date Range: ${selectedDateRange}
          Report Type: ${reportData.type}
          
          Revenue Analysis:
          - Total Revenue: $24,500
          - Growth: +12% from last month
          - Top Client: John Doe Enterprises ($12,450)
          - Average Revenue per Client: $510.42
          
          Activity Reports:
          - Total Activities: 156
          - Engagement Rate: 89%
          - Response Time: 2.4 hours average
          - Client Interactions: 67
          
          Client Lists:
          - Total Clients: 48
          - Active Clients: 45
          - New Clients: 4
          - VIP Clients: 8
          
          Satisfaction Reports:
          - Overall Satisfaction: 4.8/5.0
          - Positive Reviews: 45
          - Neutral Reviews: 3
          - Negative Reviews: 0
          - Net Promoter Score: 72
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `client-reports-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setShowReportModal(false);
      };

      const handleMetricClick = (metricName: string) => {
        const metricDetails: { [key: string]: string } = {
          'Revenue Reports': '$24,500 total revenue\n- $12,450 from top client\n- 23% month-over-month growth\n- $510.42 average per client\n- 89% collection rate',
          'Activity Reports': '156 total activities\n- 89% engagement rate\n- 2.4 hour response time\n- 67 client interactions\n- 45 meetings completed',
          'Client Lists': '48 total clients\n- 45 currently active\n- 4 new this month\n- 8 VIP clients\n- 92% retention rate',
          'Satisfaction Reports': '4.8/5.0 average rating\n- 45 positive reviews\n- 3 neutral reviews\n- 0 negative reviews\n- 72 Net Promoter Score'
        };
        alert(`${metricName}:\n\n${metricDetails[metricName]}`);
      };

      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Client Reports</h2>
            <div className="flex items-center space-x-3">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
              >
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={handleExportReport}
              >
                Export Report
              </button>
            </div>
          </div>
          
          {/* Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Export Client Reports</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={reportData.type}
                      onChange={(e) => setReportData({...reportData, type: e.target.value})}
                    >
                      <option value="revenue">Revenue Reports</option>
                      <option value="activity">Activity Reports</option>
                      <option value="clients">Client Lists</option>
                      <option value="satisfaction">Satisfaction Reports</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={reportData.format}
                      onChange={(e) => setReportData({...reportData, format: e.target.value})}
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={reportData.includeCharts}
                      onChange={(e) => setReportData({...reportData, includeCharts: e.target.checked})}
                    />
                    <label className="text-sm font-medium text-gray-700">Include Charts & Graphs</label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    onClick={() => setShowReportModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={handleDownloadReport}
                  >
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleMetricClick('Revenue Reports')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">$24,500</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Reports</h3>
              <p className="text-gray-600 text-sm mb-4">Total revenue from all clients</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+12% from last month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleMetricClick('Activity Reports')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">156</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Reports</h3>
              <p className="text-gray-600 text-sm mb-4">Client activities and interactions</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+23 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleMetricClick('Client Lists')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">48</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Client Lists</h3>
              <p className="text-gray-600 text-sm mb-4">Total client database</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+4 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleMetricClick('Satisfaction Reports')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">4.8</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Satisfaction Reports</h3>
              <p className="text-gray-600 text-sm mb-4">Average client satisfaction</p>
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-yellow-600">Excellent rating</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Report Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Monthly Revenue Report</p>
                    <p className="text-xs text-gray-500">Generated 2 hours ago</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Client Activity Summary</p>
                    <p className="text-xs text-gray-500">Generated yesterday</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Satisfaction Survey Results</p>
                    <p className="text-xs text-gray-500">Generated 3 days ago</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPath === '/client-communications') {
      const [selectedCommType, setSelectedCommType] = useState('All Communications');
      const [showNewCommModal, setShowNewCommModal] = useState(false);
      const [commData, setCommData] = useState({
        type: 'email',
        client: '',
        subject: '',
        message: '',
        priority: 'normal'
      });

      const handleNewCommunication = () => {
        setShowNewCommModal(true);
      };

      const handleSendCommunication = () => {
        // Simulate sending communication
        alert(`Communication sent!\n\nType: ${commData.type}\nClient: ${commData.client}\nSubject: ${commData.subject}\nPriority: ${commData.priority}\n\nMessage preview would be sent to client and logged in the system.`);
        setShowNewCommModal(false);
        setCommData({
          type: 'email',
          client: '',
          subject: '',
          message: '',
          priority: 'normal'
        });
      };

      const handleCommClick = (commType: string) => {
        const commDetails: { [key: string]: string } = {
          'Email History': '234 total emails\n- 89% open rate\n- 45 responses pending\n- 156 sent this month\n- 2.4 hour average response time',
          'Call Logs': '156 total calls\n- 89% successful connections\n- 45 follow-up calls scheduled\n- 2.1 hour average call duration\n- 4.5/5.0 average call rating',
          'Meetings': '48 total meetings\n- 89% attendance rate\n- 12 meetings this week\n- 2.5 hour average duration\n- 4.6/5.0 average meeting rating',
          'Notes': '89 total notes\n- 45 client notes\n- 23 project notes\n- 21 follow-up notes\n- 89% notes with action items'
        };
        alert(`${commType}:\n\n${commDetails[commType]}`);
      };

      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Client Communications</h2>
            <div className="flex items-center space-x-3">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCommType}
                onChange={(e) => setSelectedCommType(e.target.value)}
              >
                <option>All Communications</option>
                <option>Emails</option>
                <option>Phone Calls</option>
                <option>Meetings</option>
                <option>Notes</option>
              </select>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={handleNewCommunication}
              >
                New Communication
              </button>
            </div>
          </div>
          
          {/* New Communication Modal */}
          {showNewCommModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">New Communication</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Communication Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={commData.type}
                      onChange={(e) => setCommData({...commData, type: e.target.value})}
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="note">Note</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={commData.client}
                      onChange={(e) => setCommData({...commData, client: e.target.value})}
                    >
                      <option value="">Select Client</option>
                      <option value="john-doe">John Doe Enterprises</option>
                      <option value="smith-co">Smith & Co</option>
                      <option value="rjohnson">RJohnson LLC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={commData.subject}
                      onChange={(e) => setCommData({...commData, subject: e.target.value})}
                      placeholder="Enter subject..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={commData.priority}
                      onChange={(e) => setCommData({...commData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={commData.message}
                      onChange={(e) => setCommData({...commData, message: e.target.value})}
                      rows={4}
                      placeholder="Enter your message..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    onClick={() => setShowNewCommModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={handleSendCommunication}
                  >
                    Send Communication
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCommClick('Email History')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">234</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email History</h3>
              <p className="text-gray-600 text-sm mb-4">Total email communications</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+18 this week</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCommClick('Call Logs')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">156</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Call Logs</h3>
              <p className="text-gray-600 text-sm mb-4">Phone conversations recorded</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+12 this week</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCommClick('Meetings')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">48</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Meetings</h3>
              <p className="text-gray-600 text-sm mb-4">Scheduled and completed meetings</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+6 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCommClick('Notes')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">89</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-600 text-sm mb-4">Client interaction notes</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+24 this month</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Communications</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email: Monthly Report</p>
                      <p className="text-xs text-gray-500">To: John Doe - 2 hours ago</p>
                      <p className="text-xs text-gray-600 mt-1">Attached monthly performance report with...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Call: Project Discussion</p>
                      <p className="text-xs text-gray-500">With: Sarah Miller - Yesterday</p>
                      <p className="text-xs text-gray-600 mt-1">Discussed Q4 project timeline and...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Meeting: Strategy Session</p>
                      <p className="text-xs text-gray-500">With: Executive Team - 3 days ago</p>
                      <p className="text-xs text-gray-600 mt-1">Quarterly strategy planning meeting...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">2.4 hrs avg</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engagement Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '87%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">87%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Follow-up Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '91%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">91%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Satisfaction</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPath === '/client-portal') {
      const [selectedPortalFilter, setSelectedPortalFilter] = useState('All Portals');
      const [showCreatePortalModal, setShowCreatePortalModal] = useState(false);
      const [portalData, setPortalData] = useState({
        client: '',
        portalType: 'standard',
        permissions: 'view',
        expiration: 'none'
      });

      const handleCreatePortal = () => {
        setShowCreatePortalModal(true);
      };

      const handleGeneratePortal = () => {
        // Simulate portal creation
        const portalId = Math.random().toString(36).substr(2, 9);
        alert(`Portal Created Successfully!\n\nPortal ID: ${portalId}\nClient: ${portalData.client}\nType: ${portalData.portalType}\nPermissions: ${portalData.permissions}\nExpiration: ${portalData.expiration}\n\nAccess credentials have been sent to the client email. Portal is now active and ready for use.`);
        setShowCreatePortalModal(false);
        setPortalData({
          client: '',
          portalType: 'standard',
          permissions: 'view',
          expiration: 'none'
        });
      };

      const handlePortalClick = (portalType: string) => {
        const portalDetails: { [key: string]: string } = {
          'Active Portals': '36 active portals\n- 89% uptime this month\n- 45 daily active users\n- 2.4 hour average session time\n- 98% satisfaction rate',
          'User Accounts': '48 total accounts\n- 36 active users\n- 12 pending invitations\n- 89% activation rate\n- 2FA enabled on 92% of accounts',
          'Permissions Set': '89% configured permissions\n- 156 permission rules\n- 23 custom access levels\n- 89% security compliance\n- 0 security incidents this month',
          'Documentation': '156 help documents\n- 45 video tutorials\n- 67 FAQ articles\n- 23 user guides\n- 21 API documentation files'
        };
        alert(`${portalType}:\n\n${portalDetails[portalType]}`);
      };

      const handleActivityClick = (activity: string, client: string) => {
        alert(`Portal Activity Details:\n\nActivity: ${activity}\nClient: ${client}\n\nThis would show detailed activity logs including:\n- Timestamp and duration\n- IP address and location\n- Actions performed\n- Documents accessed\n- Changes made\n- Security events`);
      };

      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Client Portal Access</h2>
            <div className="flex items-center space-x-3">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPortalFilter}
                onChange={(e) => setSelectedPortalFilter(e.target.value)}
              >
                <option>All Portals</option>
                <option>Active Portals</option>
                <option>Inactive Portals</option>
                <option>Pending Access</option>
              </select>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={handleCreatePortal}
              >
                Create Portal
              </button>
            </div>
          </div>
          
          {/* Create Portal Modal */}
          {showCreatePortalModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Client Portal</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={portalData.client}
                      onChange={(e) => setPortalData({...portalData, client: e.target.value})}
                    >
                      <option value="">Select Client</option>
                      <option value="acme-corp">Acme Corp</option>
                      <option value="john-doe">John Doe Enterprises</option>
                      <option value="smith-co">Smith & Co</option>
                      <option value="rjohnson">RJohnson LLC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Portal Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={portalData.portalType}
                      onChange={(e) => setPortalData({...portalData, portalType: e.target.value})}
                    >
                      <option value="standard">Standard Portal</option>
                      <option value="premium">Premium Portal</option>
                      <option value="enterprise">Enterprise Portal</option>
                      <option value="custom">Custom Portal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Permissions</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={portalData.permissions}
                      onChange={(e) => setPortalData({...portalData, permissions: e.target.value})}
                    >
                      <option value="view">View Only</option>
                      <option value="edit">Edit Access</option>
                      <option value="admin">Admin Access</option>
                      <option value="custom">Custom Permissions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Expiration</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={portalData.expiration}
                      onChange={(e) => setPortalData({...portalData, expiration: e.target.value})}
                    >
                      <option value="none">No Expiration</option>
                      <option value="30days">30 Days</option>
                      <option value="90days">90 Days</option>
                      <option value="1year">1 Year</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    onClick={() => setShowCreatePortalModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={handleGeneratePortal}
                  >
                    Create Portal
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePortalClick('Active Portals')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">36</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Active Portals</h3>
              <p className="text-gray-600 text-sm mb-4">Currently active client portals</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+3 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePortalClick('User Accounts')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">48</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">User Accounts</h3>
              <p className="text-gray-600 text-sm mb-4">Total portal user accounts</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+12 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePortalClick('Permissions Set')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">89%</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Permissions Set</h3>
              <p className="text-gray-600 text-sm mb-4">Configured access permissions</p>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">Well configured</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePortalClick('Documentation')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">156</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Documentation</h3>
              <p className="text-gray-600 text-sm mb-4">Help documents available</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+24 this month</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Portal Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleActivityClick('Portal Activated', 'Acme Corp')}>
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Portal Activated</p>
                      <p className="text-xs text-gray-500">Client: Acme Corp - 2 hours ago</p>
                      <p className="text-xs text-gray-600 mt-1">Portal access granted and...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleActivityClick('User Added', 'Tech Solutions')}>
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">User Added</p>
                      <p className="text-xs text-gray-500">Client: Tech Solutions - Yesterday</p>
                      <p className="text-xs text-gray-600 mt-1">New user account created for...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleActivityClick('Permission Updated', 'Global Industries')}>
                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Settings className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Permission Updated</p>
                      <p className="text-xs text-gray-500">Client: Global Industries - 3 days ago</p>
                      <p className="text-xs text-gray-600 mt-1">Access permissions modified...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Portal Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usage Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '76%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">76%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Login Success</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">92%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Support Tickets</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '15%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">3 open</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Session Time</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">12 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPath === '/client-feedback') {
      const [selectedFeedbackFilter, setSelectedFeedbackFilter] = useState('All Feedback');
      const [showFeedbackModal, setShowFeedbackModal] = useState(false);
      const [feedbackData, setFeedbackData] = useState({
        client: '',
        type: 'general',
        priority: 'normal',
        message: ''
      });

      const handleRequestFeedback = () => {
        setShowFeedbackModal(true);
      };

      const handleSendFeedbackRequest = () => {
        // Simulate feedback request
        const requestId = Math.random().toString(36).substr(2, 9);
        alert(`Feedback Request Sent!\n\nRequest ID: ${requestId}\nClient: ${feedbackData.client}\nType: ${feedbackData.type}\nPriority: ${feedbackData.priority}\n\nFeedback request has been sent to the client. They will receive an email with a link to provide their feedback.`);
        setShowFeedbackModal(false);
        setFeedbackData({
          client: '',
          type: 'general',
          priority: 'normal',
          message: ''
        });
      };

      const handleFeedbackClick = (feedbackType: string) => {
        const feedbackDetails: { [key: string]: string } = {
          'Overall Rating': '4.8/5.0 average rating\n- 45 positive reviews\n- 3 neutral reviews\n- 0 negative reviews\n- 94% would recommend\n- 72 Net Promoter Score',
          'Reviews': '156 total reviews\n- 89% response rate\n- 23 reviews this month\n- 4.6/5.0 average rating\n- 2.1 day average response time',
          'Positive Trends': '89% positive feedback\n- 5% improvement from last month\n- 12% increase in positive reviews\n- 3% decrease in negative feedback\n- 95% client satisfaction',
          'Analytics': '67 feedback insights\n- 23 satisfaction trends\n- 12 improvement areas\n- 18 client suggestions\n- 14 performance metrics'
        };
        alert(`${feedbackType}:\n\n${feedbackDetails[feedbackType]}`);
      };

      const handleFeedbackItemClick = (feedback: string, client: string, rating: number) => {
        alert(`Feedback Details:\n\nFeedback: ${feedback}\nClient: ${client}\nRating: ${rating}/5\n\nThis would show:\n- Full feedback text\n- Client contact information\n- Response history\n- Follow-up actions\n- Related projects\n- Resolution status`);
      };

      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Client Feedback</h2>
            <div className="flex items-center space-x-3">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedFeedbackFilter}
                onChange={(e) => setSelectedFeedbackFilter(e.target.value)}
              >
                <option>All Feedback</option>
                <option>Recent</option>
                <option>High Priority</option>
                <option>Resolved</option>
              </select>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={handleRequestFeedback}
              >
                Request Feedback
              </button>
            </div>
          </div>
          
          {/* Request Feedback Modal */}
          {showFeedbackModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Request Client Feedback</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={feedbackData.client}
                      onChange={(e) => setFeedbackData({...feedbackData, client: e.target.value})}
                    >
                      <option value="">Select Client</option>
                      <option value="tech-solutions">Tech Solutions</option>
                      <option value="acme-corp">Acme Corp</option>
                      <option value="john-doe">John Doe Enterprises</option>
                      <option value="smith-co">Smith & Co</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={feedbackData.type}
                      onChange={(e) => setFeedbackData({...feedbackData, type: e.target.value})}
                    >
                      <option value="general">General Feedback</option>
                      <option value="service">Service Quality</option>
                      <option value="product">Product Feedback</option>
                      <option value="support">Customer Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={feedbackData.priority}
                      onChange={(e) => setFeedbackData({...feedbackData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Personal Message</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={feedbackData.message}
                      onChange={(e) => setFeedbackData({...feedbackData, message: e.target.value})}
                      rows={4}
                      placeholder="Add a personal message to the client..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    onClick={() => setShowFeedbackModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={handleSendFeedbackRequest}
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFeedbackClick('Overall Rating')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">4.8</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Rating</h3>
              <p className="text-gray-600 text-sm mb-4">Average client satisfaction score</p>
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-yellow-600">Excellent rating</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFeedbackClick('Reviews')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">156</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reviews</h3>
              <p className="text-gray-600 text-sm mb-4">Total client reviews received</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+23 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFeedbackClick('Positive Trends')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">89%</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Positive Trends</h3>
              <p className="text-gray-600 text-sm mb-4">Positive feedback percentage</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+5% improvement</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFeedbackClick('Analytics')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">67</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm mb-4">Feedback analytics insights</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+12 insights</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Feedback</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleFeedbackItemClick('Excellent Service!', 'Tech Solutions', 5)}>
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Excellent Service!</p>
                      <p className="text-xs text-gray-500">Client: Tech Solutions - 2 days ago</p>
                      <p className="text-xs text-gray-600 mt-1">The team was very responsive and professional...</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 1, 1, 1, 1].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">5.0</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleFeedbackItemClick('Great Experience', 'Global Industries', 4)}>
                  <div className="flex items-start">
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Great Experience</p>
                      <p className="text-xs text-gray-500">Client: Global Industries - 3 days ago</p>
                      <p className="text-xs text-gray-600 mt-1">Very satisfied with the service...</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 1, 1, 1, 0].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">4.0</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleFeedbackItemClick('Needs Improvement', 'Startup Ventures', 3)}>
                  <div className="flex items-start">
                    <div className="p-2 bg-red-100 rounded-lg mr-3">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Needs Improvement</p>
                      <p className="text-xs text-gray-500">Client: Startup Ventures - 1 week ago</p>
                      <p className="text-xs text-gray-600 mt-1">Response time could be improved...</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 1, 1, 1, 0].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">3.0</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">94%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Positive Feedback</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '89%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">89%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Action Taken</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '76%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">76%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Net Promoter Score</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '72%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">72</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPath === '/client-activity') {
      const [selectedActivityFilter, setSelectedActivityFilter] = useState('All Activities');
      const [showExportModal, setShowExportModal] = useState(false);
      const [exportData, setExportData] = useState({
        dateRange: 'last30days',
        format: 'csv',
        includeDetails: true
      });

      const handleExportLog = () => {
        setShowExportModal(true);
      };

      const handleDownloadLog = () => {
        // Simulate activity log export
        const logContent = `
          Client Activity Log Export
          ========================
          Generated: ${new Date().toLocaleDateString()}
          Date Range: ${exportData.dateRange}
          Format: ${exportData.format}
          Include Details: ${exportData.includeDetails}
          
          Activity Summary:
          - Total Activities: 342
          - Recent Activity: +28 today
          - Timeline Events: 89
          - Activity Logs: 156
          - Client Interactions: 67
          
          Recent Activities:
          1. Login Attempt - John Doe - 2 hours ago
          2. Document Download - Sarah Miller - 3 hours ago
          3. Profile Update - Acme Corp - 5 hours ago
          4. Meeting Scheduled - Tech Solutions - 1 day ago
          5. Report Generated - Global Industries - 2 days ago
        `;
        
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `client-activity-log-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setShowExportModal(false);
      };

      const handleActivityClick = (activityType: string) => {
        const activityDetails: { [key: string]: string } = {
          'Recent Activity': '342 total activities\n- 28 activities today\n- 156 this week\n- 89% completion rate\n- 2.4 hour average duration',
          'Timeline Events': '89 total events\n- 45 scheduled events\n- 23 completed events\n- 21 pending events\n- 89% on-time completion',
          'Activity Logs': '156 detailed logs\n- 89 system logs\n- 45 user logs\n- 22 error logs\n- 98% successful operations',
          'Interactions': '67 total interactions\n- 45 client interactions\n- 12 team interactions\n- 10 automated interactions\n- 89% satisfaction rate'
        };
        alert(`${activityType}:\n\n${activityDetails[activityType]}`);
      };

      const handleActivityItemClick = (activity: string, client: string, time: string) => {
        alert(`Activity Details:\n\nActivity: ${activity}\nClient: ${client}\nTime: ${time}\n\nThis would show:\n- Full activity details\n- IP address and location\n- Device information\n- Session duration\n- Related actions\n- Security events\n- Performance metrics`);
      };

      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Client Activity Log</h2>
            <div className="flex items-center space-x-3">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedActivityFilter}
                onChange={(e) => setSelectedActivityFilter(e.target.value)}
              >
                <option>All Activities</option>
                <option>Recent</option>
                <option>Important</option>
                <option>By Client</option>
              </select>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={handleExportLog}
              >
                Export Log
              </button>
            </div>
          </div>
          
          {/* Export Log Modal */}
          {showExportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Export Activity Log</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={exportData.dateRange}
                      onChange={(e) => setExportData({...exportData, dateRange: e.target.value})}
                    >
                      <option value="last7days">Last 7 Days</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="last90days">Last 90 Days</option>
                      <option value="thisyear">This Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={exportData.format}
                      onChange={(e) => setExportData({...exportData, format: e.target.value})}
                    >
                      <option value="csv">CSV</option>
                      <option value="excel">Excel</option>
                      <option value="json">JSON</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={exportData.includeDetails}
                      onChange={(e) => setExportData({...exportData, includeDetails: e.target.checked})}
                    />
                    <label className="text-sm font-medium text-gray-700">Include Detailed Information</label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    onClick={() => setShowExportModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={handleDownloadLog}
                  >
                    Download Log
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleActivityClick('Recent Activity')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">342</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Recent Activity</h3>
              <p className="text-gray-600 text-sm mb-4">Total activities recorded</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+28 today</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleActivityClick('Timeline Events')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">89</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline Events</h3>
              <p className="text-gray-600 text-sm mb-4">Scheduled and completed events</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+6 this week</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleActivityClick('Activity Logs')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">156</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Logs</h3>
              <p className="text-gray-600 text-sm mb-4">Detailed activity logs</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+12 this week</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleActivityClick('Interactions')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">67</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Interactions</h3>
              <p className="text-gray-600 text-sm mb-4">Client interactions</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+15 this month</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleActivityItemClick('Login Attempt', 'John Doe', '2 hours ago')}>
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Login Attempt</p>
                      <p className="text-xs text-gray-500">Client: John Doe - 2 hours ago</p>
                      <p className="text-xs text-gray-600 mt-1">Successful login from IP: 192.168.1.100</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleActivityItemClick('Meeting Scheduled', 'Acme Corp', '3 hours ago')}>
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Meeting Scheduled</p>
                      <p className="text-xs text-gray-500">Client: Acme Corp - 3 hours ago</p>
                      <p className="text-xs text-gray-600 mt-1">Q4 planning session scheduled...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleActivityItemClick('Document Shared', 'Tech Solutions', 'Yesterday')}>
                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Document Shared</p>
                      <p className="text-xs text-gray-500">Client: Tech Solutions - Yesterday</p>
                      <p className="text-xs text-gray-600 mt-1">Monthly report document...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleActivityItemClick('Note Added', 'Global Industries', '1 day ago')}>
                  <div className="flex items-start">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                      <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Note Added</p>
                      <p className="text-xs text-gray-500">Client: Global Industries - 1 day ago</p>
                      <p className="text-xs text-gray-600 mt-1">Follow-up call completed...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Daily Average Activities</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">11.4 per day</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Peak Hours</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">2-4 PM</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engagement Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '82%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">82%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Client Response Time</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">1.2 hrs avg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPath === '/client-financials') {
      const [selectedFinancialFilter, setSelectedFinancialFilter] = useState('All Financials');
      const [showReportModal, setShowReportModal] = useState(false);
      const [reportData, setReportData] = useState({
        reportType: 'comprehensive',
        dateRange: 'last30days',
        format: 'pdf',
        includeCharts: true
      });

      const handleFinancialReport = () => {
        setShowReportModal(true);
      };

      const handleGenerateReport = () => {
        // Simulate financial report generation
        const reportContent = `
          Client Financial Report
          =====================
          Generated: ${new Date().toLocaleDateString()}
          Report Type: ${reportData.reportType}
          Date Range: ${reportData.dateRange}
          Format: ${reportData.format}
          Include Charts: ${reportData.includeCharts}
          
          Financial Summary:
          - Payment History: $89,450 total payments
          - Invoices: 156 total client invoices
          - Revenue: $124,800 total revenue
          - Growth: 34% revenue growth rate
          
          Payment Details:
          - Total Received: $89,450
          - Pending Payments: $12,340
          - Overdue Payments: $3,450
          - Average Payment: $573.38
          
          Invoice Details:
          - Total Invoices: 156
          - Paid Invoices: 134
          - Pending Invoices: 22
          - Average Invoice: $800.00
          
          Revenue Analysis:
          - Total Revenue: $124,800
          - Monthly Average: $41,600
          - Quarterly Growth: 23%
          - Year-on-Year: 34%
          
          Growth Metrics:
          - Revenue Growth: 34% above target
          - Client Growth: 23% increase
          - Payment Rate: 86% on-time
          - Retention: 92% client retention
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `client-financial-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setShowReportModal(false);
      };

      const handleFinancialClick = (financialType: string) => {
        const financialDetails: { [key: string]: string } = {
          'Payment History': '$89,450 total payments\n- $12,340 pending payments\n- $3,450 overdue payments\n- $573.38 average payment\n- 86% on-time payment rate',
          'Invoices': '156 total invoices\n- 134 paid invoices\n- 22 pending invoices\n- $800.00 average invoice\n- 86% collection rate',
          'Revenue': '$124,800 total revenue\n- $41,600 monthly average\n- 23% quarterly growth\n- 34% year-on-year growth\n- 92% client retention',
          'Growth': '34% revenue growth rate\n- 23% above target\n- 12% client growth\n- 89% payment efficiency\n- 95% satisfaction rate'
        };
        alert(`${financialType}:\n\n${financialDetails[financialType]}`);
      };

      const handleFinancialItemClick = (transaction: string, client: string, amount: string) => {
        alert(`Financial Transaction Details:\n\nTransaction: ${transaction}\nClient: ${client}\nAmount: ${amount}\n\nThis would show:\n- Full transaction details\n- Payment method and date\n- Invoice information\n- Client contact details\n- Payment status\n- Follow-up actions\n- Related transactions`);
      };

      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Client Financials</h2>
            <div className="flex items-center space-x-3">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedFinancialFilter}
                onChange={(e) => setSelectedFinancialFilter(e.target.value)}
              >
                <option>All Financials</option>
                <option>Revenue</option>
                <option>Payments</option>
                <option>Invoices</option>
                <option>Growth</option>
              </select>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={handleFinancialReport}
              >
                Financial Report
              </button>
            </div>
          </div>
          
          {/* Financial Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Financial Report</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={reportData.reportType}
                      onChange={(e) => setReportData({...reportData, reportType: e.target.value})}
                    >
                      <option value="comprehensive">Comprehensive Report</option>
                      <option value="revenue">Revenue Analysis</option>
                      <option value="payments">Payment Analysis</option>
                      <option value="invoices">Invoice Analysis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={reportData.dateRange}
                      onChange={(e) => setReportData({...reportData, dateRange: e.target.value})}
                    >
                      <option value="last7days">Last 7 Days</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="last90days">Last 90 Days</option>
                      <option value="thisyear">This Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={reportData.format}
                      onChange={(e) => setReportData({...reportData, format: e.target.value})}
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={reportData.includeCharts}
                      onChange={(e) => setReportData({...reportData, includeCharts: e.target.checked})}
                    />
                    <label className="text-sm font-medium text-gray-700">Include Charts & Graphs</label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    onClick={() => setShowReportModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={handleGenerateReport}
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFinancialClick('Payment History')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">$89,450</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payment History</h3>
              <p className="text-gray-600 text-sm mb-4">Total payments received</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+18% this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFinancialClick('Invoices')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">156</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Invoices</h3>
              <p className="text-gray-600 text-sm mb-4">Total client invoices</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+12 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFinancialClick('Revenue')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">$124,800</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue</h3>
              <p className="text-gray-600 text-sm mb-4">Total revenue from clients</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+23% this quarter</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFinancialClick('Growth')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">34%</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Growth</h3>
              <p className="text-gray-600 text-sm mb-4">Revenue growth rate</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">Above target</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Financial Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleFinancialItemClick('Payment Received', 'Acme Corp', '$4,500')}>
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payment Received</p>
                      <p className="text-xs text-gray-500">Client: Acme Corp - 2 hours ago</p>
                      <p className="text-xs text-gray-600 mt-1">Invoice #1234 - $4,500 paid via wire transfer</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleFinancialItemClick('Invoice Sent', 'Tech Solutions', '$2,800')}>
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Invoice Sent</p>
                      <p className="text-xs text-gray-500">Client: Tech Solutions - Yesterday</p>
                      <p className="text-xs text-gray-600 mt-1">Invoice #1235 - $2,800 for consulting services</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleFinancialItemClick('Revenue Milestone', 'Global Industries', '$50,000')}>
                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Revenue Milestone</p>
                      <p className="text-xs text-gray-500">Client: Global Industries - 3 days ago</p>
                      <p className="text-xs text-gray-600 mt-1">Reached $50,000 annual revenue milestone</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Success Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">94%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Order Value</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">$800</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Collection Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '88%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">88%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue Growth</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '72%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">34% YOY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Handle ecommerce dropdown menu items
    if (currentPath === '/ecommerce/products') {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
            <div className="flex items-center space-x-3">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Products</option>
                <option>In Stock</option>
                <option>Out of Stock</option>
                <option>Featured</option>
                <option>On Sale</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Add Product
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">234</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Product List</h3>
              <p className="text-gray-600 text-sm mb-4">Total products in catalog</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+12 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">89%</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory</h3>
              <p className="text-gray-600 text-sm mb-4">Products in stock</p>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">Well stocked</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">$45.80</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pricing</h3>
              <p className="text-gray-600 text-sm mb-4">Average product price</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+8% increase</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">12</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Categories</h3>
              <p className="text-gray-600 text-sm mb-4">Product categories</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+2 new</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3">
                      PR
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Premium Widget</p>
                      <p className="text-xs text-gray-500">156 sold - $89.99 each</p>
                      <p className="text-xs text-gray-600 mt-1">High demand product with...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3">
                      PL
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pro License</p>
                      <p className="text-xs text-gray-500">98 sold - $199.99 each</p>
                      <p className="text-xs text-gray-600 mt-1">Professional software...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3">
                      ST
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Standard Tool</p>
                      <p className="text-xs text-gray-500">67 sold - $45.99 each</p>
                      <p className="text-xs text-gray-600 mt-1">Essential business tool...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock Levels</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '89%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">89%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Low Stock Alert</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '15%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">3 items</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Out of Stock</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: '8%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">2 items</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reorder Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '76%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">76%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPath === '/ecommerce/orders') {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            <div className="flex items-center space-x-3">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Orders</option>
                <option>Pending</option>
                <option>Processing</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Create Order
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">45</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Orders</h3>
              <p className="text-gray-600 text-sm mb-4">Orders awaiting processing</p>
              <div className="flex items-center text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-yellow-600">Needs attention</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">234</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Completed</h3>
              <p className="text-gray-600 text-sm mb-4">Successfully fulfilled orders</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+18 this week</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">67</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping</h3>
              <p className="text-gray-600 text-sm mb-4">Orders in transit</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+12 this week</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">8</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Issues</h3>
              <p className="text-gray-600 text-sm mb-4">Orders with problems</p>
              <div className="flex items-center text-sm">
                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">Requires action</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <FileText className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #1234</p>
                      <p className="text-xs text-gray-500">Customer: John Doe - 2 hours ago</p>
                      <p className="text-xs text-gray-600 mt-1">Premium Widget x2 - $179.98 - Pending payment</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #1235</p>
                      <p className="text-xs text-gray-500">Customer: Sarah Miller - Yesterday</p>
                      <p className="text-xs text-gray-600 mt-1">Pro License - $199.99 - Completed</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Truck className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #1236</p>
                      <p className="text-xs text-gray-500">Customer: Acme Corp - 3 days ago</p>
                      <p className="text-xs text-gray-600 mt-1">Standard Tool x5 - $229.95 - In transit</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Track Package</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order Value</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '82%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">$124.50 avg</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Processing Time</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">1.8 days avg</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '91%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">91%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer Satisfaction</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">4.7/5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPath === '/ecommerce/tax') {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tax Configuration</h2>
            <div className="flex items-center space-x-3">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Tax Settings</option>
                <option>Sales Tax</option>
                <option>VAT</option>
                <option>Custom Tax</option>
                <option>Exemptions</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Add Tax Rate
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">8.5%</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tax Rates</h3>
              <p className="text-gray-600 text-sm mb-4">Average tax rate applied</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+0.5% this year</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">12</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Jurisdictions</h3>
              <p className="text-gray-600 text-sm mb-4">Tax jurisdictions configured</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+2 new</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">24</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tax Classes</h3>
              <p className="text-gray-600 text-sm mb-4">Product tax categories</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+4 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">98%</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance</h3>
              <p className="text-gray-600 text-sm mb-4">Tax compliance rate</p>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">Excellent</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Configuration</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">State Sales Tax</p>
                      <p className="text-xs text-gray-500">California - 2 weeks ago</p>
                      <p className="text-xs text-gray-600 mt-1">8.25% rate - Standard sales tax...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">VAT Configuration</p>
                      <p className="text-xs text-gray-500">EU Region - 1 month ago</p>
                      <p className="text-xs text-gray-600 mt-1">20% VAT rate - European Union...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Digital Goods Tax</p>
                      <p className="text-xs text-gray-500">Digital Products - 3 days ago</p>
                      <p className="text-xs text-gray-600 mt-1">5% rate - Digital services...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Analytics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tax Collected</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '76%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">$45,680</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tax Filed</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '89%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">98% on time</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Exemptions</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '12%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">156 items</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Audit Score</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">94/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPath === '/ecommerce/shipping') {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shipping Methods</h2>
            <div className="flex items-center space-x-3">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Shipping</option>
                <option>Domestic</option>
                <option>International</option>
                <option>Express</option>
                <option>Economy</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Add Carrier
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">8</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Carriers</h3>
              <p className="text-gray-600 text-sm mb-4">Active shipping carriers</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+2 new</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">$12.50</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Rates</h3>
              <p className="text-gray-600 text-sm mb-4">Average shipping cost</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+8% increase</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">2.3 days</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tracking</h3>
              <p className="text-gray-600 text-sm mb-4">Average delivery time</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">-0.5 days</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">15</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Zones</h3>
              <p className="text-gray-600 text-sm mb-4">Shipping zones configured</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+3 new</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Carriers</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Truck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">FedEx Express</p>
                      <p className="text-xs text-gray-500">Priority overnight - 2 days ago</p>
                      <p className="text-xs text-gray-600 mt-1">Express shipping with tracking...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Manage</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Truck className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">UPS Ground</p>
                      <p className="text-xs text-gray-500">Standard delivery - 1 week ago</p>
                      <p className="text-xs text-gray-600 mt-1">Economy shipping option...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Manage</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Truck className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">DHL International</p>
                      <p className="text-xs text-gray-500">Global shipping - 2 weeks ago</p>
                      <p className="text-xs text-gray-600 mt-1">International delivery...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Manage</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Analytics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">On-Time Delivery</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">92%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Package Damage</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '3%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">3%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer Satisfaction</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '88%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">4.4/5.0</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cost Efficiency</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '76%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">76%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPath === '/ecommerce/returns') {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Return Management</h2>
            <div className="flex items-center space-x-3">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Returns</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Completed</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Process Return
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <RotateCcw className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">23</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Return Requests</h3>
              <p className="text-gray-600 text-sm mb-4">Total return requests</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-yellow-600">+5 this week</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">45</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Approved</h3>
              <p className="text-gray-600 text-sm mb-4">Returns approved for processing</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+12 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">$8,450</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Refunds</h3>
              <p className="text-gray-600 text-sm mb-4">Total refunds processed</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+$3,200 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">3</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Issues</h3>
              <p className="text-gray-600 text-sm mb-4">Returns with problems</p>
              <div className="flex items-center text-sm">
                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">Requires attention</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Returns</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <RotateCcw className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Return Request #1001</p>
                      <p className="text-xs text-gray-500">Customer: John Doe - 2 hours ago</p>
                      <p className="text-xs text-gray-600 mt-1">Premium Widget - Wrong size - Pending review</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Review</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Return Request #1002</p>
                      <p className="text-xs text-gray-500">Customer: Sarah Miller - Yesterday</p>
                      <p className="text-xs text-gray-600 mt-1">Pro License - Defective product - Approved</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Process</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-red-100 rounded-lg mr-3">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Return Request #1003</p>
                      <p className="text-xs text-gray-500">Customer: Acme Corp - 3 days ago</p>
                      <p className="text-xs text-gray-600 mt-1">Standard Tool - Damaged packaging - Rejected</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Review</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Return Analytics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Return Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '12%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">12%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Processing Time</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">3.2 days avg</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Refund Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '89%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">89%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer Satisfaction</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">4.2/5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPath === '/ecommerce/analytics') {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <div className="flex items-center space-x-3">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Analytics</option>
                <option>Sales Reports</option>
                <option>Customer Analytics</option>
                <option>Product Analytics</option>
                <option>Revenue Analytics</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Export Report
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">$45,680</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Reports</h3>
              <p className="text-gray-600 text-sm mb-4">Total sales revenue</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+23% this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">$124,800</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue</h3>
              <p className="text-gray-600 text-sm mb-4">Total revenue from sales</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+34% this year</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">1,234</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Customers</h3>
              <p className="text-gray-600 text-sm mb-4">Active customers</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+45 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">67</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Products</h3>
              <p className="text-gray-600 text-sm mb-4">Products sold</p>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">+12 this month</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Performance</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Monthly Sales</p>
                      <p className="text-xs text-gray-500">March 2024 - $45,680</p>
                      <p className="text-xs text-gray-600 mt-1">Up 23% from last month...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Quarterly Revenue</p>
                      <p className="text-xs text-gray-500">Q1 2024 - $124,800</p>
                      <p className="text-xs text-gray-600 mt-1">Up 34% from last year...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Customer Growth</p>
                      <p className="text-xs text-gray-500">March 2024 - 1,234 customers</p>
                      <p className="text-xs text-gray-600 mt-1">Up 45 from last month...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '76%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">3.4%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Order Value</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">$89.50</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer Retention</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '82%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">82%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue Growth</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '72%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">34% YOY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPath === '/ecommerce/settings') {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
            <div className="flex items-center space-x-3">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Settings</option>
                <option>General</option>
                <option>Payments</option>
                <option>Shipping</option>
                <option>Notifications</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Save Changes
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">12</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">General</h3>
              <p className="text-gray-600 text-sm mb-4">General configuration settings</p>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">Configured</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">8</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payments</h3>
              <p className="text-gray-600 text-sm mb-4">Payment gateway settings</p>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">Active</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">15</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping</h3>
              <p className="text-gray-600 text-sm mb-4">Shipping configuration</p>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">Optimized</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">24</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications</h3>
              <p className="text-gray-600 text-sm mb-4">Email notification settings</p>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">Enabled</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration Status</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Settings className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Store Settings</p>
                      <p className="text-xs text-gray-500">Last updated: 2 days ago</p>
                      <p className="text-xs text-gray-600 mt-1">Store name, currency, timezone...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Configure</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payment Gateways</p>
                      <p className="text-xs text-gray-500">Last updated: 1 week ago</p>
                      <p className="text-xs text-gray-600 mt-1">Stripe, PayPal, Apple Pay...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Configure</button>
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Truck className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Shipping Zones</p>
                      <p className="text-xs text-gray-500">Last updated: 3 days ago</p>
                      <p className="text-xs text-gray-600 mt-1">Domestic, international zones...</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Configure</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Status</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '98%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Response Time</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">120ms</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Health</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Optimal</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Security Score</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">94/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default to dashboard for any other paths
    return <Dashboard />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Mint Financial</h1>
            </div>
            
            {/* Desktop Navigation */}
            {!currentInvoice && !isCreatingInvoice && (
              <div className="hidden sm:flex items-center space-x-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Mobile menu button */}
            {!currentInvoice && !isCreatingInvoice && (
              <div className="sm:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            )}
            
            {/* Invoice form close button */}
            {(currentInvoice || isCreatingInvoice) && (
              <div className="sm:hidden">
                <button
                  onClick={() => {
                    setCurrentInvoice(null);
                    setIsCreatingInvoice(false);
                  }}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile Navigation Menu */}
          {!currentInvoice && !isCreatingInvoice && isMobileMenuOpen && (
            <div className="sm:hidden border-t border-gray-200">
              <div className="py-2 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`flex items-center gap-3 w-full px-3 py-2 text-base font-medium transition-colors rounded-lg ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="py-4 sm:py-8">
        {renderContent()}
      </main>
    </div>
  );
};
