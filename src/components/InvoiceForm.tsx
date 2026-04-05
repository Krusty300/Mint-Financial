import React, { useState, useEffect, useCallback } from 'react';
import { Save, Download, Plus, Trash2 } from 'lucide-react';
import { useInvoiceStore } from '../stores/invoiceStore';
import type { Invoice, InvoiceItem } from '../types';
import { DatePicker } from './DatePicker';
import { generateInvoicePDF } from '../utils/pdfGenerator';

interface InvoiceFormProps {
  onClose?: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onClose }) => {
  const { 
    currentInvoice, 
    setCurrentInvoice, 
    addInvoice, 
    updateInvoice,
    clients,
    generateInvoiceNumber,
    loadData
  } = useInvoiceStore();

  // Enhanced form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  const [autoSaveEnabled] = useState(true);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft' as Invoice['status'],
    items: [] as InvoiceItem[],
    taxRate: 0,
    notes: '',
    paymentTerms: 'Payment due within 30 days',
    // Company Information
    companyName: 'Your Company',
    companyAddress: '123 Business St, City, State 12345',
    companyPhone: '+1 (555) 123-4567',
    companyEmail: 'billing@yourcompany.com',
    companyLogo: null as string | null
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return;
    
    const timer = setTimeout(() => {
      const draftData = {
        ...formData,
        lastSaved: new Date()
      };
      localStorage.setItem('invoice-draft', JSON.stringify(draftData));
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearTimeout(timer);
  }, [formData, autoSaveEnabled]);

  // Enhanced calculation functions
  const calculateSubtotal = useCallback(() => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  }, [formData.items]);

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal();
    const taxAmount = subtotal * (formData.taxRate / 100);
    return subtotal + taxAmount;
  }, [calculateSubtotal, formData.taxRate]);

  useEffect(() => {
    if (currentInvoice) {
      setFormData({
        invoiceNumber: currentInvoice.invoiceNumber,
        clientId: currentInvoice.clientId,
        issueDate: currentInvoice.issueDate.toISOString().split('T')[0],
        dueDate: currentInvoice.dueDate.toISOString().split('T')[0],
        status: currentInvoice.status,
        items: currentInvoice.items,
        taxRate: currentInvoice.taxRate,
        notes: currentInvoice.notes || '',
        paymentTerms: currentInvoice.paymentTerms || '',
        // Company Information - Load from saved invoice
        companyName: currentInvoice.companyName || 'Your Company',
        companyAddress: currentInvoice.companyAddress || '123 Business St, City, State 12345',
        companyPhone: currentInvoice.companyPhone || '+1 (555) 123-4567',
        companyEmail: currentInvoice.companyEmail || 'billing@yourcompany.com',
        companyLogo: currentInvoice.companyLogo || null
      });
    } else {
      setFormData({
        invoiceNumber: generateInvoiceNumber(),
        clientId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        items: [],
        taxRate: 10,
        notes: '',
        paymentTerms: 'Payment due within 30 days',
        // Company Information - Default values
        companyName: 'Your Company',
        companyAddress: '123 Business St, City, State 12345',
        companyPhone: '+1 (555) 123-4567',
        companyEmail: 'billing@yourcompany.com',
        companyLogo: null
      });
    }
  }, [currentInvoice, generateInvoiceNumber]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      total: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.total = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleSave = () => {
    const invoice: Invoice = {
      id: currentInvoice?.id || Date.now().toString(),
      invoiceNumber: formData.invoiceNumber,
      clientId: formData.clientId,
      issueDate: new Date(formData.issueDate),
      dueDate: new Date(formData.dueDate),
      status: formData.status,
      items: formData.items,
      subtotal: calculateSubtotal(),
      taxRate: formData.taxRate,
      total: calculateTotal(),
      notes: formData.notes,
      paymentTerms: formData.paymentTerms,
      // Company Information
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      companyPhone: formData.companyPhone,
      companyEmail: formData.companyEmail,
      companyLogo: formData.companyLogo
    };

    if (currentInvoice) {
      updateInvoice(currentInvoice.id, invoice);
    } else {
      addInvoice(invoice);
      setCurrentInvoice(invoice);
    }
    
    onClose?.();
  };

  const handleExportPDF = () => {
    const invoice: Invoice = {
      id: currentInvoice?.id || Date.now().toString(),
      invoiceNumber: formData.invoiceNumber,
      clientId: formData.clientId,
      issueDate: new Date(formData.issueDate),
      dueDate: new Date(formData.dueDate),
      status: formData.status,
      items: formData.items,
      subtotal: calculateSubtotal(),
      taxRate: formData.taxRate,
      total: calculateTotal(),
      notes: formData.notes,
      paymentTerms: formData.paymentTerms
    };

    // Get client information
    const client = clients.find(c => c.id === invoice.clientId);
    
    // Ensure we have valid client information for PDF
    const clientForPDF = client || {
      id: 'unknown',
      name: 'No Client Selected',
      email: '',
      phone: '',
      address: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active' as const
    };
    
    // Create company information from invoice data (prioritize saved data over form defaults)
    const company = {
      name: invoice.companyName || formData.companyName,
      address: invoice.companyAddress || formData.companyAddress,
      phone: invoice.companyPhone || formData.companyPhone,
      email: invoice.companyEmail || formData.companyEmail,
      logo: invoice.companyLogo || formData.companyLogo || undefined
    };

    // Generate PDF using enhanced generator
    const success = generateInvoicePDF(invoice, clientForPDF, company);

    if (success) {
      console.log(`Invoice ${invoice.invoiceNumber} PDF generated successfully`);
    } else {
      console.error('Failed to generate PDF');
      alert('Error generating PDF. Please try again.');
    }
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {currentInvoice ? 'Edit Invoice' : 'New Invoice'}
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
          <div className="flex items-center gap-2">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
            </select>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invoice Number
          </label>
          <input
            type="text"
            value={formData.invoiceNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client
          </label>
          <select
            value={formData.clientId}
            onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Date
          </label>
          <DatePicker
            value={formData.issueDate}
            onChange={(value) => setFormData(prev => ({ ...prev, issueDate: value }))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <DatePicker
            value={formData.dueDate}
            onChange={(value) => setFormData(prev => ({ ...prev, dueDate: value }))}
            className="w-full"
          />
        </div>
      </div>

      {selectedClient && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Client Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Name</p>
              <p className="text-sm text-gray-900">{selectedClient.name}</p>
            </div>
            {selectedClient.company && (
              <div>
                <p className="text-sm font-medium text-gray-700">Company</p>
                <p className="text-sm text-gray-900">{selectedClient.company}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-sm text-gray-900">{selectedClient.email}</p>
            </div>
            {selectedClient.phone && (
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-sm text-gray-900">{selectedClient.phone}</p>
              </div>
            )}
            {selectedClient.address && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-700">Address</p>
                <p className="text-sm text-gray-900">{selectedClient.address}</p>
              </div>
            )}
            {selectedClient.website && (
              <div>
                <p className="text-sm font-medium text-gray-700">Website</p>
                <a 
                  href={selectedClient.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  {selectedClient.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {selectedClient.industry && (
              <div>
                <p className="text-sm font-medium text-gray-700">Industry</p>
                <p className="text-sm text-gray-900">{selectedClient.industry}</p>
              </div>
            )}
            {selectedClient.companySize && (
              <div>
                <p className="text-sm font-medium text-gray-700">Company Size</p>
                <p className="text-sm text-gray-900 capitalize">{selectedClient.companySize}</p>
              </div>
            )}
            {selectedClient.taxId && (
              <div>
                <p className="text-sm font-medium text-gray-700">Tax ID</p>
                <p className="text-sm text-gray-900">{selectedClient.taxId}</p>
              </div>
            )}
            {selectedClient.status && (
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedClient.status === 'active' ? 'bg-green-100 text-green-800' :
                  selectedClient.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  selectedClient.status === 'prospect' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)}
                </span>
              </div>
            )}
            {selectedClient.tags && selectedClient.tags.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {selectedClient.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {selectedClient.notes && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-700">Notes</p>
                <p className="text-sm text-gray-900 mt-1">{selectedClient.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company Information Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Company Information</h3>
          <div className="flex items-center gap-2">
            {formData.companyLogo && (
              <img 
                src={formData.companyLogo} 
                alt="Company Logo" 
                className="h-8 w-8 object-contain rounded"
              />
            )}
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  const file = target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setFormData(prev => ({ ...prev, companyLogo: e.target?.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              {formData.companyLogo ? 'Change Logo' : 'Add Logo'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Company name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.companyAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Company address"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.companyPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, companyPhone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Company phone"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.companyEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, companyEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Company email"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Items</h3>
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item) => (
            <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Item description"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rate</label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Total</label>
                    <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 font-medium text-base">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-2 sm:gap-4">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Item description"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rate</label>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Total</label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 font-medium text-base text-right">
                    ${item.total.toFixed(2)}
                  </div>
                </div>
                
                <div className="sm:col-span-1 flex items-end">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-full px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Invoice['status'] }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Rate (%)
          </label>
          <input
            type="number"
            value={formData.taxRate}
            onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional notes..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Terms
          </label>
          <textarea
            value={formData.paymentTerms}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Payment terms..."
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-900">${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
            <span className="font-medium text-gray-900">${(calculateSubtotal() * formData.taxRate / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base text-gray-900">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
