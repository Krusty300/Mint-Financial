import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Plus, Eye, Search, Filter, Copy, CheckSquare, Calendar, DollarSign, X } from 'lucide-react';
import { useInvoiceStore } from '../stores/invoiceStore';
import type { Invoice } from '../types';
import InvoicePreview from './InvoicePreview';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { format } from 'date-fns';

export const InvoiceList: React.FC<{ onCreateInvoice: () => void }> = ({ onCreateInvoice }) => {
  const { invoices, setCurrentInvoice, deleteInvoice, duplicateInvoice, clients } = useInvoiceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<{ startDate: Date | null; endDate: Date | null }>({ startDate: null, endDate: null });
  const [amountFilter, setAmountFilter] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      const matchesDateRange = (!dateFilter.startDate || new Date(invoice.issueDate) >= dateFilter.startDate) &&
                                (!dateFilter.endDate || new Date(invoice.issueDate) <= dateFilter.endDate);
      
      const matchesAmountRange = (!amountFilter.min || invoice.total >= amountFilter.min) &&
                               (!amountFilter.max || invoice.total <= amountFilter.max);
      
      return matchesSearch && matchesStatus && matchesDateRange && matchesAmountRange;
    });
  }, [invoices, searchTerm, statusFilter, dateFilter, amountFilter]);

  const formatDate = (date: Date) => format(date, 'MMM dd, yyyy');

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
    }
  };

  const handleNewInvoice = () => {
    onCreateInvoice();
  };

  const handleDuplicate = (id: string) => {
    duplicateInvoice(id);
  };

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoices(prev => 
      prev.includes(id) 
        ? prev.filter(invId => invId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
    }
  };

  const handleBulkAction = (action: 'duplicate' | 'delete') => {
    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedInvoices.length} invoice(s)?`)) {
        selectedInvoices.forEach(id => deleteInvoice(id));
        setSelectedInvoices([]);
      }
    } else if (action === 'duplicate') {
      selectedInvoices.forEach(id => duplicateInvoice(id));
      setSelectedInvoices([]);
    }
  };

  const handlePreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
  };

  const handleClosePreview = () => {
    setPreviewInvoice(null);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    if (previewInvoice) {
      // Get actual client data from the store
      const client = clients.find(c => c.id === previewInvoice.clientId) || {
        id: previewInvoice.clientId,
        name: 'Unknown Client',
        email: '',
        phone: '',
        address: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active' as const
      };
      
      const success = generateInvoicePDF(previewInvoice, client, {
        name: previewInvoice.companyName || 'Your Company',
        address: previewInvoice.companyAddress || '123 Business St, City, State 12345',
        phone: previewInvoice.companyPhone || '+1 (555) 123-4567',
        email: previewInvoice.companyEmail || 'billing@yourcompany.com',
        logo: previewInvoice.companyLogo || undefined
      });
      if (success) {
        console.log(`Invoice ${previewInvoice.invoiceNumber} PDF downloaded successfully`);
      } else {
        console.error('Failed to download PDF');
      }
    }
  };

  const handleEmailInvoice = () => {
    // Simulate email functionality
    alert('Invoice would be emailed to the client');
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Invoices</h1>
          <button
            onClick={handleNewInvoice}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Invoice</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice number or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
            <Filter className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Invoice['status'] | 'all')}
              className="border-0 focus:ring-0 bg-transparent text-sm flex-1 min-w-0"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <input
              type="date"
              placeholder="Start"
              onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value) : null }))}
              className="border-0 focus:ring-0 bg-transparent text-sm w-24 sm:w-auto"
            />
            <span className="text-gray-500 text-sm hidden sm:inline">to</span>
            <input
              type="date"
              placeholder="End"
              onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value) : null }))}
              className="border-0 focus:ring-0 bg-transparent text-sm w-24 sm:w-auto"
            />
          </div>

          {/* Amount Range Filter */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
            <DollarSign className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <input
              type="number"
              placeholder="Min"
              onChange={(e) => setAmountFilter(prev => ({ ...prev, min: e.target.value ? parseFloat(e.target.value) : null }))}
              className="border-0 focus:ring-0 bg-transparent text-sm w-16 sm:w-20"
            />
            <span className="text-gray-500 text-sm hidden sm:inline">to</span>
            <input
              type="number"
              placeholder="Max"
              onChange={(e) => setAmountFilter(prev => ({ ...prev, max: e.target.value ? parseFloat(e.target.value) : null }))}
              className="border-0 focus:ring-0 bg-transparent text-sm w-16 sm:w-20"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedInvoices.length > 0 && (
        <div className="flex flex-col gap-3 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium text-blue-900">
                {selectedInvoices.length} selected
              </span>
            </div>
            <button
              onClick={handleSelectAll}
              className="text-xs text-blue-600 underline hover:text-blue-800"
            >
              {selectedInvoices.length === filteredInvoices.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleBulkAction('duplicate')}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Duplicate
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedInvoices([])}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No matching invoices' : 'No invoices yet'}
          </h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Create your first invoice to get started'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={handleNewInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Mobile Card View */}
          <div className="sm:hidden">
            <div className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="p-3 sm:p-4">
                  {/* Header with checkbox and status */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={() => handleSelectInvoice(invoice.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{invoice.invoiceNumber}</h3>
                        <p className="text-sm text-gray-600 truncate">{invoice.clientId}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  
                  {/* Key Information Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-gray-500 text-xs">Issue Date</p>
                      <p className="font-medium text-gray-900">{formatDate(invoice.issueDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Due Date</p>
                      <p className="font-medium text-gray-900">{formatDate(invoice.dueDate)}</p>
                    </div>
                  </div>
                  
                  {/* Amount and Actions */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-xs">Amount</p>
                      <p className="font-bold text-lg text-gray-900">${invoice.total.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePreview(invoice)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(invoice.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      title="Select All"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={() => handleSelectInvoice(invoice.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {invoice.clientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${invoice.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handlePreview(invoice)}
                          className="text-purple-600 hover:text-purple-900 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(invoice.id)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                Invoice Preview - {previewInvoice.invoiceNumber}
              </h3>
              <button
                onClick={handleClosePreview}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <InvoicePreview
                invoice={previewInvoice}
                client={clients.find(c => c.id === previewInvoice.clientId) || {
                  id: previewInvoice.clientId,
                  name: 'Unknown Client',
                  email: 'unknown@example.com',
                  phone: '+1 (555) 000-0000',
                  address: 'No address available',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  status: 'active' as const
                }}
                company={{
                  name: previewInvoice.companyName || 'Your Company',
                  address: previewInvoice.companyAddress || '123 Business St, City, State 12345',
                  phone: previewInvoice.companyPhone || '+1 (555) 123-4567',
                  email: previewInvoice.companyEmail || 'billing@yourcompany.com',
                  logo: previewInvoice.companyLogo || undefined
                }}
                onPrint={handlePrintInvoice}
                onDownload={handleDownloadInvoice}
                onEmail={handleEmailInvoice}
                template="classic"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
