import jsPDF from 'jspdf';
import type { Invoice, Client } from '../types';

export type InvoiceTemplate = 'modern' | 'classic' | 'minimal';

export const generatePDFWithTemplate = (
  invoice: Invoice, 
  client: Client | undefined, 
  template: InvoiceTemplate = 'modern'
) => {
  const doc = new jsPDF();
  
  switch (template) {
    case 'modern':
      generateModernTemplate(doc, invoice, client);
      break;
    case 'classic':
      generateClassicTemplate(doc, invoice, client);
      break;
    case 'minimal':
      generateMinimalTemplate(doc, invoice, client);
      break;
  }
  
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
};

const generateModernTemplate = (doc: jsPDF, invoice: Invoice, client: Client | undefined) => {
  // Modern template with colored header and clean layout
  doc.setFillColor(59, 130, 246); // Blue header
  doc.rect(0, 0, 210, 60, 'F');
  
  // White text on colored background
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('INVOICE', 20, 25);
  doc.setFontSize(12);
  doc.text(`#${invoice.invoiceNumber}`, 20, 35);
  
  // Invoice details in header
  doc.setFontSize(10);
  doc.text(`Date: ${invoice.issueDate.toLocaleDateString()}`, 120, 25);
  doc.text(`Due: ${invoice.dueDate.toLocaleDateString()}`, 120, 32);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 120, 39);
  
  // Reset text color for content
  doc.setTextColor(0, 0, 0);
  
  // Client info
  let yPosition = 80;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  if (client) {
    yPosition += 8;
    doc.text(client.name, 20, yPosition);
    if (client.company) {
      yPosition += 6;
      doc.text(client.company, 20, yPosition);
    }
    if (client.email) {
      yPosition += 6;
      doc.text(client.email, 20, yPosition);
    }
    if (client.address) {
      yPosition += 6;
      doc.text(client.address, 20, yPosition);
    }
  }
  
  // Items table
  yPosition += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Items', 20, yPosition);
  yPosition += 10;
  
  // Table headers
  doc.setFontSize(10);
  doc.text('Description', 20, yPosition);
  doc.text('Qty', 100, yPosition);
  doc.text('Rate', 130, yPosition);
  doc.text('Total', 170, yPosition);
  yPosition += 5;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;
  
  // Items
  doc.setFont('helvetica', 'normal');
  invoice.items.forEach(item => {
    doc.text(item.description, 20, yPosition);
    doc.text(item.quantity.toString(), 100, yPosition);
    doc.text(`$${item.rate.toFixed(2)}`, 130, yPosition);
    doc.text(`$${item.total.toFixed(2)}`, 170, yPosition);
    yPosition += 8;
  });
  
  // Totals
  yPosition += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;
  
  doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 150, yPosition);
  yPosition += 6;
  
  if (invoice.taxRate > 0) {
    const taxAmount = invoice.subtotal * (invoice.taxRate / 100);
    doc.text(`Tax (${invoice.taxRate}%): $${taxAmount.toFixed(2)}`, 150, yPosition);
    yPosition += 6;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total: $${invoice.total.toFixed(2)}`, 150, yPosition);
  
  // Notes
  if (invoice.notes || invoice.paymentTerms) {
    yPosition += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    if (invoice.notes) {
      doc.text('Notes:', 20, yPosition);
      const splitNotes = doc.splitTextToSize(invoice.notes, 170);
      doc.text(splitNotes, 20, yPosition + 5);
      yPosition += splitNotes.length * 5 + 10;
    }
    
    if (invoice.paymentTerms) {
      doc.text('Payment Terms:', 20, yPosition);
      const splitTerms = doc.splitTextToSize(invoice.paymentTerms, 170);
      doc.text(splitTerms, 20, yPosition + 5);
    }
  }
};

const generateClassicTemplate = (doc: jsPDF, invoice: Invoice, client: Client | undefined) => {
  // Classic template with traditional layout
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 105, 20, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 40);
  doc.text(`Date: ${invoice.issueDate.toLocaleDateString()}`, 20, 50);
  doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, 20, 60);
  
  // Client details on the right
  if (client) {
    doc.text('Bill To:', 120, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(client.name, 120, 50);
    doc.setFont('helvetica', 'normal');
    if (client.company) doc.text(client.company, 120, 58);
    if (client.email) doc.text(client.email, 120, 66);
    if (client.address) doc.text(client.address, 120, 74);
  }
  
  // Items with borders
  let yPosition = 100;
  doc.setDrawColor(0, 0, 0);
  doc.rect(20, yPosition - 10, 170, 10);
  doc.text('Description', 25, yPosition - 3);
  doc.text('Quantity', 80, yPosition - 3);
  doc.text('Rate', 120, yPosition - 3);
  doc.text('Total', 160, yPosition - 3);
  
  yPosition += 5;
  invoice.items.forEach(item => {
    doc.rect(20, yPosition, 170, 8);
    doc.text(item.description, 25, yPosition + 5);
    doc.text(item.quantity.toString(), 85, yPosition + 5);
    doc.text(`$${item.rate.toFixed(2)}`, 125, yPosition + 5);
    doc.text(`$${item.total.toFixed(2)}`, 165, yPosition + 5);
    yPosition += 8;
  });
  
  // Summary box
  yPosition += 10;
  doc.rect(130, yPosition, 60, 40);
  doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 135, yPosition + 10);
  if (invoice.taxRate > 0) {
    const taxAmount = invoice.subtotal * (invoice.taxRate / 100);
    doc.text(`Tax: $${taxAmount.toFixed(2)}`, 135, yPosition + 20);
  }
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: $${invoice.total.toFixed(2)}`, 135, yPosition + 30);
};

const generateMinimalTemplate = (doc: jsPDF, invoice: Invoice, client: Client | undefined) => {
  // Minimal template with lots of whitespace
  doc.setFontSize(16);
  doc.text(invoice.invoiceNumber, 20, 30);
  doc.setFontSize(10);
  doc.text(`Date: ${invoice.issueDate.toLocaleDateString()}`, 20, 40);
  doc.text(`Due: ${invoice.dueDate.toLocaleDateString()}`, 20, 48);
  
  if (client) {
    doc.text(client.name, 20, 70);
    if (client.email) doc.text(client.email, 20, 78);
  }
  
  let yPosition = 100;
  invoice.items.forEach(item => {
    doc.text(item.description, 20, yPosition);
    doc.text(`${item.quantity} × $${item.rate.toFixed(2)}`, 150, yPosition);
    doc.text(`$${item.total.toFixed(2)}`, 180, yPosition, { align: 'right' });
    yPosition += 12;
  });
  
  yPosition += 10;
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;
  
  doc.text(`Total: $${invoice.total.toFixed(2)}`, 180, yPosition, { align: 'right' });
  
  if (invoice.paymentTerms) {
    yPosition += 20;
    doc.setFontSize(9);
    doc.text(invoice.paymentTerms, 20, yPosition);
  }
};
