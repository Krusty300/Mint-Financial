import React, { useState, useMemo } from 'react';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Search, 
  Download, 
  Eye,
  Edit,
  MoreVertical,
  Heart
} from 'lucide-react';
import { useInvoiceStore } from '../stores/invoiceStore';
import type { ClientMetrics, ClientAlert, ClientSegment } from '../types';

export const ClientDashboard: React.FC = () => {
  const { invoices, clients } = useInvoiceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedLifecycleStage, setSelectedLifecycleStage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'revenue' | 'health' | 'risk' | 'name'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate client metrics
  const clientMetrics = useMemo(() => {
    return clients.map(client => {
      const clientInvoices = invoices.filter(inv => inv.clientId === client.id);
      const paidInvoices = clientInvoices.filter(inv => inv.status === 'paid');
      const outstandingInvoices = clientInvoices.filter(inv => inv.status !== 'paid');
      
      const totalRevenue = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const paidRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const outstandingRevenue = outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0);
      
      // Calculate average payment time
      const paymentTimes = paidInvoices.map(inv => {
        const issueDate = new Date(inv.issueDate);
        const paidDate = new Date(inv.dueDate); // Assuming dueDate is when paid
        return Math.max(0, (paidDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      });
      const averagePaymentTime = paymentTimes.length > 0 ? 
        paymentTimes.reduce((sum, time) => sum + time, 0) / paymentTimes.length : 0;
      
      // Calculate payment rate
      const paymentRate = clientInvoices.length > 0 ? 
        (paidInvoices.length / clientInvoices.length) * 100 : 0;
      
      // Calculate revenue growth (simplified - comparing last 3 months to previous 3 months)
      const now = new Date();
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      
      const recentRevenue = clientInvoices
        .filter(inv => new Date(inv.issueDate) >= threeMonthsAgo)
        .reduce((sum, inv) => sum + inv.total, 0);
      
      const previousRevenue = clientInvoices
        .filter(inv => {
          const invDate = new Date(inv.issueDate);
          return invDate >= sixMonthsAgo && invDate < threeMonthsAgo;
        })
        .reduce((sum, inv) => sum + inv.total, 0);
      
      const revenueGrowth = previousRevenue > 0 ? 
        ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      // Calculate client health score (0-100)
      let healthScore = 0;
      healthScore += Math.min(40, paymentRate * 0.4); // Payment rate (40% weight)
      healthScore += Math.min(30, (100 - Math.min(100, averagePaymentTime / 30 * 100)) * 0.3); // Payment speed (30% weight)
      healthScore += Math.min(20, (clientInvoices.length / 12) * 20); // Invoice frequency (20% weight)
      healthScore += Math.min(10, Math.max(0, revenueGrowth) * 0.1); // Revenue growth (10% weight)
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (paymentRate < 50 || averagePaymentTime > 60 || revenueGrowth < -20) {
        riskLevel = 'high';
      } else if (paymentRate < 80 || averagePaymentTime > 30 || revenueGrowth < -10) {
        riskLevel = 'medium';
      }
      
      // Determine lifecycle stage
      let lifecycleStage: 'new' | 'active' | 'at-risk' | 'inactive' | 'churned' = 'new';
      const daysSinceLastInvoice = clientInvoices.length > 0 ? 
        (now.getTime() - Math.max(...clientInvoices.map(inv => inv.issueDate.getTime()))) / (1000 * 60 * 60 * 24) : 999;
      
      if (daysSinceLastInvoice > 180) {
        lifecycleStage = 'churned';
      } else if (daysSinceLastInvoice > 90 || riskLevel === 'high') {
        lifecycleStage = 'at-risk';
      } else if (clientInvoices.length >= 3 && daysSinceLastInvoice <= 30) {
        lifecycleStage = 'active';
      } else if (clientInvoices.length >= 1) {
        lifecycleStage = 'new';
      }
      
      // Determine segment
      let segment: 'vip' | 'regular' | 'occasional' | 'dormant' = 'dormant';
      if (totalRevenue > 10000 && clientInvoices.length >= 6) {
        segment = 'vip';
      } else if (totalRevenue > 5000 && clientInvoices.length >= 3) {
        segment = 'regular';
      } else if (clientInvoices.length >= 1) {
        segment = 'occasional';
      }
      
      // Calculate churn risk (0-100)
      let churnRisk = 0;
      if (paymentRate < 50) churnRisk += 40;
      if (averagePaymentTime > 60) churnRisk += 30;
      if (daysSinceLastInvoice > 90) churnRisk += 20;
      if (revenueGrowth < -20) churnRisk += 10;
      
      // Calculate lifetime value and profit (simplified)
      const lifetimeValue = totalRevenue;
      const acquisitionCost = 500; // Fixed assumption
      const netProfit = totalRevenue * 0.2; // 20% profit margin assumption
      
      return {
        clientId: client.id,
        totalRevenue,
        invoiceCount: clientInvoices.length,
        paidRevenue,
        outstandingRevenue,
        averageInvoiceValue: clientInvoices.length > 0 ? totalRevenue / clientInvoices.length : 0,
        paymentRate,
        averagePaymentTime,
        lastInvoiceDate: clientInvoices.length > 0 ? 
          new Date(Math.max(...clientInvoices.map(inv => inv.issueDate.getTime()))) : undefined,
        lastPaymentDate: paidInvoices.length > 0 ? 
          new Date(Math.max(...paidInvoices.map(inv => inv.dueDate.getTime()))) : undefined,
        clientSince: client.createdAt || new Date(),
        revenueGrowth,
        profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
        clientHealthScore: Math.round(healthScore),
        riskLevel,
        lifecycleStage,
        segment,
        communicationScore: 75, // Placeholder
        satisfactionScore: 80, // Placeholder
        churnRisk: Math.min(100, churnRisk),
        lifetimeValue,
        acquisitionCost,
        netProfit
      } as ClientMetrics;
    });
  }, [clients, invoices]);

  // Generate client alerts
  const clientAlerts = useMemo(() => {
    const alerts: ClientAlert[] = [];
    
    clientMetrics.forEach(metric => {
      const client = clients.find(c => c.id === metric.clientId);
      if (!client) return;
      
      // High risk alert
      if (metric.riskLevel === 'high') {
        alerts.push({
          id: `high-risk-${metric.clientId}`,
          clientId: metric.clientId,
          type: 'high_risk',
          severity: 'high',
          title: 'High Risk Client',
          message: `${client.name} has high risk factors. Payment rate: ${metric.paymentRate.toFixed(1)}%`,
          actionRequired: true,
          createdAt: new Date()
        });
      }
      
      // Overdue payment alert
      if (metric.outstandingRevenue > 0) {
        const overdueInvoices = invoices.filter(inv => 
          inv.clientId === metric.clientId && 
          inv.status !== 'paid' && 
          new Date(inv.dueDate) < new Date()
        );
        
        if (overdueInvoices.length > 0) {
          alerts.push({
            id: `overdue-${metric.clientId}`,
            clientId: metric.clientId,
            type: 'payment_overdue',
            severity: 'critical',
            title: 'Payment Overdue',
            message: `${overdueInvoices.length} overdue invoices totaling ${formatCurrency(metric.outstandingRevenue)}`,
            actionRequired: true,
            createdAt: new Date()
          });
        }
      }
      
      // Revenue drop alert
      if (metric.revenueGrowth < -20) {
        alerts.push({
          id: `revenue-drop-${metric.clientId}`,
          clientId: metric.clientId,
          type: 'revenue_drop',
          severity: 'medium',
          title: 'Revenue Drop',
          message: `${client.name} revenue decreased by ${Math.abs(metric.revenueGrowth).toFixed(1)}%`,
          actionRequired: false,
          createdAt: new Date()
        });
      }
      
      // Anniversary alert
      const daysAsClient = Math.floor((new Date().getTime() - metric.clientSince.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAsClient > 0 && daysAsClient % 365 === 0) {
        alerts.push({
          id: `anniversary-${metric.clientId}`,
          clientId: metric.clientId,
          type: 'anniversary',
          severity: 'low',
          title: 'Client Anniversary',
          message: `${client.name} has been a client for ${Math.floor(daysAsClient / 365)} years!`,
          actionRequired: false,
          createdAt: new Date()
        });
      }
    });
    
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [clientMetrics, clients, invoices]);

  // Generate client segments
  const clientSegments = useMemo(() => {
    const segments: ClientSegment[] = [
      {
        id: 'vip',
        name: 'VIP Clients',
        description: 'High-value clients with consistent business',
        criteria: { revenueRange: { min: 10000, max: Infinity } },
        clientIds: clientMetrics.filter(m => m.segment === 'vip').map(m => m.clientId),
        metrics: {
          totalRevenue: clientMetrics.filter(m => m.segment === 'vip').reduce((sum, m) => sum + m.totalRevenue, 0),
          clientCount: clientMetrics.filter(m => m.segment === 'vip').length,
          averageRevenue: 0,
          growthRate: 0
        },
        createdAt: new Date()
      },
      {
        id: 'at-risk',
        name: 'At Risk',
        description: 'Clients showing concerning patterns',
        criteria: { riskLevels: ['high'] },
        clientIds: clientMetrics.filter(m => m.riskLevel === 'high').map(m => m.clientId),
        metrics: {
          totalRevenue: clientMetrics.filter(m => m.riskLevel === 'high').reduce((sum, m) => sum + m.totalRevenue, 0),
          clientCount: clientMetrics.filter(m => m.riskLevel === 'high').length,
          averageRevenue: 0,
          growthRate: 0
        },
        createdAt: new Date()
      },
      {
        id: 'new-clients',
        name: 'New Clients',
        description: 'Recently acquired clients',
        criteria: { lifecycleStages: ['new'] },
        clientIds: clientMetrics.filter(m => m.lifecycleStage === 'new').map(m => m.clientId),
        metrics: {
          totalRevenue: clientMetrics.filter(m => m.lifecycleStage === 'new').reduce((sum, m) => sum + m.totalRevenue, 0),
          clientCount: clientMetrics.filter(m => m.lifecycleStage === 'new').length,
          averageRevenue: 0,
          growthRate: 0
        },
        createdAt: new Date()
      }
    ];
    
    // Calculate average revenue and growth rate for each segment
    segments.forEach(segment => {
      const segmentMetrics = clientMetrics.filter(m => segment.clientIds.includes(m.clientId));
      segment.metrics.averageRevenue = segmentMetrics.length > 0 ? 
        segment.metrics.totalRevenue / segmentMetrics.length : 0;
      segment.metrics.growthRate = segmentMetrics.length > 0 ? 
        segmentMetrics.reduce((sum, m) => sum + m.revenueGrowth, 0) / segmentMetrics.length : 0;
    });
    
    return segments;
  }, [clientMetrics]);

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clientMetrics;
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(metric => {
        const client = clients.find(c => c.id === metric.clientId);
        return client?.name.toLowerCase().includes(searchLower) ||
               client?.email.toLowerCase().includes(searchLower) ||
               client?.phone.toLowerCase().includes(searchLower);
      });
    }
    
    // Apply segment filter
    if (selectedSegment !== 'all') {
      filtered = filtered.filter(metric => metric.segment === selectedSegment);
    }
    
    // Apply risk level filter
    if (selectedRiskLevel !== 'all') {
      filtered = filtered.filter(metric => metric.riskLevel === selectedRiskLevel);
    }
    
    // Apply lifecycle stage filter
    if (selectedLifecycleStage !== 'all') {
      filtered = filtered.filter(metric => metric.lifecycleStage === selectedLifecycleStage);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'revenue':
          comparison = a.totalRevenue - b.totalRevenue;
          break;
        case 'health':
          comparison = a.clientHealthScore - b.clientHealthScore;
          break;
        case 'risk':
          const riskOrder = { low: 0, medium: 1, high: 2 };
          comparison = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
          break;
        case 'name':
          const clientA = clients.find(c => c.id === a.clientId);
          const clientB = clients.find(c => c.id === b.clientId);
          comparison = (clientA?.name || '').localeCompare(clientB?.name || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [clientMetrics, clients, searchTerm, selectedSegment, selectedRiskLevel, selectedLifecycleStage, sortBy, sortOrder]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    return {
      totalClients: clients.length,
      activeClients: clientMetrics.filter(m => m.lifecycleStage === 'active').length,
      totalRevenue: clientMetrics.reduce((sum, m) => sum + m.totalRevenue, 0),
      averageHealthScore: clientMetrics.length > 0 ? 
        clientMetrics.reduce((sum, m) => sum + m.clientHealthScore, 0) / clientMetrics.length : 0,
      highRiskClients: clientMetrics.filter(m => m.riskLevel === 'high').length,
      vipClients: clientMetrics.filter(m => m.segment === 'vip').length,
      totalAlerts: clientAlerts.length,
      criticalAlerts: clientAlerts.filter(a => a.severity === 'critical').length
    };
  }, [clients, clientMetrics, clientAlerts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getClientById = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Client Dashboard</h1>
          <p className="text-gray-600 mt-1">Advanced client analytics and management</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              const dataStr = JSON.stringify({ clientMetrics, clientAlerts, clientSegments }, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const exportFileDefaultName = `client_analytics_${new Date().toISOString().split('T')[0]}.json`;
              
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{summaryStats.totalClients}</p>
              <p className="text-xs text-gray-500">{summaryStats.activeClients} active</p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCurrency(summaryStats.totalRevenue)}</p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Health Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{summaryStats.averageHealthScore.toFixed(0)}</p>
              <p className="text-xs text-gray-500">Out of 100</p>
            </div>
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Critical Alerts</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{summaryStats.criticalAlerts}</p>
              <p className="text-xs text-gray-500">{summaryStats.totalAlerts} total</p>
            </div>
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Client Segments */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Client Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clientSegments.map(segment => (
            <div key={segment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{segment.name}</h4>
                <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  segment.id === 'vip' ? 'bg-purple-100 text-purple-800' :
                  segment.id === 'at-risk' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {segment.metrics.clientCount}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(segment.metrics.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-medium">{formatCurrency(segment.metrics.averageRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Growth:</span>
                  <span className={`font-medium ${segment.metrics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {segment.metrics.growthRate >= 0 ? '+' : ''}{segment.metrics.growthRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Segments</option>
              <option value="vip">VIP</option>
              <option value="regular">Regular</option>
              <option value="occasional">Occasional</option>
              <option value="dormant">Dormant</option>
            </select>
            
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            
            <select
              value={selectedLifecycleStage}
              onChange={(e) => setSelectedLifecycleStage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Stages</option>
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="at-risk">At Risk</option>
              <option value="inactive">Inactive</option>
              <option value="churned">Churned</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="revenue-desc">Revenue (High to Low)</option>
              <option value="revenue-asc">Revenue (Low to High)</option>
              <option value="health-desc">Health (High to Low)</option>
              <option value="health-asc">Health (Low to High)</option>
              <option value="risk-asc">Risk (Low to High)</option>
              <option value="risk-desc">Risk (High to Low)</option>
              <option value="name-asc">Name (A to Z)</option>
              <option value="name-desc">Name (Z to A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Clients ({filteredAndSortedClients.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Rate
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedClients.map((metric) => {
                const client = getClientById(metric.clientId);
                if (!client) return null;
                
                return (
                  <tr key={metric.clientId} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(metric.totalRevenue)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end">
                        <span className={`text-sm font-medium ${getHealthScoreColor(metric.clientHealthScore)}`}>
                          {metric.clientHealthScore}
                        </span>
                        <Heart className={`w-4 h-4 ml-1 ${getHealthScoreColor(metric.clientHealthScore)}`} />
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        metric.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                        metric.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {metric.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        metric.lifecycleStage === 'active' ? 'bg-green-100 text-green-800' :
                        metric.lifecycleStage === 'new' ? 'bg-blue-100 text-blue-800' :
                        metric.lifecycleStage === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                        metric.lifecycleStage === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {metric.lifecycleStage.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {metric.paymentRate.toFixed(1)}%
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          // onClick={() => setShowClientDetails(metric.clientId)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View client details (feature not implemented)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Alerts */}
      {clientAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {clientAlerts.slice(0, 5).map(alert => {
              const client = getClientById(alert.clientId);
              return (
                <div key={alert.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-100' :
                      alert.severity === 'high' ? 'bg-orange-100' :
                      alert.severity === 'medium' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {alert.severity === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                       alert.severity === 'high' ? <AlertTriangle className="w-4 h-4 text-orange-600" /> :
                       alert.severity === 'medium' ? <AlertTriangle className="w-4 h-4 text-yellow-600" /> :
                       <CheckCircle className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {client && <span className="text-sm text-gray-500">{client.name}</span>}
                    <span className="text-xs text-gray-400">
                      {alert.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
