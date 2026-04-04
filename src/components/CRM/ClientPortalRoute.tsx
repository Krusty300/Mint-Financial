import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import ClientPortal from './ClientPortal';
import { useCRMStore } from '../../stores/crmStore';

const ClientPortalRoute: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { clientPortals } = useCRMStore();

  const handleLogin = () => {
    setError('');
    
    // Validate access code
    const portal = clientPortals.find(p => p.accessCode === accessCode && p.isActive);
    
    if (!portal) {
      setError('Invalid access code or portal not active');
      return;
    }

    // Simple validation (in real app, you'd validate email matches client)
    if (!email) {
      setError('Please enter your email');
      return;
    }

    // Login successful
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAccessCode('');
    setEmail('');
  };

  if (isLoggedIn) {
    return (
      <div>
        <ClientPortal accessCode={accessCode} onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Client Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your access code to view your invoices and documents
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="space-y-6">
            {/* Access Code Input */}
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
                Access Code
              </label>
              <div className="mt-1 relative">
                <input
                  id="accessCode"
                  type={showPassword ? 'text' : 'password'}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your access code"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Login Button */}
            <div>
              <button
                onClick={handleLogin}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Lock className="h-4 w-4 mr-2" />
                Sign In to Portal
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Don't have an access code? Contact your service provider.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientPortalRoute;
