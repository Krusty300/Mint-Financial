import React, { useMemo, useState, useCallback, useRef } from 'react';
import { 
  FileText, 
  Users, 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  CreditCard,
  HelpCircle,
  Download,
  Filter,
  RefreshCw,
  Image,
  File,
  Plus,
  Send,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar
} from 'recharts';
import type { Invoice } from '../types';
import { useInvoiceStore } from '../stores/invoiceStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const Dashboard: React.FC = () => {
  const { invoices, clients, loadData } = useInvoiceStore();
  const [dateRange, setDateRange] = useState<'all' | '30days' | '90days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [activityPage, setActivityPage] = useState(1);
  const [dueDatesPage, setDueDatesPage] = useState(1);
  const itemsPerPage = 5;
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Auto-refresh effect
  React.useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Actually refresh the data by calling the store's loadData function
      loadData();
      setLastUpdated(new Date()); // Update the last updated timestamp
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  // Initial data load and update last updated
  React.useEffect(() => {
    loadData();
    setLastUpdated(new Date());
  }, [loadData]);

  // Export functions
  const exportAsImage = async () => {
    if (!dashboardRef.current) return;
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `dashboard-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error exporting dashboard as image:', error);
      alert('Failed to export dashboard as image. Please try again.');
    }
  };

  const exportAsPDF = async () => {
    if (!dashboardRef.current) return;
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 297; // A4 width in mm (landscape)
      const pageHeight = 210; // A4 height in mm (landscape)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error exporting dashboard as PDF:', error);
      alert('Failed to export dashboard as PDF. Please try again.');
    }
  };

  // Filter invoices based on date range
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }
    
    const endDate = customEndDate ? new Date(customEndDate) : now;
    
    return invoices.filter(inv => {
      const invDate = new Date(inv.issueDate);
      return invDate >= startDate && invDate <= endDate;
    });
  }, [invoices, dateRange, customStartDate, customEndDate]);

  // Calculate statistics with filtered data
  const stats = useMemo(() => {
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidRevenue = filteredInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const outstandingRevenue = filteredInvoices
      .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);

    const statusBreakdown = filteredInvoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalInvoices: filteredInvoices.length,
      totalClients: clients.length,
      totalRevenue,
      paidRevenue,
      outstandingRevenue,
      statusBreakdown
    };
  }, [filteredInvoices, clients]);

  // Revenue trend data (last 6 months)
  const revenueTrend = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthRevenue = filteredInvoices
        .filter(inv => {
          const invDate = new Date(inv.issueDate);
          return invDate.getMonth() === month.getMonth() && 
                 invDate.getFullYear() === month.getFullYear();
        })
        .reduce((sum, inv) => sum + inv.total, 0);
      
      months.push({
        month: monthName,
        revenue: monthRevenue
      });
    }
    
    return months;
  }, [filteredInvoices]);

  // Client distribution data
  const clientDistribution = useMemo(() => {
    const clientCounts = filteredInvoices.reduce((acc, inv) => {
      acc[inv.clientId] = (acc[inv.clientId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(clientCounts)
      .map(([clientId, count]) => {
        const client = clients.find(c => c.id === clientId);
        return {
          name: client?.name || 'Unknown',
          value: count
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 clients
  }, [filteredInvoices, clients]);

  // Gauge chart data for KPIs
  const gaugeData = useMemo(() => {
    const paidRate = stats.totalInvoices > 0 ? (stats.statusBreakdown.paid || 0) / stats.totalInvoices * 100 : 0;
    const overdueRate = stats.totalInvoices > 0 ? (stats.statusBreakdown.overdue || 0) / stats.totalInvoices * 100 : 0;
    
    return [
      {
        name: 'Paid Rate',
        value: Math.round(paidRate),
        fill: '#10b981'
      },
      {
        name: 'Overdue Rate', 
        value: Math.round(overdueRate),
        fill: '#ef4444'
      }
    ];
  }, [stats]);

  // Quick action handlers
  const handleCreateInvoice = () => {
    window.location.href = '/invoices?action=new';
  };

  const handleSendReminder = () => {
    const overdueInvoices = filteredInvoices.filter(inv => inv.status === 'overdue');
    if (overdueInvoices.length === 0) {
      alert('No overdue invoices to send reminders for.');
      return;
    }
    alert(`Would send reminders for ${overdueInvoices.length} overdue invoices.`);
  };

  // Status chart data
  const statusChartData = useMemo(() => {
    const colors = {
      draft: '#94a3b8',
      sent: '#3b82f6', 
      paid: '#10b981',
      overdue: '#ef4444'
    };

    return Object.entries(stats.statusBreakdown).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: colors[status as keyof typeof colors]
    }));
  }, [stats.statusBreakdown]);

  // Recent activity with pagination
  const recentActivity = useMemo(() => {
    const allActivity = filteredInvoices
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
      .map(invoice => {
        const client = clients.find(c => c.id === invoice.clientId);
        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientName: client?.name || 'Unknown Client',
          amount: invoice.total,
          status: invoice.status,
          date: invoice.issueDate,
          dueDate: invoice.dueDate
        };
      });
    
    const startIndex = (activityPage - 1) * itemsPerPage;
    return allActivity.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInvoices, clients, activityPage]);

  // Upcoming due dates with pagination
  const upcomingDueDates = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const allDueDates = filteredInvoices
      .filter(inv => 
        (inv.status === 'sent' || inv.status === 'draft') &&
        new Date(inv.dueDate) >= now &&
        new Date(inv.dueDate) <= thirtyDaysFromNow
      )
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .map(invoice => {
        const client = clients.find(c => c.id === invoice.clientId);
        const daysUntilDue = Math.ceil(
          (new Date(invoice.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientName: client?.name || 'Unknown Client',
          amount: invoice.total,
          dueDate: invoice.dueDate,
          daysUntilDue,
          isOverdue: daysUntilDue < 0
        };
      });
    
    const startIndex = (dueDatesPage - 1) * itemsPerPage;
    return allDueDates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInvoices, clients, dueDatesPage]);

  // Calculate total pages for pagination
  const totalActivityPages = Math.ceil(
    filteredInvoices.length / itemsPerPage
  );
  
  const totalDueDatesPages = Math.ceil(
    filteredInvoices.filter(inv => {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return (inv.status === 'sent' || inv.status === 'draft') &&
        new Date(inv.dueDate) >= now &&
        new Date(inv.dueDate) <= thirtyDaysFromNow;
    }).length / itemsPerPage
  );

  // Interactive chart click handlers
  const handleChartClick = useCallback((chartType: string) => {
    // Handle chart click logic here
    console.log(`Chart clicked: ${chartType}`);
    
    if (chartType === 'client-distribution') {
      // Get detailed client information
      const clientDetails = clients.map(client => {
        const clientInvoices = invoices.filter(inv => inv.clientId === client.id);
        const totalRevenue = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const paidInvoices = clientInvoices.filter(inv => inv.status === 'paid');
        const outstandingInvoices = clientInvoices.filter(inv => inv.status !== 'paid');
        
        return {
          ...client,
          invoiceCount: clientInvoices.length,
          totalRevenue,
          paidRevenue: paidInvoices.reduce((sum, inv) => sum + inv.total, 0),
          outstandingRevenue: outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0),
          averageInvoiceValue: clientInvoices.length > 0 ? totalRevenue / clientInvoices.length : 0,
          lastInvoiceDate: clientInvoices.length > 0 ? 
            new Date(Math.max(...clientInvoices.map(inv => inv.issueDate.getTime()))) : null,
          paymentRate: clientInvoices.length > 0 ? (paidInvoices.length / clientInvoices.length) * 100 : 0
        };
      }).sort((a, b) => b.totalRevenue - a.totalRevenue);
      
      setDrillDownData({
        type: 'client-distribution',
        title: 'Client Distribution Details',
        subtitle: 'Detailed analysis of client performance',
        data: clientDetails,
        summary: {
          totalClients: clients.length,
          activeClients: clientDetails.filter(c => c.invoiceCount > 0).length,
          totalRevenue: clientDetails.reduce((sum, c) => sum + c.totalRevenue, 0),
          averageRevenuePerClient: clients.length > 0 ? 
            clientDetails.reduce((sum, c) => sum + c.totalRevenue, 0) / clients.length : 0
        }
      });
      setShowDrillDown(true);
    } else if (chartType === 'revenue-trend') {
      // Revenue trend drill-down
      const monthlyData = revenueTrend.map(month => {
        const monthInvoices = invoices.filter(inv => {
          const invDate = new Date(inv.issueDate);
          return invDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === month.month;
        });
        
        return {
          ...month,
          invoiceCount: monthInvoices.length,
          averageInvoiceValue: monthInvoices.length > 0 ? month.revenue / monthInvoices.length : 0,
          paidRevenue: monthInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
          outstandingRevenue: monthInvoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total, 0)
        };
      });
      
      setDrillDownData({
        type: 'revenue-trend',
        title: 'Revenue Trend Analysis',
        subtitle: 'Monthly revenue breakdown and performance metrics',
        data: monthlyData,
        summary: {
          totalRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0),
          totalInvoices: monthlyData.reduce((sum, m) => sum + m.invoiceCount, 0),
          averageMonthlyRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.length,
          growthRate: monthlyData.length > 1 ? 
            ((monthlyData[monthlyData.length - 1].revenue - monthlyData[0].revenue) / monthlyData[0].revenue) * 100 : 0
        }
      });
      setShowDrillDown(true);
    } else if (chartType === 'status-breakdown') {
      // Status breakdown drill-down
      const statusDetails = statusChartData.map(status => {
        const statusInvoices = invoices.filter(inv => inv.status === status.name.toLowerCase());
        const totalRevenue = statusInvoices.reduce((sum, inv) => sum + inv.total, 0);
        
        return {
          ...status,
          invoiceCount: statusInvoices.length,
          totalRevenue,
          averageInvoiceValue: statusInvoices.length > 0 ? totalRevenue / statusInvoices.length : 0,
          oldestInvoice: statusInvoices.length > 0 ? 
            new Date(Math.min(...statusInvoices.map(inv => inv.issueDate.getTime()))) : null,
          newestInvoice: statusInvoices.length > 0 ? 
            new Date(Math.max(...statusInvoices.map(inv => inv.issueDate.getTime()))) : null
        };
      });
      
      setDrillDownData({
        type: 'status-breakdown',
        title: 'Invoice Status Analysis',
        subtitle: 'Detailed breakdown of invoice statuses',
        data: statusDetails,
        summary: {
          totalInvoices: invoices.length,
          totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
          paidPercentage: (invoices.filter(inv => inv.status === 'paid').length / invoices.length) * 100,
          outstandingRevenue: invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total, 0)
        }
      });
      setShowDrillDown(true);
    }
  }, [clients, invoices, revenueTrend, statusChartData]);

  // Export dashboard as image (placeholder for future implementation)
  // const exportDashboard = useCallback(() => {
  //   // This would require html2canvas or similar library
  //   alert('Dashboard export feature coming soon! This will export the current dashboard view as an image or PDF.');
  // }, []);

  // KPI calculations
  const kpiMetrics = useMemo(() => {
    const monthlyTarget = 50000; // More realistic target for a business
    const currentMonthRevenue = revenueTrend[revenueTrend.length - 1]?.revenue || 0;
    const previousMonthRevenue = revenueTrend[revenueTrend.length - 2]?.revenue || 0;
    
    return {
      revenueTarget: monthlyTarget,
      currentMonthRevenue,
      previousMonthRevenue,
      revenueGrowth: previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100) : 0,
      isTargetMet: currentMonthRevenue >= monthlyTarget,
      outstandingPercentage: stats.totalRevenue > 0 ? (stats.outstandingRevenue / stats.totalRevenue) * 100 : 0
    };
  }, [revenueTrend, stats]);

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'sent':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'draft':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'viewed':
        return <Eye className="w-4 h-4 text-purple-500" />;
      case 'partial':
        return <CreditCard className="w-4 h-4 text-orange-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleActivityClick = (invoiceId: string) => {
    // Navigate to invoice details
    window.location.href = `/invoices?id=${invoiceId}`;
  };

  const handleDueDateClick = (invoiceId: string) => {
    // Navigate to invoice details
    window.location.href = `/invoices?id=${invoiceId}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div ref={dashboardRef} className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Enhanced Header with Controls */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
            <span>Last updated: {formatDate(lastUpdated)}</span>
            {autoRefresh && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="text-green-600">Auto-refresh</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="text-sm border-0 focus:ring-0 bg-transparent flex-1 min-w-0"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                placeholder="Start date"
              />
              <span className="text-gray-500 text-sm">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                placeholder="End date"
              />
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                loadData();
                setLastUpdated(new Date());
              }}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">🔄</span>
            </button>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700 border-green-300' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''} flex-shrink-0`} />
              <span className="hidden sm:inline">{autoRefresh ? 'Auto' : 'Manual'}</span>
              <span className="sm:hidden">{autoRefresh ? '🔄' : '⏸'}</span>
            </button>
            
            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">📊</span>
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <button
                      onClick={exportAsImage}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Image className="w-4 h-4 flex-shrink-0" />
                      <span>Export as Image</span>
                    </button>
                    <button
                      onClick={exportAsPDF}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <File className="w-4 h-4 flex-shrink-0" />
                      <span>Export as PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Alerts */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Revenue Target Alert */}
        <div className={`p-3 sm:p-4 rounded-lg border-2 ${
          kpiMetrics.isTargetMet 
            ? 'bg-green-50 border-green-300' 
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">Revenue Target</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {formatCurrency(kpiMetrics.revenueTarget)}
              </p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
              kpiMetrics.isTargetMet 
                ? 'bg-green-600 text-white' 
                : 'bg-yellow-600 text-white'
            }`}>
              {kpiMetrics.isTargetMet ? '✓' : '⚠'}
            </div>
          </div>
        </div>
        
        {/* Revenue Growth Alert */}
        <div className={`p-3 sm:p-4 rounded-lg border-2 ${
          kpiMetrics.revenueGrowth >= 0 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">Growth Rate</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {kpiMetrics.revenueGrowth.toFixed(1)}%
              </p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
              kpiMetrics.revenueGrowth >= 0 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}>
              {kpiMetrics.revenueGrowth >= 0 ? '↑' : '↓'}
            </div>
          </div>
        </div>
        
        {/* Outstanding Revenue Alert */}
        <div className={`p-3 sm:p-4 rounded-lg border-2 ${
          kpiMetrics.outstandingPercentage <= 20 
            ? 'bg-green-50 border-green-300' 
            : kpiMetrics.outstandingPercentage <= 50 
            ? 'bg-yellow-50 border-yellow-300'
            : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">Outstanding</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {kpiMetrics.outstandingPercentage.toFixed(1)}%
              </p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
              kpiMetrics.outstandingPercentage <= 20 
                ? 'bg-green-600 text-white' 
                : kpiMetrics.outstandingPercentage <= 50 
                ? 'bg-yellow-600 text-white'
                : 'bg-red-600 text-white'
            }`}>
              {kpiMetrics.outstandingPercentage <= 20 ? '✓' : kpiMetrics.outstandingPercentage <= 50 ? '!' : '⚠'}
            </div>
          </div>
        </div>
        
        {/* Auto-Refresh Status */}
        <div className={`p-3 sm:p-4 rounded-lg border-2 ${
          autoRefresh 
            ? 'bg-blue-50 border-blue-300' 
            : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">Auto-Refresh</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {autoRefresh ? 'Active' : 'Off'}
              </p>
              <p className="text-xs text-gray-500 truncate mt-1">
                Last: {formatDate(lastUpdated)}
              </p>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2 py-1 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex-shrink-0 ${
                autoRefresh 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {autoRefresh ? 'Pause' : 'Start'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalInvoices}</p>
            </div>
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalClients}</p>
            </div>
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{formatCurrency(stats.outstandingRevenue)}</p>
            </div>
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-500 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Gauge Charts for KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        {gaugeData.map((gauge, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h4 className="text-sm font-medium text-gray-600 mb-3 text-center">{gauge.name}</h4>
            <ResponsiveContainer width="100%" height={120}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[gauge]}>
                <RadialBar 
                  dataKey="value" 
                  cornerRadius={10} 
                  fill={gauge.fill}
                  background={{ fill: '#f3f4f6' }}
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-center text-lg font-bold mt-2" style={{ color: gauge.fill }}>
              {gauge.value}%
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={handleCreateInvoice}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Create Invoice</span>
          </button>
          <button
            onClick={handleSendReminder}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Send Reminders</span>
          </button>
          <button
            onClick={() => window.location.href = '/data?action=export'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export Report</span>
          </button>
          <button
            onClick={() => window.location.href = '/analytics-dashboard'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">View Analytics</span>
          </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Revenue Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
                onClick={() => handleChartClick('revenue-trend')}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Invoice Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                onClick={() => handleChartClick('status-breakdown')}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Client Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Top 5 Clients by Invoice Count</h3>
        <div className="overflow-x-auto">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={clientDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill="#10b981"
                onClick={() => handleChartClick('client-distribution')}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity and Due Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">No recent activity</p>
            ) : (
              recentActivity.map(activity => (
                <div 
                  key={activity.id} 
                  onClick={() => handleActivityClick(activity.id)}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(activity.status)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{activity.invoiceNumber}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.clientName}</p>
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="font-medium text-gray-900 text-sm">{formatCurrency(activity.amount)}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination for Recent Activity */}
          {totalActivityPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setActivityPage(prev => Math.max(1, prev - 1))}
                disabled={activityPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {activityPage} of {totalActivityPages}
              </span>
              <button
                onClick={() => setActivityPage(prev => Math.min(totalActivityPages, prev + 1))}
                disabled={activityPage === totalActivityPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Due Dates */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Upcoming Due Dates</h3>
          <div className="space-y-3">
            {upcomingDueDates.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">No upcoming due dates</p>
            ) : (
              upcomingDueDates.map(due => (
                <div 
                  key={due.id} 
                  onClick={() => handleDueDateClick(due.id)}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg gap-2 cursor-pointer transition-colors ${
                    due.isOverdue ? 'bg-red-50 hover:bg-red-100' : 'bg-yellow-50 hover:bg-yellow-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-4 h-4 ${due.isOverdue ? 'text-red-500' : 'text-yellow-500'} flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{due.invoiceNumber}</p>
                      <p className="text-sm text-gray-600 truncate">{due.clientName}</p>
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="font-medium text-gray-900 text-sm">{formatCurrency(due.amount)}</p>
                    <p className={`text-xs ${due.isOverdue ? 'text-red-600' : 'text-yellow-600'}`}>
                      {due.isOverdue ? `${Math.abs(due.daysUntilDue)} days overdue` : `Due in ${due.daysUntilDue} days`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination for Upcoming Due Dates */}
          {totalDueDatesPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setDueDatesPage(prev => Math.max(1, prev - 1))}
                disabled={dueDatesPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {dueDatesPage} of {totalDueDatesPages}
              </span>
              <button
                onClick={() => setDueDatesPage(prev => Math.min(totalDueDatesPages, prev + 1))}
                disabled={dueDatesPage === totalDueDatesPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drill-Down Modal */}
      {showDrillDown && drillDownData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{drillDownData.title}</h3>
                <p className="text-sm text-gray-600">{drillDownData.subtitle}</p>
              </div>
              <button
                onClick={() => setShowDrillDown(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {/* Summary Cards */}
              {drillDownData.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(drillDownData.summary).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {typeof value === 'number' && key.includes('Revenue') ? formatCurrency(value as number) :
                         typeof value === 'number' && key.includes('Percentage') || key.includes('Rate') || key.includes('Growth') ? 
                         `${(value as number).toFixed(1)}%` : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Detailed Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      {drillDownData.type === 'client-distribution' && (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoices</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Rate</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Invoice</th>
                        </>
                      )}
                      {drillDownData.type === 'revenue-trend' && (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoices</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Invoice</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                        </>
                      )}
                      {drillDownData.type === 'status-breakdown' && (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Invoice</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drillDownData.data.map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {drillDownData.type === 'client-distribution' && (
                          <>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.email}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {item.invoiceCount}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {formatCurrency(item.totalRevenue)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-green-600">
                              {formatCurrency(item.paidRevenue)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-red-600">
                              {formatCurrency(item.outstandingRevenue)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.paymentRate >= 80 ? 'bg-green-100 text-green-800' :
                                item.paymentRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {item.paymentRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {formatCurrency(item.averageInvoiceValue)}
                            </td>
                          </>
                        )}
                        {drillDownData.type === 'revenue-trend' && (
                          <>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.month}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {formatCurrency(item.revenue)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {item.invoiceCount}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {formatCurrency(item.averageInvoiceValue)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-green-600">
                              {formatCurrency(item.paidRevenue)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-red-600">
                              {formatCurrency(item.outstandingRevenue)}
                            </td>
                          </>
                        )}
                        {drillDownData.type === 'status-breakdown' && (
                          <>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {item.invoiceCount}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {formatCurrency(item.totalRevenue)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {formatCurrency(item.averageInvoiceValue)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.oldestInvoice && item.newestInvoice ? (
                                <div>
                                  <div>{formatDate(item.oldestInvoice)}</div>
                                  <div>{formatDate(item.newestInvoice)}</div>
                                </div>
                              ) : (
                                <span>No invoices</span>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    // Export drill-down data
                    const dataStr = JSON.stringify(drillDownData, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    const exportFileDefaultName = `${drillDownData.type.replace('-', '_')}_details.json`;
                    
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <button
                  onClick={() => setShowDrillDown(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
