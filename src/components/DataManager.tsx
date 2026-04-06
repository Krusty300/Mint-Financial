import React, { useState } from 'react';
import { Download, Database, RefreshCw, AlertCircle, Play } from 'lucide-react';
import { useInvoiceStore } from '../stores/invoiceStore';
import { generateSampleData } from '../utils/sampleData';

export const DataManager: React.FC = () => {
  const { 
    invoices, 
    clients, 
    backupData, 
    restoreData, 
    exportData, 
    importData,
    importDataDirect
  } = useInvoiceStore();
  
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('idle');
    setImportMessage('');

    try {
      const success = await importData(file);
      if (success) {
        setImportStatus('success');
        setImportMessage('Data imported successfully!');
      } else {
        setImportStatus('error');
        setImportMessage('Failed to import data. Please check the file format.');
      }
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Error reading file. Please try again.');
    } finally {
      setIsImporting(false);
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setImportStatus('idle');
        setImportMessage('');
      }, 3000);
    }
  };

  const handleRestore = () => {
    const success = restoreData();
    if (success) {
      alert('Data restored successfully from backup!');
    } else {
      alert('No backup data found in localStorage.');
    }
  };

  const handleExport = () => {
    exportData();
  };

  const handleBackup = () => {
    backupData();
    alert('Data backed up successfully!');
  };

  const handleLoadSampleData = () => {
    if (confirm('This will replace all existing data with sample data. Continue?')) {
      const sampleData = generateSampleData();
      
      // Clear existing data
      localStorage.removeItem('invoice-builder-invoices');
      localStorage.removeItem('invoice-builder-clients');
      
      // Import sample data
      importDataDirect(sampleData);
      
      alert('Sample data loaded successfully! Check the Dashboard to see the new features.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Data Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Statistics */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Total Invoices:</span>
              <span className="font-medium text-gray-900">{invoices.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Total Clients:</span>
              <span className="font-medium text-gray-900">{clients.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Total Revenue:</span>
              <span className="font-medium text-gray-900">
                ${invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Import/Export Actions */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Import & Export</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Data (JSON)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-sm"
                />
                {isImporting && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {importStatus !== 'idle' && (
                <div className={`mt-2 p-3 rounded-lg ${
                  importStatus === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {importMessage}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm sm:px-3"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Ex</span>
              </button>
              
              <button
                onClick={handleBackup}
                className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm sm:px-3"
              >
                <Database className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Backup</span>
                <span className="sm:hidden">Bk</span>
              </button>
              
              <button
                onClick={handleRestore}
                className="flex items-center justify-center gap-1 px-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm sm:px-3"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Restore</span>
                <span className="sm:hidden">Rs</span>
              </button>
              
              <button
                onClick={handleLoadSampleData}
                className="flex items-center justify-center gap-1 px-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm sm:px-3"
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Sample</span>
                <span className="sm:hidden">Sm</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">Data Persistence</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• All data is automatically saved to browser localStorage</p>
          <p>• Automatic backups are created for data recovery</p>
          <p>• Export data as JSON for external backup</p>
          <p>• Import data from JSON files to restore information</p>
          <p>• Load sample data to explore dashboard features</p>
        </div>
      </div>
    </div>
  );
};
