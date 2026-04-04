import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, AlertTriangle, CheckCircle, Calendar, DollarSign, Users, FileText, Phone, Mail, Download } from 'lucide-react';
import { useCRMStore, useClientHealthMetrics } from '../../stores/crmStore';
import type { Client } from '../../types/crm';

interface ClientInsightsProps {
  clientId: string;
}

const ClientInsights: React.FC<ClientInsightsProps> = ({ clientId }) => {
  const { clients, communications, feedback } = useCRMStore();
  const [client, setClient] = useState<Client | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'communications' | 'documents' | 'feedback'>('overview');

  useEffect(() => {
    const foundClient = clients.find(c => c.id === clientId);
    if (foundClient) {
      setClient(foundClient);
      const metrics = useClientHealthMetrics(clientId);
      setHealthMetrics(metrics);
    }
  }, [clientId, clients]);

  if (!client || !healthMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const clientCommunications = communications.filter(c => c.clientId === clientId);
  const clientFeedback = feedback.filter(f => f.clientId === clientId);
  const clientDocuments = client ? client.documents : [];

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      case 'invoice': return <DollarSign className="h-4 w-4" />;
      case 'payment': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCommunicationColor = (direction: string) => {
    return direction === 'inbound' ? 'text-blue-600' : 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600">{client.email}</p>
            {client.company && <p className="text-gray-500">{client.company}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthScoreColor(healthMetrics.score)}`}>
              Health Score: {healthMetrics.score}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              client.segment === 'vip' ? 'text-purple-600 bg-purple-100' :
              client.segment === 'regular' ? 'text-blue-600 bg-blue-100' :
              client.segment === 'at-risk' ? 'text-orange-600 bg-orange-100' :
              'text-gray-600 bg-gray-100'
            }`}>
              {client.segment.charAt(0).toUpperCase() + client.segment.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('communications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'communications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Communications ({clientCommunications.length})
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents ({clientDocuments.length})
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feedback'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Feedback ({clientFeedback.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">${client.totalRevenue.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">{client.totalInvoices}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Payment Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {client.totalInvoices > 0 ? Math.round((client.paidInvoices / client.totalInvoices) * 100) : 0}%
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Payment Time</p>
                      <p className="text-2xl font-bold text-gray-900">{client.averagePaymentTime.toFixed(1)} days</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Health Score Breakdown */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Health Score Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Revenue Factor</span>
                      <span className="text-sm text-gray-600">{healthMetrics.factors.revenue.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${healthMetrics.factors.revenue}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Payment Timeliness</span>
                      <span className="text-sm text-gray-600">{healthMetrics.factors.paymentTimeliness.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${healthMetrics.factors.paymentTimeliness}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Communication</span>
                      <span className="text-sm text-gray-600">{healthMetrics.factors.communication.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${healthMetrics.factors.communication}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Satisfaction</span>
                      <span className="text-sm text-gray-600">{healthMetrics.factors.satisfaction.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${healthMetrics.factors.satisfaction}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {healthMetrics.recommendations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-yellow-900">Recommendations</h3>
                      <ul className="mt-2 text-sm text-yellow-800 space-y-1">
                        {healthMetrics.recommendations.map((rec: string, index: number) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {clientCommunications.slice(0, 5).map((comm) => (
                    <div key={comm.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getCommunicationColor(comm.direction)} bg-opacity-10`}>
                          {getCommunicationIcon(comm.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{comm.subject || comm.type}</p>
                          <p className="text-xs text-gray-500">{new Date(comm.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-xs ${getCommunicationColor(comm.direction)}`}>
                        {comm.direction}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Communications Tab */}
          {activeTab === 'communications' && (
            <div className="space-y-4">
              {clientCommunications.map((comm) => (
                <div key={comm.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getCommunicationColor(comm.direction)} bg-opacity-10`}>
                        {getCommunicationIcon(comm.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{comm.subject || comm.type}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            comm.direction === 'inbound' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {comm.direction}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{comm.content}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{new Date(comm.createdAt).toLocaleDateString()}</span>
                          <span>Status: {comm.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-500">{doc.type}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    <p>{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    <p>{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              {clientFeedback.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${star <= (feedback.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill={star <= (feedback.rating || 0) ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{feedback.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{feedback.content}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      feedback.status === 'resolved' ? 'bg-green-100 text-green-600' :
                      feedback.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {feedback.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                    {feedback.respondedAt && (
                      <span className="ml-4">Responded: {new Date(feedback.respondedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {feedback.response && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Response:</strong> {feedback.response}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientInsights;
