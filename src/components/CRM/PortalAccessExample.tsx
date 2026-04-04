import React, { useState } from 'react';
import { Key, Copy, CheckCircle, Users, Lock, Mail } from 'lucide-react';
import { useCRMStore } from '../../stores/crmStore';

const PortalAccessExample: React.FC = () => {
  const { clients, createClientPortal, clientPortals } = useCRMStore();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [accessCode, setAccessCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGeneratePortal = () => {
    if (selectedClientId) {
      const code = createClientPortal(selectedClientId);
      setAccessCode(code);
    }
  };

  const handleCopyCode = () => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareViaEmail = () => {
    if (accessCode && selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        const subject = 'Your Client Portal Access';
        const body = `Hello ${client.name},\n\nYour client portal access code is: ${accessCode}\n\nVisit: https://your-app.com/portal\n\nBest regards`;
        window.location.href = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Portal Access</h2>
        
        {/* Step 1: Select Client */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1: Select Client
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Generate Access Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2: Generate Access Code
            </label>
            <button
              onClick={handleGeneratePortal}
              disabled={!selectedClientId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Key className="h-4 w-4 inline mr-2" />
              Generate Access Code
            </button>
          </div>

          {/* Step 3: Share Access Code */}
          {accessCode && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step 3: Share Access Code
              </label>
              
              {/* Access Code Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Access Code:</p>
                    <p className="text-2xl font-mono font-bold text-blue-600">{accessCode}</p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Share Options */}
              <div className="flex space-x-3">
                <button
                  onClick={handleShareViaEmail}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </button>
                
                <button
                  onClick={() => {
                    const client = clients.find(c => c.id === selectedClientId);
                    if (client && client.phone) {
                      const message = `Hi ${client.name},\n\nYour client portal access code is: ${accessCode}\n\nPortal URL: https://your-app.com/portal\n\nLogin with your email and the access code above.\n\nBest regards`;
                      window.open(`https://wa.me/?phone=${encodeURIComponent(client.phone)}&text=${encodeURIComponent(message)}`);
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Share via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Portals */}
      {clientPortals.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Client Portals</h3>
          <div className="space-y-3">
            {clientPortals.map(portal => {
              const client = clients.find(c => c.id === portal.clientId);
              return (
                <div key={portal.accessCode} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{client?.name}</p>
                      <p className="text-sm text-gray-500">{client?.email}</p>
                      <p className="text-sm text-gray-500">Access Code: {portal.accessCode}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        portal.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {portal.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Portal Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          <Lock className="h-5 w-5 inline mr-2" />
          Client Portal Instructions
        </h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start">
            <span className="font-medium mr-2">1.</span>
            <span>Share the access code with your client via email, WhatsApp, or any other method</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2">2.</span>
            <span>Client visits the portal URL and enters their email and access code</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2">3.</span>
            <span>Client can view invoices, make payments, download documents, and communicate</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2">4.</span>
            <span>Portal access can be deactivated anytime for security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalAccessExample;
