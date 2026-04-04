import React, { useState } from 'react';
import { useInvoiceStore } from '../stores/invoiceStore';
import type { Client } from '../types';
import { Users, TrendingUp, BarChart3, Star } from 'lucide-react';

export const ClientDashboardRoute: React.FC = () => {
  const { clients } = useInvoiceStore();
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
};
