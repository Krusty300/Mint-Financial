import jsPDF from 'jspdf';
import type { Invoice, Client } from '../types';

export const generatePDF = (invoice: Invoice, client: Client, company?: {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
}) => {
  const doc = new jsPDF();
  
  // Set up the document
  doc.setFont('helvetica');
  
  // Add company header with logo
  if (company?.logo) {
    try {
      // Add logo to the left side
      doc.addImage(company.logo, 'PNG', 20, 15, 40, 20);
      // Company name next to logo
      doc.setFontSize(20);
      doc.text(company.name || 'Your Company', 70, 25);
    } catch (error) {
      console.warn('Failed to add logo to PDF:', error);
      // Fallback to text-only header
      doc.setFontSize(24);
      doc.text(company?.name || 'Your Company', 105, 20, { align: 'center' });
    }
  } else {
    // Text-only header when no logo
    doc.setFontSize(24);
    doc.text(company?.name || 'Your Company', 105, 20, { align: 'center' });
  }
  
  doc.setFontSize(16);
  doc.text('INVOICE', 105, company?.logo ? 45 : 30, { align: 'center' });
  
  // Add invoice details in two columns
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Details:', 20, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Number: ${invoice.invoiceNumber}`, 20, 57);
  doc.text(`Date: ${invoice.issueDate.toLocaleDateString()}`, 20, 64);
  doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, 20, 71);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 78);
  
  // Add company details
  if (company) {
    const companyY = company?.logo ? 60 : 50;
    doc.setFont('helvetica', 'bold');
    doc.text('From:', 120, companyY);
    doc.setFont('helvetica', 'normal');
    doc.text(company.name, 120, companyY + 7);
    doc.text(company.address, 120, companyY + 14);
    doc.text(company.phone, 120, companyY + 21);
    doc.text(company.email, 120, companyY + 28);
  }
  
  // Add client details
  let yPosition = company?.logo ? 105 : 95;
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  
  // Always display client information, even if minimal
  yPosition += 7;
  doc.text(client.name || 'N/A', 20, yPosition);
  yPosition += 5;
  
  if (client.email && client.email.trim()) {
    doc.text(client.email, 20, yPosition);
    yPosition += 5;
  }
  
  if (client.phone && client.phone.trim()) {
    doc.text(client.phone, 20, yPosition);
    yPosition += 5;
  }
  
  if (client.address && client.address.trim()) {
    doc.text(client.address, 20, yPosition);
    yPosition += 5;
  }
  
  // Add additional client fields if they exist
  if (client.taxId && client.taxId.trim()) {
    doc.text(`Tax ID: ${client.taxId}`, 20, yPosition);
    yPosition += 5;
  }
  
  if (client.website && client.website.trim()) {
    doc.text(`Website: ${client.website}`, 20, yPosition);
    yPosition += 5;
  }
  
  // Add items table
  yPosition += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Items & Services', 20, yPosition);
  yPosition += 8;
  
  // Table headers
  doc.setFontSize(9);
  doc.text('Description', 20, yPosition);
  doc.text('Quantity', 100, yPosition);
  doc.text('Rate', 130, yPosition);
  doc.text('Total', 170, yPosition);
  yPosition += 5;
  
  // Draw line
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 7;
  
  // Add items
  doc.setFontSize(8);
  invoice.items.forEach(item => {
    // Handle long descriptions
    const description = item.description.length > 40 ? 
      item.description.substring(0, 40) + '...' : 
      item.description;
    
    doc.text(description, 20, yPosition);
    doc.text(item.quantity.toString(), 100, yPosition);
    doc.text(`$${item.rate.toFixed(2)}`, 130, yPosition);
    doc.text(`$${item.total.toFixed(2)}`, 170, yPosition);
    yPosition += 6;
  });
  
  // Add totals
  yPosition += 10;
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 140, yPosition);
  yPosition += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 140, yPosition);
  yPosition += 6;
  
  if (invoice.taxRate > 0) {
    const taxAmount = invoice.subtotal * (invoice.taxRate / 100);
    doc.text(`Tax (${invoice.taxRate}%): $${taxAmount.toFixed(2)}`, 140, yPosition);
    yPosition += 6;
  }
  
  // Draw total line
  doc.line(130, yPosition + 2, 190, yPosition + 2);
  yPosition += 6;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: $${invoice.total.toFixed(2)}`, 140, yPosition);
  
  // Add notes and payment terms
  if (invoice.notes || invoice.paymentTerms) {
    yPosition += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    if (invoice.notes) {
      doc.text('Notes:', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(invoice.notes, 170);
      splitNotes.forEach((line: string, index: number) => {
        doc.text(line, 20, yPosition + 5 + (index * 5));
      });
      yPosition += splitNotes.length * 5 + 10;
    }
    
    if (invoice.paymentTerms) {
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Terms:', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      const splitTerms = doc.splitTextToSize(invoice.paymentTerms, 170);
      splitTerms.forEach((line: string, index: number) => {
        doc.text(line, 20, yPosition + 5 + (index * 5));
      });
    }
  }
  
  // Add footer
  const footerY = 280;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business!', 105, footerY, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, footerY + 5, { align: 'center' });
  
  // Save the PDF with mobile-compatible download
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Create download link
  const downloadLink = document.createElement('a');
  downloadLink.href = pdfUrl;
  downloadLink.download = `invoice-${invoice.invoiceNumber}.pdf`;
  
  // Trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
};

export const generateInvoicePDF = (
  invoice: Invoice, 
  client: Client, 
  company?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  }
) => {
  try {
    generatePDF(invoice, client, company);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// Alternative function for better mobile compatibility
export const downloadInvoicePDF = (
  invoice: Invoice, 
  client: Client, 
  company?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  }
) => {
  try {
    generatePDF(invoice, client, company);
    
    // Additional mobile compatibility check
    // Try to open in new tab if download doesn't work
    if (navigator.userAgent.includes('Mobile') || navigator.userAgent.includes('Android')) {
      const pdfBlob = new jsPDF().output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Try to open in new tab as fallback
      window.open(pdfUrl, '_blank');
      
      // Clean up after a delay
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
    }
    
    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    
    // Show user-friendly error message for mobile
    if (navigator.userAgent.includes('Mobile') || navigator.userAgent.includes('Android')) {
      alert('PDF download failed. Please try again or use a desktop browser for better compatibility.');
    }
    
    return false;
  }
};
