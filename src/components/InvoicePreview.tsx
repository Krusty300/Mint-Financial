import React, { useState } from 'react';
import { Download, Printer, Mail, Maximize2, Minimize2, Eye, Share2 } from 'lucide-react';
import type { Invoice, Client } from '../types';
import { downloadInvoicePDF } from '../utils/pdfGenerator';

interface InvoicePreviewProps {
  invoice: Invoice;
  client: Client;
  company?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  template?: 'classic' | 'modern' | 'minimal';
  showActions?: boolean;
  onPrint?: () => void;
  onDownload?: () => void;
  onEmail?: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  client,
  company = {
    name: 'Your Company',
    address: '123 Business St, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'billing@yourcompany.com'
  },
  template = 'classic',
  showActions = true,
  onPrint,
  onDownload,
  onEmail
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getTemplateStyles = () => {
    switch (template) {
      case 'modern':
        return {
          container: 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl shadow-2xl',
          header: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
          table: 'bg-white shadow-lg rounded-lg overflow-hidden',
          footer: 'bg-gray-50 border-t-2 border-gray-200'
        };
      case 'minimal':
        return {
          container: 'bg-white border border-gray-200 shadow-sm',
          header: 'bg-gray-50 border-b border-gray-200',
          table: 'bg-white border border-gray-200',
          footer: 'bg-white border-t border-gray-200'
        };
      default: // classic
        return {
          container: 'bg-white border-2 border-gray-300 shadow-lg',
          header: 'bg-gray-100 border-b-2 border-gray-300',
          table: 'bg-white border border-gray-300',
          footer: 'bg-gray-50 border-t-2 border-gray-300'
        };
    }
  };

  const styles = getTemplateStyles();

  const handleDownloadPDF = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Use enhanced mobile-compatible PDF download
      const success = downloadInvoicePDF(invoice, client, company);
      if (success) {
        console.log(`Invoice ${invoice.invoiceNumber} PDF generated successfully`);
      } else {
        console.error('Failed to generate PDF');
      }
    }
  };

  const handlePrint = () => {
    // Use the onPrint prop if provided, otherwise use default print behavior
    if (onPrint) {
      onPrint();
    } else {
      // Default print behavior - create a clean, print-optimized version of invoice
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice ${invoice.invoiceNumber}</title>
              <style>
                @page {
                  margin: 0.5in;
                  size: A4;
                }
                body {
                  font-family: 'Helvetica', 'Arial', sans-serif;
                  font-size: 12px;
                  line-height: 1.4;
                  color: #333;
                  margin: 0;
                  padding: 20px;
                }
                .invoice-header {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .invoice-title {
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 10px;
                }
                .invoice-details {
                  margin-bottom: 30px;
                }
                .invoice-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 30px;
                }
                .invoice-table th,
                .invoice-table td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
                .invoice-table th {
                  background-color: #f5f5f5;
                  font-weight: bold;
                }
                .invoice-total {
                  text-align: right;
                  font-weight: bold;
                  margin-top: 20px;
                }
                .invoice-footer {
                  margin-top: 30px;
                  text-align: center;
                  font-size: 10px;
                  color: #666;
                }
                @media print {
                  body {
                    padding: 0;
                  }
                  .no-print {
                    display: none !important;
                  }
                }
              </style>
            </head>
            <body>
              <!-- Clean invoice content only -->
            </body>
          </html>
        `);
        
        printWindow.document.close();
        
        // Wait for content to load, then print
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          
          // Close after printing (with delay for mobile)
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      }
    }
  };

  const InvoiceContent = () => (
    <div className={`${styles.container} ${isFullscreen ? 'min-h-screen' : 'max-w-4xl mx-auto'} overflow-x-auto`}>
      {/* Header */}
      <div className={`${styles.header} p-4 sm:p-6 ${template === 'modern' ? 'rounded-t-xl' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            {company.logo && (
              <img src={company.logo} alt={company.name} className="h-8 sm:h-12 mb-2" />
            )}
            <h1 className={`text-2xl sm:text-3xl font-bold ${template === 'modern' ? 'text-white' : 'text-gray-900'}`}>
              INVOICE
            </h1>
            <p className={`text-xs sm:text-sm ${template === 'modern' ? 'text-blue-100' : 'text-gray-600'}`}>
              #{invoice.invoiceNumber}
            </p>
          </div>
          <div className={`text-left sm:text-right ${template === 'modern' ? 'text-white' : 'text-gray-700'}`}>
            <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(invoice.status)}`}>
              {invoice.status.toUpperCase()}
            </div>
            <div className="mt-2 text-xs sm:text-sm space-y-1">
              <p>Date: {formatDate(invoice.issueDate)}</p>
              <p>Due: {formatDate(invoice.dueDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company & Client Information */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {/* From */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">From</h3>
            <div className="space-y-1">
              <p className="font-medium text-gray-900 text-sm sm:text-base">{company.name}</p>
              <p className="text-xs sm:text-sm text-gray-600">{company.address}</p>
              <p className="text-xs sm:text-sm text-gray-600">{company.phone}</p>
              <p className="text-xs sm:text-sm text-gray-600">{company.email}</p>
            </div>
          </div>

          {/* To */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To</h3>
            <div className="space-y-1">
              <p className="font-medium text-gray-900 text-sm sm:text-base">{client.name}</p>
              <p className="text-xs sm:text-sm text-gray-600">{client.address}</p>
              {client.phone && <p className="text-xs sm:text-sm text-gray-600">{client.phone}</p>}
              <p className="text-xs sm:text-sm text-gray-600">{client.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className={`${styles.table} overflow-x-auto`}>
          <table className="w-full min-w-full">
            <thead className={template === 'modern' ? 'bg-gray-50' : template === 'minimal' ? 'bg-gray-50' : 'bg-gray-100'}>
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Description
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                  Quantity
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                  Rate
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className={template === 'modern' ? 'divide-y divide-gray-200' : 'divide-y divide-gray-300'}>
              {invoice.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 && template === 'classic' ? 'bg-gray-50' : ''}>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                    <div className="font-medium">{item.description}</div>
                    <div className="text-xs text-gray-500 sm:hidden mt-1">
                      Qty: {item.quantity} × {formatCurrency(item.rate)}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 text-right hidden sm:table-cell">
                    {item.quantity}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 text-right hidden sm:table-cell">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal * (invoice.taxRate / 100))}</span>
            </div>
            <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`${styles.footer} p-4 sm:p-6 ${template === 'modern' ? 'rounded-b-xl' : ''}`}>
        <div className="text-center space-y-2">
          <p className="text-xs sm:text-sm text-gray-600">
            {invoice.paymentTerms || 'Payment due within 30 days. Thank you for your business!'}
          </p>
          {invoice.notes && (
            <p className="text-xs sm:text-sm text-gray-500 italic">
              Notes: {invoice.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Action Bar */}
      {showActions && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <span className="text-xs sm:text-sm font-medium text-gray-700 min-w-[50px] sm:min-w-[60px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zoom In"
              >
                <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handlePrint}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Print Invoice (Optimized for Mobile)"
              >
                <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download PDF"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={onEmail}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Email"
              >
                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share"
              >
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview */}
      <div 
        className={`overflow-auto ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900 p-4 sm:p-8' : 'border border-gray-200 rounded-lg'}`}
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
      >
        {isFullscreen && (
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-1.5 sm:p-2 bg-white text-gray-600 hover:text-gray-900 rounded-lg shadow-lg transition-colors"
              title="Exit Fullscreen"
            >
              <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
        <InvoiceContent />
      </div>
    </div>
  );
};

export default InvoicePreview;
