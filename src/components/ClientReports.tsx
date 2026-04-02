import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Search
} from 'lucide-react';
import { useInvoiceStore } from '../stores/invoiceStore';

interface ReportConfig {
  dateRange: '7days' | '30days' | '90days' | '6months' | '1year' | 'all';
  clientSegment: 'all' | 'vip' | 'regular' | 'occasional' | 'dormant';
  reportType: 'performance' | 'revenue' | 'satisfaction' | 'lifetime' | 'acquisition';
  format: 'summary' | 'detailed' | 'executive';
}

interface ClientPerformanceReport {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  invoiceCount: number;
  averageInvoiceValue: number;
  paymentRate: number;
  averagePaymentTime: number;
  revenueGrowth: number;
  clientHealthScore: number;
  riskLevel: string;
  segment: string;
  netProfit: number;
  profitMargin: number;
  communicationScore: number;
  satisfactionScore: number;
  lastActivity: Date;
  nextExpectedInvoice?: Date;
  churnRisk: number;
  opportunities: number;
  issues: number;
}

interface RevenueAttributionReport {
  sources: Array<{
    source: string;
    clientCount: number;
    totalRevenue: number;
    revenuePercentage: number;
    averageRevenue: number;
    growthRate: number;
    topClients: Array<{
      clientId: string;
      clientName: string;
      revenue: number;
      percentage: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      revenue: number;
      clientCount: number;
    }>;
  }>;
}

interface SatisfactionReport {
  overallScore: number;
  responseRate: number;
  communicationMetrics: {
    emailResponseTime: number;
    phoneResponseTime: number;
    meetingAttendance: number;
  };
  satisfactionFactors: Array<{
    factor: string;
    score: number;
    weight: number;
    impact: 'high' | 'medium' | 'low';
  }>;
  clientBreakdown: Array<{
    clientId: string;
    clientName: string;
    score: number;
    lastSurvey: Date;
    feedback: string[];
    improvementAreas: string[];
  }>;
  trends: Array<{
    period: string;
    score: number;
    respondents: number;
  }>;
}

interface LifetimeValueReport {
  overallMetrics: {
    averageCLV: number;
    totalCLV: number;
    medianCLV: number;
    clvGrowthRate: number;
  };
  segmentBreakdown: Array<{
    segment: string;
    averageCLV: number;
    clientCount: number;
    totalCLV: number;
    growthRate: number;
  }>;
  clientProjections: Array<{
    clientId: string;
    clientName: string;
    currentCLV: number;
    projectedCLV: number;
    confidence: number;
    factors: string[];
  }>;
  retentionAnalysis: {
    averageRetention: number;
    retentionBySegment: Record<string, number>;
    churnPrediction: number;
  };
}

interface AcquisitionReport {
  overallMetrics: {
    totalCAC: number;
    averageCAC: number;
    cacTrend: number;
    roi: number;
    paybackPeriod: number;
  };
  channelBreakdown: Array<{
    channel: string;
    clientCount: number;
    cac: number;
    revenue: number;
    roi: number;
    efficiency: number;
  }>;
  timeAnalysis: Array<{
    period: string;
    newClients: number;
    totalCAC: number;
    averageCAC: number;
    revenueGenerated: number;
  }>;
  profitabilityAnalysis: Array<{
    clientId: string;
    clientName: string;
    cac: number;
    revenue: number;
    profit: number;
    roi: number;
    paybackTime: number;
  }>;
}

export const ClientReports: React.FC = () => {
  const { invoices, clients } = useInvoiceStore();
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    dateRange: '30days',
    clientSegment: 'all',
    reportType: 'performance',
    format: 'summary'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate client metrics (same as ClientDashboard)
  const clientMetrics = useMemo(() => {
    return clients.map(client => {
      const clientInvoices = invoices.filter(inv => inv.clientId === client.id);
      const paidInvoices = clientInvoices.filter(inv => inv.status === 'paid');
      
      const totalRevenue = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
      
      const paymentRate = clientInvoices.length > 0 ? 
        (paidInvoices.length / clientInvoices.length) * 100 : 0;
      
      const paymentTimes = paidInvoices.map(inv => {
        const issueDate = new Date(inv.issueDate);
        const paidDate = new Date(inv.dueDate);
        return Math.max(0, (paidDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      });
      const averagePaymentTime = paymentTimes.length > 0 ? 
        paymentTimes.reduce((sum, time) => sum + time, 0) / paymentTimes.length : 0;
      
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
      
      let healthScore = 0;
      healthScore += Math.min(40, paymentRate * 0.4);
      healthScore += Math.min(30, (100 - Math.min(100, averagePaymentTime / 30 * 100)) * 0.3);
      healthScore += Math.min(20, (clientInvoices.length / 12) * 20);
      healthScore += Math.min(10, Math.max(0, revenueGrowth) * 0.1);
      
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (paymentRate < 50 || averagePaymentTime > 60 || revenueGrowth < -20) {
        riskLevel = 'high';
      } else if (paymentRate < 80 || averagePaymentTime > 30 || revenueGrowth < -10) {
        riskLevel = 'medium';
      }
      
      let segment: 'vip' | 'regular' | 'occasional' | 'dormant' = 'dormant';
      if (totalRevenue > 10000 && clientInvoices.length >= 6) {
        segment = 'vip';
      } else if (totalRevenue > 5000 && clientInvoices.length >= 3) {
        segment = 'regular';
      } else if (clientInvoices.length >= 1) {
        segment = 'occasional';
      }
      
      const netProfit = totalRevenue * 0.2;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      return {
        clientId: client.id,
        clientName: client.name,
        totalRevenue,
        invoiceCount: clientInvoices.length,
        averageInvoiceValue: clientInvoices.length > 0 ? totalRevenue / clientInvoices.length : 0,
        paymentRate,
        averagePaymentTime,
        revenueGrowth,
        clientHealthScore: Math.round(healthScore),
        riskLevel,
        segment,
        netProfit,
        profitMargin,
        communicationScore: 75 + Math.random() * 20, // Simulated
        satisfactionScore: 70 + Math.random() * 25, // Simulated
        lastActivity: clientInvoices.length > 0 ? 
          new Date(Math.max(...clientInvoices.map(inv => inv.issueDate.getTime()))) : new Date(),
        churnRisk: Math.min(100, (paymentRate < 50 ? 40 : 0) + (averagePaymentTime > 60 ? 30 : 0) + (revenueGrowth < -20 ? 20 : 0)),
        opportunities: Math.floor(Math.random() * 5), // Simulated
        issues: Math.floor(Math.random() * 3) // Simulated
      } as ClientPerformanceReport;
    });
  }, [clients, invoices]);

  // Generate Client Performance Report
  const performanceReport = useMemo(() => {
    let filteredMetrics = clientMetrics;
    
    // Apply date range filter
    // Note: Date filtering is not implemented yet, would need to filter by invoice dates
    // const now = new Date();
    // let startDate: Date;
    // switch (reportConfig.dateRange) {
    //   case '7days':
    //     startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    //     break;
    //   case '30days':
    //     startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    //     break;
    //   case '90days':
    //     startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    //     break;
    //   case '6months':
    //     startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    //     break;
    //   case '1year':
    //     startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    //     break;
    //   default:
    //     startDate = new Date(0);
    // }
    
    // Apply segment filter
    if (reportConfig.clientSegment !== 'all') {
      filteredMetrics = filteredMetrics.filter(m => m.segment === reportConfig.clientSegment);
    }
    
    // Apply search filter
    if (searchTerm) {
      filteredMetrics = filteredMetrics.filter(m => 
        m.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by revenue (descending)
    filteredMetrics.sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    return filteredMetrics;
  }, [clientMetrics, reportConfig, searchTerm]);

  // Generate Revenue Attribution Report
  const revenueAttributionReport = useMemo((): RevenueAttributionReport => {
    // Simulate different sources (in real app, this would come from client acquisition data)
    const sources = [
      { name: 'Referral', clients: clientMetrics.slice(0, 3) },
      { name: 'Website', clients: clientMetrics.slice(3, 8) },
      { name: 'Social Media', clients: clientMetrics.slice(8, 12) },
      { name: 'Cold Outreach', clients: clientMetrics.slice(12, 15) },
      { name: 'Partnership', clients: clientMetrics.slice(15, 17) },
      { name: 'Other', clients: clientMetrics.slice(17) }
    ];
    
    const totalRevenue = clientMetrics.reduce((sum, m) => sum + m.totalRevenue, 0);
    
    return {
      sources: sources.map(source => {
        const sourceRevenue = source.clients.reduce((sum, c) => sum + c.totalRevenue, 0);
        const sourceGrowth = source.clients.reduce((sum, c) => sum + c.revenueGrowth, 0) / source.clients.length;
        
        return {
          source: source.name,
          clientCount: source.clients.length,
          totalRevenue: sourceRevenue,
          revenuePercentage: totalRevenue > 0 ? (sourceRevenue / totalRevenue) * 100 : 0,
          averageRevenue: source.clients.length > 0 ? sourceRevenue / source.clients.length : 0,
          growthRate: sourceGrowth,
          topClients: source.clients
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 3)
            .map(client => ({
              clientId: client.clientId,
              clientName: client.clientName,
              revenue: client.totalRevenue,
              percentage: sourceRevenue > 0 ? (client.totalRevenue / sourceRevenue) * 100 : 0
            })),
          monthlyTrend: [
            { month: 'Jan', revenue: sourceRevenue * 0.15, clientCount: Math.floor(source.clients.length * 0.3) },
            { month: 'Feb', revenue: sourceRevenue * 0.18, clientCount: Math.floor(source.clients.length * 0.4) },
            { month: 'Mar', revenue: sourceRevenue * 0.20, clientCount: Math.floor(source.clients.length * 0.5) },
            { month: 'Apr', revenue: sourceRevenue * 0.17, clientCount: Math.floor(source.clients.length * 0.4) },
            { month: 'May', revenue: sourceRevenue * 0.15, clientCount: Math.floor(source.clients.length * 0.3) },
            { month: 'Jun', revenue: sourceRevenue * 0.15, clientCount: Math.floor(source.clients.length * 0.3) }
          ]
        };
      })
    };
  }, [clientMetrics]);

  // Generate Satisfaction Report
  const satisfactionReport = useMemo((): SatisfactionReport => {
    const overallScore = clientMetrics.reduce((sum, m) => sum + m.satisfactionScore, 0) / clientMetrics.length;
    const responseRate = 85; // Simulated survey response rate
    
    return {
      overallScore,
      responseRate,
      communicationMetrics: {
        emailResponseTime: 2.5, // hours
        phoneResponseTime: 1.2, // hours
        meetingAttendance: 92 // percentage
      },
      satisfactionFactors: [
        { factor: 'Service Quality', score: 85, weight: 0.3, impact: 'high' },
        { factor: 'Communication', score: 88, weight: 0.25, impact: 'high' },
        { factor: 'Value for Money', score: 82, weight: 0.2, impact: 'medium' },
        { factor: 'Timeliness', score: 90, weight: 0.15, impact: 'medium' },
        { factor: 'Support', score: 87, weight: 0.1, impact: 'low' }
      ],
      clientBreakdown: clientMetrics.slice(0, 10).map(m => ({
        clientId: m.clientId,
        clientName: m.clientName,
        score: m.satisfactionScore,
        lastSurvey: new Date(),
        feedback: [
          'Great service quality',
          'Responsive communication',
          'Fair pricing'
        ],
        improvementAreas: m.satisfactionScore < 80 ? [
          'Response time',
          'Service consistency'
        ] : []
      })),
      trends: [
        { period: 'Jan', score: 82, respondents: 45 },
        { period: 'Feb', score: 84, respondents: 52 },
        { period: 'Mar', score: 83, respondents: 48 },
        { period: 'Apr', score: 86, respondents: 61 },
        { period: 'May', score: 85, respondents: 55 },
        { period: 'Jun', score: 87, respondents: 58 }
      ]
    };
  }, [clientMetrics]);

  // Generate Lifetime Value Report
  const lifetimeValueReport = useMemo((): LifetimeValueReport => {
    const totalCLV = clientMetrics.reduce((sum, m) => sum + (m.totalRevenue * 0.8), 0); // 80% of revenue as CLV
    const averageCLV = totalCLV / clientMetrics.length;
    const medianCLV = [...clientMetrics.map(m => m.totalRevenue * 0.8)].sort((a, b) => a - b)[Math.floor(clientMetrics.length / 2)];
    
    const segments = ['vip', 'regular', 'occasional', 'dormant'];
    const segmentBreakdown = segments.map(segment => {
      const segmentClients = clientMetrics.filter(m => m.segment === segment);
      const segmentCLV = segmentClients.reduce((sum, m) => sum + (m.totalRevenue * 0.8), 0);
      const segmentGrowth = segmentClients.reduce((sum, m) => sum + m.revenueGrowth, 0) / segmentClients.length;
      
      return {
        segment,
        averageCLV: segmentClients.length > 0 ? segmentCLV / segmentClients.length : 0,
        clientCount: segmentClients.length,
        totalCLV: segmentCLV,
        growthRate: segmentGrowth
      };
    });
    
    return {
      overallMetrics: {
        averageCLV,
        totalCLV,
        medianCLV,
        clvGrowthRate: 12.5 // Simulated growth rate
      },
      segmentBreakdown,
      clientProjections: clientMetrics.slice(0, 10).map(m => ({
        clientId: m.clientId,
        clientName: m.clientName,
        currentCLV: m.totalRevenue * 0.8,
        projectedCLV: (m.totalRevenue * 0.8) * (1 + (m.revenueGrowth / 100) * 2),
        confidence: m.clientHealthScore,
        factors: [
          'Revenue growth',
          'Payment reliability',
          'Client engagement'
        ]
      })),
      retentionAnalysis: {
        averageRetention: 87,
        retentionBySegment: {
          vip: 95,
          regular: 88,
          occasional: 75,
          dormant: 45
        },
        churnPrediction: 8
      }
    };
  }, [clientMetrics]);

  // Generate Acquisition Report
  const acquisitionReport = useMemo((): AcquisitionReport => {
    // Simulate acquisition costs and channels
    const channels = [
      { name: 'Referral', cac: 200, clients: 3 },
      { name: 'Website', cac: 350, clients: 5 },
      { name: 'Social Media', cac: 400, clients: 4 },
      { name: 'Cold Outreach', cac: 600, clients: 3 },
      { name: 'Partnership', cac: 450, clients: 2 },
      { name: 'Other', cac: 300, clients: 2 }
    ];
    
    const totalCAC = channels.reduce((sum, ch) => sum + (ch.cac * ch.clients), 0);
    const totalClients = channels.reduce((sum, ch) => sum + ch.clients, 0);
    const averageCAC = totalCAC / totalClients;
    const totalRevenue = clientMetrics.reduce((sum, m) => sum + m.totalRevenue, 0);
    const roi = ((totalRevenue - totalCAC) / totalCAC) * 100;
    
    return {
      overallMetrics: {
        totalCAC,
        averageCAC,
        cacTrend: -5.2, // Negative means improving
        roi,
        paybackPeriod: 4.5 // months
      },
      channelBreakdown: channels.map(ch => {
        const channelRevenue = clientMetrics
          .slice(0, ch.clients)
          .reduce((sum, m) => sum + m.totalRevenue, 0);
        const channelROI = ((channelRevenue - (ch.cac * ch.clients)) / (ch.cac * ch.clients)) * 100;
        
        return {
          channel: ch.name,
          clientCount: ch.clients,
          cac: ch.cac,
          revenue: channelRevenue,
          roi: channelROI,
          efficiency: channelRevenue > 0 ? channelRevenue / (ch.cac * ch.clients) : 0
        };
      }),
      timeAnalysis: [
        { period: 'Jan', newClients: 2, totalCAC: 800, averageCAC: 400, revenueGenerated: 5000 },
        { period: 'Feb', newClients: 3, totalCAC: 1200, averageCAC: 400, revenueGenerated: 7500 },
        { period: 'Mar', newClients: 4, totalCAC: 1600, averageCAC: 400, revenueGenerated: 10000 },
        { period: 'Apr', newClients: 3, totalCAC: 1200, averageCAC: 400, revenueGenerated: 8500 },
        { period: 'May', newClients: 5, totalCAC: 2000, averageCAC: 400, revenueGenerated: 14000 },
        { period: 'Jun', newClients: 4, totalCAC: 1600, averageCAC: 400, revenueGenerated: 12000 }
      ],
      profitabilityAnalysis: clientMetrics.slice(0, 10).map((m) => ({
        clientId: m.clientId,
        clientName: m.clientName,
        cac: 300 + Math.random() * 300, // Simulated CAC
        revenue: m.totalRevenue,
        profit: m.netProfit,
        roi: ((m.totalRevenue - 400) / 400) * 100, // Simulated ROI
        paybackTime: 3 + Math.random() * 4 // Simulated payback time
      }))
    };
  }, [clientMetrics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const exportReport = (format: 'json' | 'csv' | 'pdf') => {
    let data: any;
    let filename: string;
    
    switch (reportConfig.reportType) {
      case 'performance':
        data = performanceReport;
        filename = 'client_performance_report';
        break;
      case 'revenue':
        data = revenueAttributionReport;
        filename = 'revenue_attribution_report';
        break;
      case 'satisfaction':
        data = satisfactionReport;
        filename = 'client_satisfaction_report';
        break;
      case 'lifetime':
        data = lifetimeValueReport;
        filename = 'client_lifetime_value_report';
        break;
      case 'acquisition':
        data = acquisitionReport;
        filename = 'client_acquisition_report';
        break;
      default:
        data = {};
        filename = 'report';
    }
    
    if (format === 'json') {
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
      linkElement.click();
    } else if (format === 'csv') {
      // CSV export implementation
      if (reportConfig.reportType === 'performance') {
        // Client Performance Report CSV Export
        const headers = [
          'Client ID',
          'Client Name',
          'Total Revenue',
          'Invoice Count',
          'Average Invoice Value',
          'Payment Rate (%)',
          'Average Payment Time (days)',
          'Revenue Growth (%)',
          'Client Health Score',
          'Risk Level',
          'Segment',
          'Net Profit',
          'Profit Margin (%)',
          'Communication Score',
          'Satisfaction Score',
          'Last Activity',
          'Next Expected Invoice',
          'Churn Risk (%)',
          'Opportunities'
        ];
        
        const csvRows = [
          headers.join(','),
          ...(data as ClientPerformanceReport[]).map(client => [
            `"${client.clientId}"`,
            `"${client.clientName}"`,
            client.totalRevenue.toFixed(2),
            client.invoiceCount,
            client.averageInvoiceValue.toFixed(2),
            client.paymentRate.toFixed(1),
            client.averagePaymentTime.toFixed(1),
            client.revenueGrowth.toFixed(1),
            client.clientHealthScore,
            `"${client.riskLevel}"`,
            `"${client.segment}"`,
            client.netProfit.toFixed(2),
            client.profitMargin.toFixed(1),
            client.communicationScore,
            client.satisfactionScore,
            `"${client.lastActivity.toLocaleDateString()}"`,
            client.nextExpectedInvoice ? `"${client.nextExpectedInvoice.toLocaleDateString()}"` : '""',
            client.churnRisk.toFixed(1),
            client.opportunities
          ].join(','))
        ];
        
        const csvContent = csvRows.join('\n');
        const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        linkElement.click();
      } else if (reportConfig.reportType === 'revenue') {
        // Revenue Attribution Report CSV Export
        const headers = [
          'Source',
          'Client Count',
          'Total Revenue',
          'Revenue Percentage (%)',
          'Average Revenue per Client',
          'Growth Rate (%)',
          'Top Client ID',
          'Top Client Name',
          'Top Client Revenue',
          'Top Client Percentage (%)',
          'Month',
          'Monthly Revenue',
          'Monthly Client Count'
        ];
        
        const csvRows = [headers.join(',')];
        
        // Add source summary data
        (data as RevenueAttributionReport).sources.forEach(source => {
          // Add source summary row
          csvRows.push([
            `"${source.source}"`,
            source.clientCount,
            source.totalRevenue.toFixed(2),
            source.revenuePercentage.toFixed(1),
            source.averageRevenue.toFixed(2),
            source.growthRate.toFixed(1),
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""'
          ].join(','));
          
          // Add top clients for this source
          source.topClients.forEach((client) => {
            csvRows.push([
              `"${source.source}"`,
              '""',
              '""',
              '""',
              '""',
              '""',
              `"${client.clientId}"`,
              `"${client.clientName}"`,
              client.revenue.toFixed(2),
              client.percentage.toFixed(1),
              '""',
              '""',
              '""'
            ].join(','));
          });
          
          // Add monthly trend data if available
          if (source.monthlyTrend && source.monthlyTrend.length > 0) {
            source.monthlyTrend.forEach(trend => {
              csvRows.push([
                `"${source.source}"`,
                '""',
                '""',
                '""',
                '""',
                '""',
                '""',
                '""',
                '""',
                '""',
                `"${trend.month}"`,
                trend.revenue.toFixed(2),
                trend.clientCount
              ].join(','));
            });
          }
        });
        
        const csvContent = csvRows.join('\n');
        const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        linkElement.click();
      } else if (reportConfig.reportType === 'satisfaction') {
        // Client Satisfaction Report CSV Export
        const headers = [
          'Overall Score',
          'Response Rate (%)',
          'Email Response Time (hours)',
          'Phone Response Time (hours)',
          'Meeting Attendance (%)',
          'Satisfaction Factor',
          'Factor Score',
          'Factor Weight',
          'Factor Impact',
          'Client ID',
          'Client Name',
          'Client Score',
          'Last Survey Date',
          'Client Feedback',
          'Improvement Areas',
          'Trend Period',
          'Trend Score',
          'Trend Respondents'
        ];
        
        const csvRows = [headers.join(',')];
        
        // Add overall metrics
        const report = data as SatisfactionReport;
        csvRows.push([
          report.overallScore.toFixed(1),
          report.responseRate,
          report.communicationMetrics.emailResponseTime.toFixed(1),
          report.communicationMetrics.phoneResponseTime.toFixed(1),
          report.communicationMetrics.meetingAttendance,
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""'
        ].join(','));
        
        // Add satisfaction factors
        report.satisfactionFactors.forEach(factor => {
          csvRows.push([
            '""',
            '""',
            '""',
            '""',
            '""',
            `"${factor.factor}"`,
            factor.score.toFixed(1),
            factor.weight,
            `"${factor.impact}"`,
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""'
          ].join(','));
        });
        
        // Add client breakdown
        report.clientBreakdown.forEach(client => {
          const feedbackText = client.feedback.join('; ');
          const improvementAreasText = client.improvementAreas.join('; ');
          
          csvRows.push([
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            `"${client.clientId}"`,
            `"${client.clientName}"`,
            client.score.toFixed(1),
            `"${client.lastSurvey.toLocaleDateString()}"`,
            `"${feedbackText}"`,
            `"${improvementAreasText}"`,
            '""',
            '""',
            '""'
          ].join(','));
        });
        
        // Add trends data
        report.trends.forEach(trend => {
          csvRows.push([
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            `"${trend.period}"`,
            trend.score.toFixed(1),
            trend.respondents
          ].join(','));
        });
        
        const csvContent = csvRows.join('\n');
        const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        linkElement.click();
      } else if (reportConfig.reportType === 'lifetime') {
        // Client Lifetime Value Report CSV Export
        const headers = [
          'Average CLV',
          'Total CLV',
          'Median CLV',
          'CLV Growth Rate (%)',
          'Segment',
          'Segment Average CLV',
          'Segment Client Count',
          'Segment Total CLV',
          'Segment Growth Rate (%)',
          'Client ID',
          'Client Name',
          'Current CLV',
          'Projected CLV',
          'Confidence Score',
          'Growth Factors',
          'Average Retention (%)',
          'VIP Retention (%)',
          'Regular Retention (%)',
          'Occasional Retention (%)',
          'Dormant Retention (%)',
          'Churn Prediction (%)'
        ];
        
        const csvRows = [headers.join(',')];
        
        // Add overall metrics
        const report = data as LifetimeValueReport;
        csvRows.push([
          report.overallMetrics.averageCLV.toFixed(2),
          report.overallMetrics.totalCLV.toFixed(2),
          report.overallMetrics.medianCLV.toFixed(2),
          report.overallMetrics.clvGrowthRate.toFixed(1),
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""'
        ].join(','));
        
        // Add segment breakdown
        report.segmentBreakdown.forEach(segment => {
          csvRows.push([
            '""',
            '""',
            '""',
            '""',
            `"${segment.segment}"`,
            segment.averageCLV.toFixed(2),
            segment.clientCount,
            segment.totalCLV.toFixed(2),
            segment.growthRate.toFixed(1),
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""'
          ].join(','));
        });
        
        // Add client projections
        report.clientProjections.forEach(client => {
          const factorsText = client.factors.join('; ');
          
          csvRows.push([
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            `"${client.clientId}"`,
            `"${client.clientName}"`,
            client.currentCLV.toFixed(2),
            client.projectedCLV.toFixed(2),
            client.confidence,
            `"${factorsText}"`,
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""'
          ].join(','));
        });
        
        // Add retention analysis
        csvRows.push([
          '""',
          '""',
          '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            report.retentionAnalysis.averageRetention,
            report.retentionAnalysis.retentionBySegment.vip,
            report.retentionAnalysis.retentionBySegment.regular,
            report.retentionAnalysis.retentionBySegment.occasional,
            report.retentionAnalysis.retentionBySegment.dormant,
            report.retentionAnalysis.churnPrediction
          ].join(','));
        
        const csvContent = csvRows.join('\n');
        const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        linkElement.click();
      } else if (reportConfig.reportType === 'acquisition') {
        // Client Acquisition Report CSV Export
        const headers = [
          'Total CAC',
          'Average CAC',
          'CAC Trend (%)',
          'ROI (%)',
          'Payback Period (months)',
          'Channel',
          'Channel Client Count',
          'Channel CAC',
          'Channel Revenue',
          'Channel ROI (%)',
          'Channel Efficiency',
          'Period',
          'New Clients',
          'Total CAC',
          'Average CAC',
          'Revenue Generated',
          'Client ID',
          'Client Name',
          'Client CAC',
          'Client Revenue',
          'Client Profit'
        ];
        
        const csvRows = [headers.join(',')];
        
        // Add overall metrics
        const report = data as AcquisitionReport;
        csvRows.push([
          report.overallMetrics.totalCAC.toFixed(2),
          report.overallMetrics.averageCAC.toFixed(2),
          report.overallMetrics.cacTrend.toFixed(1),
          report.overallMetrics.roi.toFixed(1),
          report.overallMetrics.paybackPeriod.toFixed(1),
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""',
          '""'
        ].join(','));
        
        // Add channel breakdown
        report.channelBreakdown.forEach(channel => {
          csvRows.push([
            '""',
            '""',
            '""',
            '""',
            '""',
            `"${channel.channel}"`,
            channel.clientCount,
            channel.cac,
            channel.revenue.toFixed(2),
            channel.roi.toFixed(1),
            channel.efficiency.toFixed(2),
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""'
          ].join(','));
        });
        
        // Add time analysis
        report.timeAnalysis.forEach(period => {
          csvRows.push([
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            `"${period.period}"`,
            period.newClients,
            period.totalCAC,
            period.averageCAC.toFixed(2),
            period.revenueGenerated.toFixed(2),
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""'
          ].join(','));
        });
        
        // Add profitability analysis
        report.profitabilityAnalysis.forEach(client => {
          csvRows.push([
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            '""',
            `"${client.clientId}"`,
            `"${client.clientName}"`,
            client.cac.toFixed(2),
            client.revenue.toFixed(2),
            client.profit.toFixed(2)
          ].join(','));
        });
        
        const csvContent = csvRows.join('\n');
        const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        linkElement.click();
      } else {
        // Generic CSV export for other report types
        alert(`CSV export for ${filename} would be implemented here`);
      }
    } else {
      // PDF export implementation
      if (reportConfig.reportType === 'performance') {
        // Client Performance Report PDF Export
        import('jspdf').then((jsPDF) => {
          const doc = new jsPDF.default();
          
          // Report header
          doc.setFontSize(20);
          doc.setFont('helvetica', 'bold');
          doc.text('Client Performance Report', 105, 20, { align: 'center' });
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
          doc.text(`Date Range: ${reportConfig.dateRange}`, 105, 37, { align: 'center' });
          
          // Executive Summary
          let yPosition = 55;
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Executive Summary', 20, yPosition);
          yPosition += 10;
          
          const totalRevenue = (data as ClientPerformanceReport[]).reduce((sum, client) => sum + client.totalRevenue, 0);
          const avgHealthScore = (data as ClientPerformanceReport[]).reduce((sum, client) => sum + client.clientHealthScore, 0) / (data as ClientPerformanceReport[]).length;
          const totalClients = (data as ClientPerformanceReport[]).length;
          const avgPaymentRate = (data as ClientPerformanceReport[]).reduce((sum, client) => sum + client.paymentRate, 0) / (data as ClientPerformanceReport[]).length;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Total Clients: ${totalClients}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Average Health Score: ${avgHealthScore.toFixed(1)}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Average Payment Rate: ${avgPaymentRate.toFixed(1)}%`, 20, yPosition);
          yPosition += 15;
          
          // Client Details Table
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Client Performance Details', 20, yPosition);
          yPosition += 10;
          
          // Table headers
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const headers = ['Client', 'Revenue', 'Health', 'Risk', 'Invoices'];
          const headerX = [20, 60, 90, 110, 140];
          headers.forEach((header, _index) => {
            doc.text(header, headerX[_index], yPosition);
          });
          yPosition += 5;
          doc.line(20, yPosition, 180, yPosition);
          yPosition += 8;
          
          // Client data rows
          doc.setFont('helvetica', 'normal');
          (data as ClientPerformanceReport[]).forEach((client, _index) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
              
              // Repeat headers on new page
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              headers.forEach((header, headerIndex) => {
                doc.text(header, headerX[headerIndex], yPosition);
              });
              yPosition += 5;
              doc.line(20, yPosition, 180, yPosition);
              yPosition += 8;
              doc.setFont('helvetica', 'normal');
            }
            
            // Truncate long names
            const clientName = client.clientName.length > 15 ? client.clientName.substring(0, 15) + '...' : client.clientName;
            
            doc.text(clientName, headerX[0], yPosition);
            doc.text(`$${client.totalRevenue.toFixed(0)}`, headerX[1], yPosition);
            doc.text(client.clientHealthScore.toString(), headerX[2], yPosition);
            doc.text(client.riskLevel, headerX[3], yPosition);
            doc.text(client.invoiceCount.toString(), headerX[4], yPosition);
            yPosition += 7;
          });
          
          // Segments Summary
          yPosition += 15;
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Client Segments', 20, yPosition);
          yPosition += 10;
          
          const segments = (data as ClientPerformanceReport[]).reduce((acc, client) => {
            acc[client.segment] = (acc[client.segment] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          Object.entries(segments).forEach(([segment, count]) => {
            doc.text(`${segment}: ${count} clients`, 20, yPosition);
            yPosition += 7;
          });
          
          // Risk Analysis
          yPosition += 15;
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Risk Analysis', 20, yPosition);
          yPosition += 10;
          
          const riskLevels = (data as ClientPerformanceReport[]).reduce((acc, client) => {
            acc[client.riskLevel] = (acc[client.riskLevel] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          Object.entries(riskLevels).forEach(([risk, count]) => {
            doc.text(`${risk.charAt(0).toUpperCase() + risk.slice(1)} Risk: ${count} clients`, 20, yPosition);
            yPosition += 7;
          });
          
          // Footer
          const pageCount = doc.internal.pages.length - 1; // Fix page counting
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text('Confidential - Client Performance Report', 105, 290, { align: 'center' });
          }
          
          // Save the PDF
          doc.save(`client_performance_report_${new Date().toISOString().split('T')[0]}.pdf`);
        }).catch(error => {
          console.error('Error generating PDF:', error);
          alert('Error generating PDF. Please try again.');
        });
      } else if (reportConfig.reportType === 'revenue') {
        // Revenue Attribution Report PDF Export
        import('jspdf').then((jsPDF) => {
          const doc = new jsPDF.default();
          
          // Report header
          doc.setFontSize(20);
          doc.setFont('helvetica', 'bold');
          doc.text('Revenue Attribution Report', 105, 20, { align: 'center' });
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
          doc.text(`Date Range: ${reportConfig.dateRange}`, 105, 37, { align: 'center' });
          
          // Executive Summary
          let yPosition = 55;
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Executive Summary', 20, yPosition);
          yPosition += 10;
          
          const totalRevenue = (data as RevenueAttributionReport).sources.reduce((sum, source) => sum + source.totalRevenue, 0);
          const totalClients = (data as RevenueAttributionReport).sources.reduce((sum, source) => sum + source.clientCount, 0);
          const avgGrowthRate = (data as RevenueAttributionReport).sources.reduce((sum, source) => sum + source.growthRate, 0) / (data as RevenueAttributionReport).sources.length;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Total Clients: ${totalClients}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Average Growth Rate: ${avgGrowthRate.toFixed(1)}%`, 20, yPosition);
          yPosition += 7;
          doc.text(`Acquisition Sources: ${(data as RevenueAttributionReport).sources.length}`, 20, yPosition);
          yPosition += 15;
          
          // Revenue by Source Table
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Revenue by Source', 20, yPosition);
          yPosition += 10;
          
          // Table headers
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const headers = ['Source', 'Revenue', '%', 'Clients', 'Avg/Client', 'Growth'];
          const headerX = [20, 60, 90, 110, 140, 165];
          headers.forEach((header, _index) => {
            doc.text(header, headerX[_index], yPosition);
          });
          yPosition += 5;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 8;
          
          // Source data rows
          doc.setFont('helvetica', 'normal');
          (data as RevenueAttributionReport).sources.forEach((source) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
              
              // Repeat headers on new page
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              headers.forEach((header, headerIndex) => {
                doc.text(header, headerX[headerIndex], yPosition);
              });
              yPosition += 5;
              doc.line(20, yPosition, 180, yPosition);
              yPosition += 8;
              doc.setFont('helvetica', 'normal');
            }
            
            doc.text(source.source, headerX[0], yPosition);
            doc.text(`$${source.totalRevenue.toFixed(0)}`, headerX[1], yPosition);
            doc.text(`${source.revenuePercentage.toFixed(1)}%`, headerX[2], yPosition);
            doc.text(source.clientCount.toString(), headerX[3], yPosition);
            doc.text(`$${source.averageRevenue.toFixed(0)}`, headerX[4], yPosition);
            doc.text(`${source.growthRate.toFixed(1)}%`, headerX[5], yPosition);
            yPosition += 7;
          });
          
          // Top Performing Sources
          yPosition += 15;
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Top Performing Sources', 20, yPosition);
          yPosition += 10;
          
          // Sort sources by revenue
          const sortedSources = [...(data as RevenueAttributionReport).sources].sort((a, b) => b.totalRevenue - a.totalRevenue);
          const top3Sources = sortedSources.slice(0, 3);
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          top3Sources.forEach((source, index) => {
            doc.text(`${index + 1}. ${source.source}: $${source.totalRevenue.toFixed(2)} (${source.revenuePercentage.toFixed(1)}%)`, 20, yPosition);
            yPosition += 7;
            
            // Add top client for this source
            if (source.topClients.length > 0) {
              const topClient = source.topClients[0];
              doc.text(`   Top Client: ${topClient.clientName} ($${topClient.revenue.toFixed(2)})`, 20, yPosition);
              yPosition += 7;
            }
          });
          
          // Client Performance by Source
          yPosition += 15;
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Top Clients by Source', 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          top3Sources.forEach((source) => {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
              
              doc.setFontSize(16);
              doc.setFont('helvetica', 'bold');
              doc.text('Top Clients by Source (continued)', 20, yPosition);
              yPosition += 10;
              doc.setFontSize(11);
              doc.setFont('helvetica', 'normal');
            }
            
            doc.text(`${source.source}:`, 20, yPosition);
            yPosition += 7;
            
            source.topClients.slice(0, 2).forEach((client, clientIndex) => {
              doc.text(`  ${clientIndex + 1}. ${client.clientName}: $${client.revenue.toFixed(2)} (${client.percentage.toFixed(1)}%)`, 25, yPosition);
              yPosition += 6;
            });
            yPosition += 5;
          });
          
          // ROI Analysis
          yPosition += 15;
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('ROI Analysis', 20, yPosition);
          yPosition += 10;
          
          // Calculate ROI metrics (simulated)
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text('Average Revenue per Client by Source:', 20, yPosition);
          yPosition += 7;
          
          sortedSources.forEach(source => {
            const roi = source.averageRevenue > 1000 ? 'High' : source.averageRevenue > 500 ? 'Medium' : 'Low';
            doc.text(`${source.source}: $${source.averageRevenue.toFixed(2)} (${roi} ROI)`, 25, yPosition);
            yPosition += 6;
          });
          
          yPosition += 10;
          doc.text('Growth Performance:', 20, yPosition);
          yPosition += 7;
          
          sortedSources.forEach(source => {
            const growthPerformance = source.growthRate > 10 ? 'Excellent' : source.growthRate > 0 ? 'Good' : 'Needs Attention';
            doc.text(`${source.source}: ${source.growthRate.toFixed(1)}% (${growthPerformance})`, 25, yPosition);
            yPosition += 6;
          });
          
          // Footer
          const pageCount = doc.internal.pages.length - 1; // Fix page counting
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text('Confidential - Revenue Attribution Report', 105, 290, { align: 'center' });
          }
          
          // Save the PDF
          doc.save(`revenue_attribution_report_${new Date().toISOString().split('T')[0]}.pdf`);
        }).catch(error => {
          console.error('Error generating PDF:', error);
          alert('Error generating PDF. Please try again.');
        });
      } else if (reportConfig.reportType === 'satisfaction') {
        // Client Satisfaction Report PDF Export
        import('jspdf').then((jsPDF) => {
          const doc = new jsPDF.default();
          
          // Report header
          doc.setFontSize(20);
          doc.setFont('helvetica', 'bold');
          doc.text('Client Satisfaction Report', 105, 20, { align: 'center' });
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
          doc.text(`Date Range: ${reportConfig.dateRange}`, 105, 37, { align: 'center' });
          
          // Executive Summary
          let yPosition = 55;
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Executive Summary', 20, yPosition);
          yPosition += 10;
          
          const report = data as SatisfactionReport;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text(`Overall Satisfaction Score: ${report.overallScore.toFixed(1)}/100`, 20, yPosition);
          yPosition += 7;
          doc.text(`Survey Response Rate: ${report.responseRate}%`, 20, yPosition);
          yPosition += 7;
          doc.text(`Email Response Time: ${report.communicationMetrics.emailResponseTime.toFixed(1)} hours`, 20, yPosition);
          yPosition += 7;
          doc.text(`Phone Response Time: ${report.communicationMetrics.phoneResponseTime.toFixed(1)} hours`, 20, yPosition);
          yPosition += 7;
          doc.text(`Meeting Attendance: ${report.communicationMetrics.meetingAttendance}%`, 20, yPosition);
          yPosition += 15;
          
          // Satisfaction Factors Analysis
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Satisfaction Factors Analysis', 20, yPosition);
          yPosition += 10;
          
          // Table headers
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const headers = ['Factor', 'Score', 'Weight', 'Impact'];
          const headerX = [20, 80, 120, 160];
          headers.forEach((header, _index) => {
            doc.text(header, headerX[_index], yPosition);
          });
          yPosition += 5;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 8;
          
          // Factor data rows
          doc.setFont('helvetica', 'normal');
          report.satisfactionFactors.forEach((factor) => {
            doc.text(factor.factor, headerX[0], yPosition);
            doc.text(factor.score.toFixed(1), headerX[1], yPosition);
            doc.text(`${(factor.weight * 100).toFixed(0)}%`, headerX[2], yPosition);
            doc.text(factor.factor.charAt(0).toUpperCase() + factor.factor.slice(1), headerX[3], yPosition);
            yPosition += 7;
          });
          
          // Client Satisfaction Breakdown
          yPosition += 15;
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Client Satisfaction Breakdown', 20, yPosition);
          yPosition += 10;
          
          // Table headers
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const clientHeaders = ['Client', 'Score', 'Last Survey', 'Status'];
          const clientHeaderX = [20, 80, 120, 160];
          clientHeaders.forEach((header, index) => {
            doc.text(header, clientHeaderX[index], yPosition);
          });
          yPosition += 5;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 8;
          
          // Client data rows
          doc.setFont('helvetica', 'normal');
          report.clientBreakdown.forEach((client) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
              
              // Repeat headers on new page
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              clientHeaders.forEach((header, headerIndex) => {
                doc.text(header, clientHeaderX[headerIndex], yPosition);
              });
              yPosition += 5;
              doc.line(20, yPosition, 180, yPosition);
              yPosition += 8;
              doc.setFont('helvetica', 'normal');
            }
            
            // Determine satisfaction status
            let status = 'Good';
            if (client.score >= 90) status = 'Excellent';
            else if (client.score >= 80) status = 'Good';
            else if (client.score >= 70) status = 'Fair';
            else status = 'Poor';
            
            // Truncate long names
            const clientName = client.clientName.length > 20 ? client.clientName.substring(0, 20) + '...' : client.clientName;
            
            doc.text(clientName, clientHeaderX[0], yPosition);
            doc.text(client.score.toFixed(1), clientHeaderX[1], yPosition);
            doc.text(client.lastSurvey.toLocaleDateString(), clientHeaderX[2], yPosition);
            doc.text(status, clientHeaderX[3], yPosition);
            yPosition += 7;
            
            // Add feedback if available
            if (client.feedback && client.feedback.length > 0) {
              const feedbackText = client.feedback[0].substring(0, 60);
              doc.setFontSize(9);
              doc.setFont('helvetica', 'italic');
              doc.text(`"${feedbackText}"`, 25, yPosition);
              yPosition += 6;
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(11);
            }
            
            // Add improvement areas if available
            if (client.improvementAreas && client.improvementAreas.length > 0) {
              const improvementText = client.improvementAreas[0];
              doc.setFontSize(9);
              doc.setFont('helvetica', 'italic');
              doc.text(`Areas to improve: ${improvementText}`, 25, yPosition);
              yPosition += 6;
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(11);
            }
            yPosition += 3;
          });
          
          // Satisfaction Trends
          yPosition += 15;
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Satisfaction Trends', 20, yPosition);
          yPosition += 10;
          
          // Table headers
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const trendHeaders = ['Period', 'Score', 'Respondents', 'Target'];
          const trendHeaderX = [20, 60, 100, 140];
          trendHeaders.forEach((header, index) => {
            doc.text(header, trendHeaderX[index], yPosition);
          });
          yPosition += 5;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 8;
          
          // Trend data rows
          doc.setFont('helvetica', 'normal');
          report.trends.forEach((trend) => {
            doc.text(trend.period, trendHeaderX[0], yPosition);
            doc.text(trend.score.toFixed(1), trendHeaderX[1], yPosition);
            doc.text(trend.respondents.toString(), trendHeaderX[2], yPosition);
            
            // Add target indicator
            const target = 85; // Target satisfaction score
            const status = trend.score >= target ? '✓' : '✗';
            doc.text(status, trendHeaderX[3], yPosition);
            yPosition += 7;
          });
          
          // Communication Performance
          yPosition += 15;
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Communication Performance', 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text('Email Response Time:', 20, yPosition);
          yPosition += 7;
          doc.text(`Average: ${report.communicationMetrics.emailResponseTime.toFixed(1)} hours`, 30, yPosition);
          yPosition += 7;
          doc.text('Industry Average: 4.2 hours', 30, yPosition);
          yPosition += 7;
          
          const emailPerformance = report.communicationMetrics.emailResponseTime < 4.2 ? 'Above Average' : 'Below Average';
          doc.text(`Performance: ${emailPerformance}`, 30, yPosition);
          yPosition += 10;
          
          doc.text('Phone Response Time:', 20, yPosition);
          yPosition += 7;
          doc.text(`Average: ${report.communicationMetrics.phoneResponseTime.toFixed(1)} hours`, 30, yPosition);
          yPosition += 7;
          doc.text('Industry Average: 2.1 hours', 30, yPosition);
          yPosition += 7;
          
          const phonePerformance = report.communicationMetrics.phoneResponseTime < 2.1 ? 'Above Average' : 'Below Average';
          doc.text(`Performance: ${phonePerformance}`, 30, yPosition);
          yPosition += 10;
          
          doc.text('Meeting Attendance:', 20, yPosition);
          yPosition += 7;
          doc.text(`Average: ${report.communicationMetrics.meetingAttendance}%`, 30, yPosition);
          yPosition += 7;
          doc.text('Industry Average: 88%', 30, yPosition);
          yPosition += 7;
          
          const meetingPerformance = report.communicationMetrics.meetingAttendance >= 88 ? 'Above Average' : 'Below Average';
          doc.text(`Performance: ${meetingPerformance}`, 30, yPosition);
          yPosition += 15;
          
          // Recommendations
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Key Recommendations', 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          
          // Generate recommendations based on data
          const recommendations = [];
          
          if (report.overallScore < 80) {
            recommendations.push('Focus on improving overall service quality');
          }
          if (report.communicationMetrics.emailResponseTime > 3) {
            recommendations.push('Reduce email response time to under 3 hours');
          }
          if (report.communicationMetrics.meetingAttendance < 85) {
            recommendations.push('Improve meeting attendance and engagement');
          }
          
          const lowPerformingFactors = report.satisfactionFactors.filter(f => f.score < 85);
          if (lowPerformingFactors.length > 0) {
            recommendations.push(`Address issues with: ${lowPerformingFactors.map(f => f.factor).join(', ')}`);
          }
          
          recommendations.forEach((rec, index) => {
            doc.text(`${index + 1}. ${rec}`, 20, yPosition);
            yPosition += 6;
          });
          
          // Footer
          const pageCount = doc.internal.pages.length - 1; // Fix page counting
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text('Confidential - Client Satisfaction Report', 105, 290, { align: 'center' });
          }
          
          // Save the PDF
          doc.save(`client_satisfaction_report_${new Date().toISOString().split('T')[0]}.pdf`);
        }).catch(error => {
          console.error('Error generating PDF:', error);
          alert('Error generating PDF. Please try again.');
        });
      } else if (reportConfig.reportType === 'lifetime') {
        // Client Lifetime Value Report PDF Export
        import('jspdf').then((jsPDF) => {
          const doc = new jsPDF.default();
          
          // Report header
          doc.setFontSize(20);
          doc.setFont('helvetica', 'bold');
          doc.text('Client Lifetime Value Report', 105, 20, { align: 'center' });
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
          doc.text(`Date Range: ${reportConfig.dateRange}`, 105, 37, { align: 'center' });
          
          // Executive Summary
          let yPosition = 55;
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Executive Summary', 20, yPosition);
          yPosition += 10;
          
          const report = data as LifetimeValueReport;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text(`Average CLV: $${report.overallMetrics.averageCLV.toFixed(2)}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Total CLV: $${report.overallMetrics.totalCLV.toFixed(2)}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Median CLV: $${report.overallMetrics.medianCLV.toFixed(2)}`, 20, yPosition);
          yPosition += 7;
          doc.text(`CLV Growth Rate: ${report.overallMetrics.clvGrowthRate.toFixed(1)}%`, 20, yPosition);
          yPosition += 7;
          doc.text(`Average Retention: ${report.retentionAnalysis.averageRetention}%`, 20, yPosition);
          yPosition += 7;
          doc.text(`Churn Prediction: ${report.retentionAnalysis.churnPrediction}%`, 20, yPosition);
          yPosition += 15;
          
          // CLV by Segment
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('CLV by Customer Segment', 20, yPosition);
          yPosition += 10;
          
          // Table headers
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const headers = ['Segment', 'Avg CLV', 'Clients', 'Total CLV', 'Growth Rate'];
          const headerX = [20, 80, 120, 160, 190];
          headers.forEach((header, _index) => {
            doc.text(header, headerX[_index], yPosition);
          });
          yPosition += 5;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 8;
          
          // Segment data rows
          doc.setFont('helvetica', 'normal');
          report.segmentBreakdown.forEach((segment) => {
            doc.text(segment.segment.charAt(0).toUpperCase() + segment.segment.slice(1), headerX[0], yPosition);
            doc.text(`$${segment.averageCLV.toFixed(0)}`, headerX[1], yPosition);
            doc.text(segment.clientCount.toString(), headerX[2], yPosition);
            doc.text(`$${segment.totalCLV.toFixed(0)}`, headerX[3], yPosition);
            doc.text(`${segment.growthRate.toFixed(1)}%`, headerX[4], yPosition);
            yPosition += 7;
          });
          
          // Client Projections
          yPosition += 15;
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Client CLV Projections', 20, yPosition);
          yPosition += 10;
          
          // Table headers
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const clientHeaders = ['Client', 'Current CLV', 'Projected CLV', 'Growth', 'Confidence'];
          const clientHeaderX = [20, 70, 120, 160, 190];
          clientHeaders.forEach((header, index) => {
            doc.text(header, clientHeaderX[index], yPosition);
          });
          yPosition += 5;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 8;
          
          // Client projection data rows
          doc.setFont('helvetica', 'normal');
          report.clientProjections.forEach((client) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
              
              // Repeat headers on new page
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              clientHeaders.forEach((header, headerIndex) => {
                doc.text(header, clientHeaderX[headerIndex], yPosition);
              });
              yPosition += 5;
              doc.line(20, yPosition, 180, yPosition);
              yPosition += 8;
              doc.setFont('helvetica', 'normal');
            }
            
            // Calculate growth percentage
            const growthPercentage = ((client.projectedCLV - client.currentCLV) / client.currentCLV * 100);
            
            // Truncate long names
            const clientName = client.clientName.length > 20 ? client.clientName.substring(0, 20) + '...' : client.clientName;
            
            doc.text(clientName, clientHeaderX[0], yPosition);
            doc.text(`$${client.currentCLV.toFixed(0)}`, clientHeaderX[1], yPosition);
            doc.text(`$${client.projectedCLV.toFixed(0)}`, clientHeaderX[2], yPosition);
            doc.text(`${growthPercentage.toFixed(1)}%`, clientHeaderX[3], yPosition);
            doc.text(`${client.confidence}%`, clientHeaderX[4], yPosition);
            yPosition += 7;
            
            // Add growth factors if available
            if (client.factors && client.factors.length > 0) {
              const factorsText = client.factors.join(', ');
              doc.setFontSize(9);
              doc.setFont('helvetica', 'italic');
              doc.text(`Factors: ${factorsText}`, 25, yPosition);
              yPosition += 6;
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(11);
            }
            yPosition += 3;
          });
          
          // Retention Analysis
          yPosition += 15;
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Retention Analysis', 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text('Overall Retention Rate:', 20, yPosition);
          yPosition += 7;
          doc.text(`${report.retentionAnalysis.averageRetention}%`, 30, yPosition);
          yPosition += 7;
          
          // Industry benchmark
          const industryAverage = 75;
          const retentionPerformance = report.retentionAnalysis.averageRetention >= industryAverage ? 'Above Average' : 'Below Average';
          doc.text(`Industry Average: ${industryAverage}%`, 30, yPosition);
          yPosition += 7;
          doc.text(`Performance: ${retentionPerformance}`, 30, yPosition);
          yPosition += 10;
          
          doc.text('Retention by Segment:', 20, yPosition);
          yPosition += 7;
          
          const segments = ['vip', 'regular', 'occasional', 'dormant'];
          segments.forEach(segment => {
            const segmentName = segment.charAt(0).toUpperCase() + segment.slice(1);
            const retentionRate = report.retentionAnalysis.retentionBySegment[segment] || 0;
            doc.text(`${segmentName}: ${retentionRate}%`, 30, yPosition);
            yPosition += 6;
          });
          yPosition += 10;
          
          doc.text('Churn Prediction:', 20, yPosition);
          yPosition += 7;
          doc.text(`Predicted Annual Churn: ${report.retentionAnalysis.churnPrediction}%`, 30, yPosition);
          yPosition += 7;
          
          const churnLevel = report.retentionAnalysis.churnPrediction < 5 ? 'Low' : 
                          report.retentionAnalysis.churnPrediction < 10 ? 'Moderate' : 'High';
          doc.text(`Risk Level: ${churnLevel}`, 30, yPosition);
          yPosition += 15;
          
          // CLV Growth Analysis
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('CLV Growth Analysis', 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text('Current CLV Growth Rate:', 20, yPosition);
          yPosition += 7;
          doc.text(`${report.overallMetrics.clvGrowthRate.toFixed(1)}% annually`, 30, yPosition);
          yPosition += 7;
          
          // Growth projection
          const projectedYears = 3;
          const projectedTotalCLV = report.overallMetrics.totalCLV * Math.pow(1 + (report.overallMetrics.clvGrowthRate / 100), projectedYears);
          doc.text(`Projected CLV in ${projectedYears} years: $${projectedTotalCLV.toFixed(2)}`, 30, yPosition);
          yPosition += 7;
          
          const growthValue = projectedTotalCLV - report.overallMetrics.totalCLV;
          doc.text(`Expected Growth: $${growthValue.toFixed(2)}`, 30, yPosition);
          yPosition += 10;
          
          // Segment growth comparison
          doc.text('Segment Growth Rates:', 20, yPosition);
          yPosition += 7;
          
          const sortedSegments = [...report.segmentBreakdown].sort((a, b) => b.growthRate - a.growthRate);
          sortedSegments.forEach((segment, index) => {
            const segmentName = segment.segment.charAt(0).toUpperCase() + segment.segment.slice(1);
            doc.text(`${index + 1}. ${segmentName}: ${segment.growthRate.toFixed(1)}%`, 30, yPosition);
            yPosition += 6;
          });
          yPosition += 10;
          
          // Investment Recommendations
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Investment Recommendations', 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          
          // Generate recommendations based on data
          const recommendations = [];
          
          const highCLVSectors = report.segmentBreakdown.filter(s => s.averageCLV > 10000);
          if (highCLVSectors.length > 0) {
            recommendations.push(`Focus retention efforts on ${highCLVSectors.map(s => s.segment).join(', ')} segments (highest CLV)`);
          }
          
          if (report.retentionAnalysis.churnPrediction > 10) {
            recommendations.push('Implement customer retention programs to reduce high churn rate');
          }
          
          if (report.overallMetrics.clvGrowthRate < 10) {
            recommendations.push('Develop strategies to accelerate CLV growth rate');
          }
          
          const lowRetentionSegments = segments.filter(s => 
            report.retentionAnalysis.retentionBySegment[s] < 80
          );
          if (lowRetentionSegments.length > 0) {
            recommendations.push(`Improve retention for ${lowRetentionSegments.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')} segments`);
          }
          
          recommendations.forEach((rec, index) => {
            doc.text(`${index + 1}. ${rec}`, 20, yPosition);
            yPosition += 6;
          });
          
          // Footer
          const pageCount = doc.internal.pages.length - 1; // Fix page counting
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text('Confidential - Client Lifetime Value Report', 105, 290, { align: 'center' });
          }
          
          // Save the PDF
          doc.save(`client_lifetime_value_report_${new Date().toISOString().split('T')[0]}.pdf`);
        }).catch(error => {
          console.error('Error generating PDF:', error);
          alert('Error generating PDF. Please try again.');
        });
      } else if (reportConfig.reportType === 'acquisition') {
        // Client Acquisition Report PDF Export
        import('jspdf').then((jsPDF) => {
          const doc = new jsPDF.default();
          
          // Report header
          doc.setFontSize(20);
          doc.setFont('helvetica', 'bold');
          doc.text('Client Acquisition Report', 105, 20, { align: 'center' });
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
          doc.text(`Date Range: ${reportConfig.dateRange}`, 105, 37, { align: 'center' });
          
          // Executive Summary
          let yPosition = 55;
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Executive Summary', 20, yPosition);
          yPosition += 10;
          
          const report = data as AcquisitionReport;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text(`Total CAC: $${report.overallMetrics.totalCAC.toFixed(2)}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Average CAC: $${report.overallMetrics.averageCAC.toFixed(2)}`, 20, yPosition);
          yPosition += 7;
          doc.text(`CAC Trend: ${report.overallMetrics.cacTrend.toFixed(1)}%`, 20, yPosition);
          yPosition += 7;
          doc.text(`Overall ROI: ${report.overallMetrics.roi.toFixed(1)}%`, 20, yPosition);
          yPosition += 7;
          doc.text(`Payback Period: ${report.overallMetrics.paybackPeriod.toFixed(1)} months`, 20, yPosition);
          yPosition += 15;
          
          // Acquisition Channel Performance
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Acquisition Channel Performance', 20, yPosition);
          yPosition += 10;
          
          // Table headers
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const headers = ['Channel', 'Clients', 'CAC', 'Revenue', 'ROI (%)', 'Efficiency'];
          const headerX = [20, 50, 80, 110, 150, 180];
          headers.forEach((header, _index) => {
            doc.text(header, headerX[_index], yPosition);
          });
          yPosition += 5;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 8;
          
          // Channel data rows
          doc.setFont('helvetica', 'normal');
          report.channelBreakdown.forEach((channel) => {
            doc.text(channel.channel, headerX[0], yPosition);
            doc.text(channel.clientCount.toString(), headerX[1], yPosition);
            doc.text(`$${channel.cac}`, headerX[2], yPosition);
            doc.text(`$${channel.revenue.toFixed(0)}`, headerX[3], yPosition);
            doc.text(`${channel.roi.toFixed(1)}%`, headerX[4], yPosition);
            doc.text(channel.efficiency.toFixed(1), headerX[5], yPosition);
            yPosition += 7;
          });
          
          // Channel Performance Summary
          yPosition += 15;
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Channel Performance Summary', 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          
          // Best performing channel by ROI
          const bestROIChannel = report.channelBreakdown.reduce((best, channel) => 
            channel.roi > best.roi ? channel : best
          );
          doc.text(`Best ROI Channel: ${bestROIChannel.channel} (${bestROIChannel.roi.toFixed(1)}%)`, 20, yPosition);
          yPosition += 7;
          
          // Best performing channel by efficiency
          const bestEfficiencyChannel = report.channelBreakdown.reduce((best, channel) => 
            channel.efficiency > best.efficiency ? channel : best
          );
          doc.text(`Most Efficient: ${bestEfficiencyChannel.channel} (${bestEfficiencyChannel.efficiency.toFixed(1)}x)`, 20, yPosition);
          yPosition += 7;
          
          // Lowest CAC channel
          const lowestCACChannel = report.channelBreakdown.reduce((lowest, channel) => 
            channel.cac < lowest.cac ? channel : lowest
          );
          doc.text(`Lowest CAC: ${lowestCACChannel.channel} ($${lowestCACChannel.cac})`, 20, yPosition);
          yPosition += 7;
          
          // Most clients acquired
          const mostClientsChannel = report.channelBreakdown.reduce((most, channel) => 
            channel.clientCount > most.clientCount ? channel : most
          );
          doc.text(`Most Clients: ${mostClientsChannel.channel} (${mostClientsChannel.clientCount})`, 20, yPosition);
          yPosition += 15;
          
          // Monthly Acquisition Trends
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Monthly Acquisition Trends', 20, yPosition);
          yPosition += 10;
          
          // Table headers
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const trendHeaders = ['Period', 'New Clients', 'Total CAC', 'Avg CAC', 'Revenue'];
          const trendHeaderX = [20, 60, 100, 140, 170];
          trendHeaders.forEach((header, index) => {
            doc.text(header, trendHeaderX[index], yPosition);
          });
          yPosition += 5;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 8;
          
          // Trend data rows
          doc.setFont('helvetica', 'normal');
          report.timeAnalysis.forEach((period) => {
            doc.text(period.period, trendHeaderX[0], yPosition);
            doc.text(period.newClients.toString(), trendHeaderX[1], yPosition);
            doc.text(`$${period.totalCAC}`, trendHeaderX[2], yPosition);
            doc.text(`$${period.averageCAC.toFixed(0)}`, trendHeaderX[3], yPosition);
            doc.text(`$${period.revenueGenerated.toFixed(0)}`, trendHeaderX[4], yPosition);
            yPosition += 7;
          });
          
          // Acquisition Efficiency Analysis
          yPosition += 15;
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Acquisition Efficiency Analysis', 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          
          // Calculate metrics
          const totalNewClients = report.timeAnalysis.reduce((sum, p) => sum + p.newClients, 0);
          const totalPeriodCAC = report.timeAnalysis.reduce((sum, p) => sum + p.totalCAC, 0);
          const totalPeriodRevenue = report.timeAnalysis.reduce((sum, p) => sum + p.revenueGenerated, 0);
          const avgMonthlyClients = totalNewClients / report.timeAnalysis.length;
          const avgMonthlyCAC = totalPeriodCAC / report.timeAnalysis.length;
          const avgMonthlyRevenue = totalPeriodRevenue / report.timeAnalysis.length;
          
          doc.text('6-Month Summary:', 20, yPosition);
          yPosition += 7;
          doc.text(`Total New Clients: ${totalNewClients}`, 30, yPosition);
          yPosition += 7;
          doc.text(`Average Monthly: ${avgMonthlyClients.toFixed(1)} clients`, 30, yPosition);
          yPosition += 7;
          doc.text(`Total Investment: $${totalPeriodCAC.toFixed(2)}`, 30, yPosition);
          yPosition += 7;
          doc.text(`Average Monthly Investment: $${avgMonthlyCAC.toFixed(2)}`, 30, yPosition);
          yPosition += 7;
          doc.text(`Total Revenue Generated: $${totalPeriodRevenue.toFixed(2)}`, 30, yPosition);
          yPosition += 7;
          doc.text(`Average Monthly Revenue: $${avgMonthlyRevenue.toFixed(2)}`, 30, yPosition);
          yPosition += 7;
          
          const periodROI = ((totalPeriodRevenue - totalPeriodCAC) / totalPeriodCAC) * 100;
          doc.text(`6-Month ROI: ${periodROI.toFixed(1)}%`, 30, yPosition);
          yPosition += 10;
          
          // Industry benchmark comparison
          const industryAvgCAC = 450;
          const industryAvgROI = 120;
          const cacPerformance = report.overallMetrics.averageCAC <= industryAvgCAC ? 'Below Average' : 'Above Average';
          const roiPerformance = report.overallMetrics.roi >= industryAvgROI ? 'Above Average' : 'Below Average';
          
          doc.text('Industry Benchmarks:', 20, yPosition);
          yPosition += 7;
          doc.text(`Industry Avg CAC: $${industryAvgCAC}`, 30, yPosition);
          yPosition += 7;
          doc.text(`Our Performance: ${cacPerformance} ($${report.overallMetrics.averageCAC.toFixed(2)})`, 30, yPosition);
          yPosition += 7;
          doc.text(`Industry Avg ROI: ${industryAvgROI}%`, 30, yPosition);
          yPosition += 7;
          doc.text(`Our Performance: ${roiPerformance} (${report.overallMetrics.roi.toFixed(1)}%)`, 30, yPosition);
          yPosition += 15;
          
          // Client Profitability Analysis
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Client Profitability Analysis', 20, yPosition);
          yPosition += 10;
          
          // Table headers
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const clientHeaders = ['Client', 'CAC', 'Revenue', 'Profit', 'ROI (%)'];
          const clientHeaderX = [20, 60, 100, 140, 170];
          clientHeaders.forEach((header, index) => {
            doc.text(header, clientHeaderX[index], yPosition);
          });
          yPosition += 5;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 8;
          
          // Client profitability data rows
          doc.setFont('helvetica', 'normal');
          report.profitabilityAnalysis.forEach((client) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
              
              // Repeat headers on new page
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              clientHeaders.forEach((header, headerIndex) => {
                doc.text(header, clientHeaderX[headerIndex], yPosition);
              });
              yPosition += 5;
              doc.line(20, yPosition, 180, yPosition);
              yPosition += 8;
              doc.setFont('helvetica', 'normal');
            }
            
            // Truncate long names
            const clientName = client.clientName.length > 15 ? client.clientName.substring(0, 15) + '...' : client.clientName;
            
            doc.text(clientName, clientHeaderX[0], yPosition);
            doc.text(`$${client.cac.toFixed(0)}`, clientHeaderX[1], yPosition);
            doc.text(`$${client.revenue.toFixed(0)}`, clientHeaderX[2], yPosition);
            doc.text(`$${client.profit.toFixed(0)}`, clientHeaderX[3], yPosition);
            
            const clientROI = ((client.revenue - client.cac) / client.cac) * 100;
            doc.text(`${clientROI.toFixed(1)}%`, clientHeaderX[4], yPosition);
            yPosition += 7;
          });
          
          // Investment Recommendations
          yPosition += 15;
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Investment Recommendations', 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          
          // Generate recommendations based on data
          const recommendations = [];
          
          if (bestROIChannel.roi > 300) {
            recommendations.push(`Scale up ${bestROIChannel.channel} channel (ROI: ${bestROIChannel.roi.toFixed(1)}%)`);
          }
          
          if (report.overallMetrics.averageCAC > industryAvgCAC) {
            recommendations.push('Optimize acquisition channels to reduce CAC below industry average');
          }
          
          if (report.overallMetrics.roi < industryAvgROI) {
            recommendations.push('Improve targeting to increase ROI above industry average');
          }
          
          if (report.overallMetrics.paybackPeriod > 6) {
            recommendations.push('Focus on channels with faster payback periods');
          }
          
          const highCACChannels = report.channelBreakdown.filter(c => c.cac > industryAvgCAC);
          if (highCACChannels.length > 0) {
            recommendations.push(`Review and optimize ${highCACChannels.map(c => c.channel).join(', ')} channels`);
          }
          
          recommendations.forEach((rec, index) => {
            doc.text(`${index + 1}. ${rec}`, 20, yPosition);
            yPosition += 6;
          });
          
          // Footer
          const pageCount = doc.internal.pages.length - 1; // Fix page counting
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text('Confidential - Client Acquisition Report', 105, 290, { align: 'center' });
          }
          
          // Save the PDF
          doc.save(`client_acquisition_report_${new Date().toISOString().split('T')[0]}.pdf`);
        }).catch(error => {
          console.error('Error generating PDF:', error);
          alert('Error generating PDF. Please try again.');
        });
      } else {
        // Generic PDF export for other report types
        alert(`PDF export for ${filename} would be implemented here`);
      }
    }
  };

  const renderPerformanceReport = () => (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(performanceReport.reduce((sum, m) => sum + m.totalRevenue, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Avg Health Score</p>
            <p className="text-2xl font-bold text-green-600">
              {(performanceReport.reduce((sum, m) => sum + m.clientHealthScore, 0) / performanceReport.length).toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Payment Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {(performanceReport.reduce((sum, m) => sum + m.paymentRate, 0) / performanceReport.length).toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Profit</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(performanceReport.reduce((sum, m) => sum + m.netProfit, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Client Performance */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Client Performance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoices</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Health</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Growth</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceReport.slice(0, 10).map((client) => (
                <tr key={client.clientId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium">{client.clientName.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
                        <div className="text-xs text-gray-500">{client.segment}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(client.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {client.invoiceCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end">
                      <span className={`text-sm font-medium ${
                        client.clientHealthScore >= 80 ? 'text-green-600' :
                        client.clientHealthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {client.clientHealthScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {client.paymentRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${
                      client.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {client.revenueGrowth >= 0 ? '+' : ''}{client.revenueGrowth.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(client.netProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRevenueAttributionReport = () => (
    <div className="space-y-6">
      {/* Revenue by Source */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Attribution by Source</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {revenueAttributionReport.sources.map((source) => (
            <div key={source.source} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{source.source}</h4>
                <span className="text-sm text-gray-500">{source.clientCount} clients</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(source.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Share:</span>
                  <span className="font-medium">{source.revenuePercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Growth:</span>
                  <span className={`font-medium ${source.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {source.growthRate >= 0 ? '+' : ''}{source.growthRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Top Clients:</p>
                {source.topClients.map((client) => (
                  <div key={client.clientId} className="flex justify-between text-xs">
                    <span className="text-gray-700 truncate">{client.clientName}</span>
                    <span className="text-gray-500">{client.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSatisfactionReport = () => (
    <div className="space-y-6">
      {/* Overall Satisfaction */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Client Satisfaction</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {satisfactionReport.overallScore.toFixed(0)}
            </div>
            <p className="text-sm text-gray-600">Overall Score</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {satisfactionReport.responseRate}%
            </div>
            <p className="text-sm text-gray-600">Response Rate</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {satisfactionReport.communicationMetrics.meetingAttendance}%
            </div>
            <p className="text-sm text-gray-600">Meeting Attendance</p>
          </div>
        </div>
      </div>

      {/* Satisfaction Factors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Satisfaction Factors</h3>
        <div className="space-y-3">
          {satisfactionReport.satisfactionFactors.map((factor) => (
            <div key={factor.factor} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{factor.factor}</span>
                  <span className="text-sm text-gray-600">{factor.score.toFixed(0)}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
              <div className="ml-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  factor.impact === 'high' ? 'bg-red-100 text-red-800' :
                  factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {factor.impact} impact
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLifetimeValueReport = () => (
    <div className="space-y-6">
      {/* CLV Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Lifetime Value Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Average CLV</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(lifetimeValueReport.overallMetrics.averageCLV)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Total CLV</p>
            <p className="text-2xl font-bold text-pink-600">
              {formatCurrency(lifetimeValueReport.overallMetrics.totalCLV)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Median CLV</p>
            <p className="text-2xl font-bold text-indigo-600">
              {formatCurrency(lifetimeValueReport.overallMetrics.medianCLV)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">CLV Growth</p>
            <p className="text-2xl font-bold text-green-600">
              +{lifetimeValueReport.overallMetrics.clvGrowthRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* CLV by Segment */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CLV by Client Segment</h3>
        <div className="space-y-3">
          {lifetimeValueReport.segmentBreakdown.map((segment) => (
            <div key={segment.segment} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">{segment.segment}</h4>
                <span className="text-sm text-gray-500">{segment.clientCount} clients</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Avg CLV: </span>
                  <span className="font-medium">{formatCurrency(segment.averageCLV)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total: </span>
                  <span className="font-medium">{formatCurrency(segment.totalCLV)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Growth: </span>
                  <span className={`font-medium ${segment.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {segment.growthRate >= 0 ? '+' : ''}{segment.growthRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAcquisitionReport = () => (
    <div className="space-y-6">
      {/* Acquisition Overview */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Acquisition Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Total CAC</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(acquisitionReport.overallMetrics.totalCAC)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Avg CAC</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(acquisitionReport.overallMetrics.averageCAC)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">ROI</p>
            <p className="text-2xl font-bold text-green-600">
              {acquisitionReport.overallMetrics.roi.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Payback</p>
            <p className="text-2xl font-bold text-blue-600">
              {acquisitionReport.overallMetrics.paybackPeriod}mo
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Trend</p>
            <p className="text-2xl font-bold text-purple-600">
              {acquisitionReport.overallMetrics.cacTrend > 0 ? '+' : ''}{acquisitionReport.overallMetrics.cacTrend.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acquisition Channel Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Clients</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CAC</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ROI</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Efficiency</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {acquisitionReport.channelBreakdown.map((channel) => (
                <tr key={channel.channel} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {channel.channel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {channel.clientCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(channel.cac)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(channel.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${channel.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {channel.roi.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {channel.efficiency.toFixed(1)}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Client Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive client analytics and business intelligence</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('json')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={() => exportReport('csv')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => exportReport('pdf')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportConfig.reportType}
              onChange={(e) => setReportConfig(prev => ({ ...prev, reportType: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="performance">Client Performance</option>
              <option value="revenue">Revenue Attribution</option>
              <option value="satisfaction">Client Satisfaction</option>
              <option value="lifetime">Lifetime Value</option>
              <option value="acquisition">Acquisition Analysis</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={reportConfig.dateRange}
              onChange={(e) => setReportConfig(prev => ({ ...prev, dateRange: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Segment</label>
            <select
              value={reportConfig.clientSegment}
              onChange={(e) => setReportConfig(prev => ({ ...prev, clientSegment: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Segments</option>
              <option value="vip">VIP</option>
              <option value="regular">Regular</option>
              <option value="occasional">Occasional</option>
              <option value="dormant">Dormant</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select
              value={reportConfig.format}
              onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="summary">Summary</option>
              <option value="detailed">Detailed</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
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

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow">
        {reportConfig.reportType === 'performance' && renderPerformanceReport()}
        {reportConfig.reportType === 'revenue' && renderRevenueAttributionReport()}
        {reportConfig.reportType === 'satisfaction' && renderSatisfactionReport()}
        {reportConfig.reportType === 'lifetime' && renderLifetimeValueReport()}
        {reportConfig.reportType === 'acquisition' && renderAcquisitionReport()}
      </div>
    </div>
  );
};
