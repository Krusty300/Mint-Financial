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
  doc.setFontSize(12);
  doc.text('Bill To:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Always display client information, even if minimal
  yPosition += 7;
  
  // Helper function to wrap text for mobile-friendly PDF
  const wrapText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };
  
  doc.text(wrapText(client.name || 'N/A', 45), 20, yPosition);
  yPosition += 6;
  
  if (client.company && client.company.trim()) {
    doc.text(wrapText(client.company, 45), 20, yPosition);
    yPosition += 6;
  }
  
  if (client.email && client.email.trim()) {
    doc.text(wrapText(client.email, 45), 20, yPosition);
    yPosition += 6;
  }
  
  if (client.phone && client.phone.trim()) {
    doc.text(wrapText(client.phone, 45), 20, yPosition);
    yPosition += 6;
  }
  
  if (client.address && client.address.trim()) {
    // Handle longer addresses by breaking into lines
    const address = client.address;
    const maxLineLength = 45;
    if (address.length > maxLineLength) {
      const words = address.split(' ');
      let currentLine = '';
      for (const word of words) {
        if ((currentLine + word).length > maxLineLength) {
          doc.text(currentLine, 20, yPosition);
          yPosition += 5;
          currentLine = word + ' ';
        } else {
          currentLine += word + ' ';
        }
      }
      if (currentLine.trim()) {
        doc.text(currentLine.trim(), 20, yPosition);
        yPosition += 5;
      }
    } else {
      doc.text(address, 20, yPosition);
      yPosition += 6;
    }
  }
  
  // Add additional client fields if they exist
  if (client.website && client.website.trim()) {
    doc.text(`Website: ${wrapText(client.website, 35)}`, 20, yPosition);
    yPosition += 6;
  }
  
  if (client.industry && client.industry.trim()) {
    doc.text(`Industry: ${wrapText(client.industry, 35)}`, 20, yPosition);
    yPosition += 6;
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
  
  // Save PDF with mobile-compatible download
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Try multiple download methods for mobile compatibility
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Mobile-specific download approach
    try {
      // Method 1: Direct download with mobile-friendly approach
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = `invoice-${invoice.invoiceNumber}.pdf`;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      
      // Force click with mobile compatibility
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      downloadLink.dispatchEvent(event);
      
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(pdfUrl);
      }, 1000);
      
      return;
    } catch (error) {
      console.warn('Mobile download method 1 failed:', error);
    }
    
    try {
      // Method 2: Open in new tab with download prompt
      window.open(pdfUrl, '_blank');
      
      // Show user instruction
      setTimeout(() => {
        alert('PDF opened in new tab. Use browser menu to save/download the PDF.');
        URL.revokeObjectURL(pdfUrl);
      }, 500);
      
      return;
    } catch (error) {
      console.warn('Mobile download method 2 failed:', error);
    }
  }
  
  // Desktop fallback (original method)
  try {
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.download = `invoice-${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
  } catch (error) {
    console.error('Desktop download failed:', error);
    // Final fallback - open in new tab
    window.open(pdfUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
  }
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
    const doc = new jsPDF();
    
    // Generate PDF content (copy from generatePDF function)
    generatePDFContent(doc, invoice, client, company);
    
    // Create blob
    const pdfBlob = doc.output('blob');
    
    // Check if running on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobile-specific approach
      try {
        if (isIOS) {
          // iOS-specific download approach
          console.log('iOS detected, using iOS-specific download method');
          
          // Create PDF URL for iOS
          const iosPdfUrl = URL.createObjectURL(pdfBlob);
          
          // Method 1: Try direct download with iOS-specific handling
          const downloadLink = document.createElement('a');
          downloadLink.href = iosPdfUrl;
          downloadLink.download = `invoice-${invoice.invoiceNumber}.pdf`;
          downloadLink.style.display = 'none';
          downloadLink.setAttribute('target', '_blank');
          document.body.appendChild(downloadLink);
          
          // iOS-specific click event
          const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false
          });
          downloadLink.dispatchEvent(event);
          
          // iOS-specific delay and cleanup
          setTimeout(() => {
            try {
              document.body.removeChild(downloadLink);
            } catch (e) {
              console.log('iOS download link already removed');
            }
            URL.revokeObjectURL(iosPdfUrl);
          }, 1000);
          
          // Show iOS-specific success message
          showMobileSuccessMessage('PDF download started! Check your Downloads folder.');
          
        } else if (navigator.share && navigator.canShare && navigator.canShare({ 
          files: [new File([pdfBlob], `invoice-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' })] 
        })) {
          // Method 2: Try Web Share API for non-iOS mobile
          console.log('Web Share API available, trying share method');
          const file = new File([pdfBlob], `invoice-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });
          
          navigator.share({
            title: `Invoice ${invoice.invoiceNumber}`,
            text: `Invoice ${invoice.invoiceNumber} for ${client.name}`,
            files: [file]
          }).then(() => {
            console.log('PDF shared successfully via Web Share API');
            showMobileSuccessMessage('PDF shared successfully!');
          }).catch((error) => {
            console.warn('Web Share API failed, trying direct download:', error);
            fallbackMobileDownload(pdfBlob, invoice.invoiceNumber);
          });
        } else {
          // Method 3: Direct download for other mobile
          console.log('Using direct download method for non-iOS mobile');
          fallbackMobileDownload(pdfBlob, invoice.invoiceNumber);
        }
      } catch (error) {
        console.error('Mobile download failed:', error);
        fallbackToNewTab(URL.createObjectURL(pdfBlob));
      }
    } else {
      // Desktop approach
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
    }
    
    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    
    // Show user-friendly error message for mobile
    if (navigator.userAgent.includes('Mobile') || navigator.userAgent.includes('Android')) {
      alert('PDF generation failed. Please try again or use a desktop browser.');
    }
    
    return false;
  }
};

// Helper function for mobile success messages
const showMobileSuccessMessage = (message: string) => {
  const successMsg = document.createElement('div');
  successMsg.textContent = message;
  successMsg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 9999;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(successMsg);
  
  setTimeout(() => {
    if (document.body.contains(successMsg)) {
      document.body.removeChild(successMsg);
    }
  }, 3000);
};

// Helper function for mobile download fallback
const fallbackMobileDownload = (pdfBlob: Blob, invoiceNumber: string) => {
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  try {
    // Method 1: Try direct download with extended delay
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.download = `invoice-${invoiceNumber}.pdf`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    
    // Force click with mobile compatibility
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    downloadLink.dispatchEvent(event);
    
    // Extended delay to allow download to complete
    setTimeout(() => {
      try {
        document.body.removeChild(downloadLink);
      } catch (e) {
        console.log('Link already removed or not found');
      }
      URL.revokeObjectURL(pdfUrl);
    }, 2000);
    
    // Check if download was successful after longer delay
    setTimeout(() => {
      // Try alternative method if needed
      console.log('Checking download status...');
      fallbackToNewTab(pdfUrl);
    }, 3000);
    
  } catch (error) {
    console.warn('Direct download failed, opening in new tab');
    fallbackToNewTab(pdfUrl);
  }
};

// Separate function for new tab fallback
const fallbackToNewTab = (pdfUrl: string) => {
  window.open(pdfUrl, '_blank');
  
  setTimeout(() => {
    alert('PDF opened in new tab. Use browser menu to save/download the PDF.\n\nOn mobile:\n1. Tap the PDF\n2. Look for download/share icon\n3. Save to device');
    URL.revokeObjectURL(pdfUrl);
  }, 500);
};

// Helper function to generate PDF content (extracted from generatePDF)
const generatePDFContent = (doc: any, invoice: Invoice, client: Client, company?: any) => {
  // Set up document
  doc.setFont('helvetica');
  
  // Add company header with logo
  if (company?.logo) {
    try {
      doc.addImage(company.logo, 'PNG', 20, 15, 40, 20);
      doc.setFontSize(20);
      doc.text(company.name || 'Your Company', 70, 25);
    } catch (error) {
      console.warn('Failed to add logo to PDF:', error);
      doc.setFontSize(24);
      doc.text(company?.name || 'Your Company', 105, 20, { align: 'center' });
    }
  } else {
    doc.setFontSize(24);
    doc.text(company?.name || 'Your Company', 105, 20, { align: 'center' });
  }
  
  doc.setFontSize(16);
  doc.text('INVOICE', 105, company?.logo ? 45 : 30, { align: 'center' });
  
  // Add invoice details
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
  doc.setFontSize(12);
  doc.text('Bill To:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  yPosition += 7;
  
  // Helper function to wrap text for mobile-friendly PDF
  const wrapText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };
  
  doc.text(wrapText(client.name || 'N/A', 45), 20, yPosition);
  yPosition += 6;
  
  if (client.company && client.company.trim()) {
    doc.text(wrapText(client.company, 45), 20, yPosition);
    yPosition += 6;
  }
  
  if (client.email && client.email.trim()) {
    doc.text(wrapText(client.email, 45), 20, yPosition);
    yPosition += 6;
  }
  
  if (client.phone && client.phone.trim()) {
    doc.text(wrapText(client.phone, 45), 20, yPosition);
    yPosition += 6;
  }
  
  if (client.address && client.address.trim()) {
    // Handle longer addresses by breaking into lines
    const address = client.address;
    const maxLineLength = 45;
    if (address.length > maxLineLength) {
      const words = address.split(' ');
      let currentLine = '';
      for (const word of words) {
        if ((currentLine + word).length > maxLineLength) {
          doc.text(currentLine, 20, yPosition);
          yPosition += 5;
          currentLine = word + ' ';
        } else {
          currentLine += word + ' ';
        }
      }
      if (currentLine.trim()) {
        doc.text(currentLine.trim(), 20, yPosition);
        yPosition += 5;
      }
    } else {
      doc.text(address, 20, yPosition);
      yPosition += 6;
    }
  }
  
  // Add additional client fields if they exist
  if (client.website && client.website.trim()) {
    doc.text(`Website: ${wrapText(client.website, 35)}`, 20, yPosition);
    yPosition += 6;
  }
  
  if (client.industry && client.industry.trim()) {
    doc.text(`Industry: ${wrapText(client.industry, 35)}`, 20, yPosition);
    yPosition += 6;
  }
  
  
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
};
