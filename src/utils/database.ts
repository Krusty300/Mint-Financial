import type { Invoice, Client } from '../types';
import { generateSampleData } from './sampleData';

// Local Storage Keys
const INVOICES_KEY = 'invoice-builder-invoices';
const CLIENTS_KEY = 'invoice-builder-clients';
const BACKUP_KEY = 'invoice-builder-backup';

// Initialize localStorage with default empty data
export const initDatabase = (): void => {
  if (!localStorage.getItem(INVOICES_KEY)) {
    localStorage.setItem(INVOICES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CLIENTS_KEY)) {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify([]));
  }
  
  // Auto-load sample data if empty
  const clients = getAllClients();
  const invoices = getAllInvoices();
  if (clients.length === 0 && invoices.length === 0) {
    const sampleData = generateSampleData();
    
    sampleData.clients.forEach((client: Client) => saveClient(client));
    sampleData.invoices.forEach((invoice: Invoice) => saveInvoice(invoice));
  }
};

// Client operations
export const saveClient = (client: Client): void => {
  const clients = getAllClients();
  const existingIndex = clients.findIndex(c => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = client;
  } else {
    clients.push(client);
  }
  
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  backupToLocalStorage();
};

export const getClient = (id: string): Client | undefined => {
  const clients = getAllClients();
  return clients.find(client => client.id === id);
};

export const getAllClients = (): Client[] => {
  try {
    const data = localStorage.getItem(CLIENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading clients:', error);
    return [];
  }
};

export const deleteClient = (id: string): void => {
  const clients = getAllClients();
  const filteredClients = clients.filter(client => client.id !== id);
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(filteredClients));
  backupToLocalStorage();
};

// Invoice operations
export const saveInvoice = (invoice: Invoice): void => {
  const invoices = getAllInvoices();
  const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
  
  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.push(invoice);
  }
  
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  backupToLocalStorage();
};

export const getInvoice = (id: string): Invoice | undefined => {
  const invoices = getAllInvoices();
  const invoice = invoices.find(inv => inv.id === id);
  
  if (invoice) {
    // Convert date strings back to Date objects
    return {
      ...invoice,
      issueDate: new Date(invoice.issueDate),
      dueDate: new Date(invoice.dueDate)
    };
  }
  
  return undefined;
};

export const getAllInvoices = (): Invoice[] => {
  try {
    const data = localStorage.getItem(INVOICES_KEY);
    const invoices = data ? JSON.parse(data) : [];
    
    // Convert date strings back to Date objects
    return invoices.map((invoice: any) => ({
      ...invoice,
      issueDate: new Date(invoice.issueDate),
      dueDate: new Date(invoice.dueDate)
    }));
  } catch (error) {
    console.error('Error loading invoices:', error);
    return [];
  }
};

export const deleteInvoice = (id: string): void => {
  const invoices = getAllInvoices();
  const filteredInvoices = invoices.filter(invoice => invoice.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(filteredInvoices));
  backupToLocalStorage();
};

// Export/Import functions
export const exportData = (): { invoices: Invoice[], clients: Client[] } => {
  return {
    invoices: getAllInvoices(),
    clients: getAllClients()
  };
};

export const importData = (data: { invoices?: Invoice[], clients?: Client[] }): void => {
  if (data.invoices) {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(data.invoices));
  }
  if (data.clients) {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(data.clients));
  }
  backupToLocalStorage();
};

export const backupToLocalStorage = (): void => {
  const data = exportData();
  localStorage.setItem(BACKUP_KEY, JSON.stringify(data));
};

export const restoreFromLocalStorage = (): boolean => {
  const backup = localStorage.getItem(BACKUP_KEY);
  if (!backup) return false;
  
  try {
    const data = JSON.parse(backup);
    importData(data);
    return true;
  } catch (error) {
    console.error('Failed to restore from localStorage:', error);
    return false;
  }
};

export const downloadBackup = (): void => {
  const data = exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-builder-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importFromCSV = (csvText: string): { invoices?: Invoice[], clients?: Client[] } => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const isInvoices = headers.includes('invoice_number');
  const result: { invoices?: Invoice[], clients?: Client[] } = {};
  
  if (isInvoices) {
    result.invoices = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const invoice: Invoice = {
        id: values[headers.indexOf('id')] || Date.now().toString(),
        invoiceNumber: values[headers.indexOf('invoice_number')] || '',
        clientId: values[headers.indexOf('client_id')] || '',
        issueDate: new Date(values[headers.indexOf('issue_date')] || Date.now()),
        dueDate: new Date(values[headers.indexOf('due_date')] || Date.now()),
        status: (values[headers.indexOf('status')] || 'draft') as Invoice['status'],
        items: [],
        subtotal: parseFloat(values[headers.indexOf('subtotal')] || '0'),
        taxRate: parseFloat(values[headers.indexOf('tax_rate')] || '0'),
        total: parseFloat(values[headers.indexOf('total')] || '0'),
        notes: values[headers.indexOf('notes')] || '',
        paymentTerms: values[headers.indexOf('payment_terms')] || ''
      };
      result.invoices.push(invoice);
    }
  } else {
    result.clients = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const client: Client = {
        id: values[headers.indexOf('id')] || Date.now().toString(),
        name: values[headers.indexOf('name')] || '',
        email: values[headers.indexOf('email')] || '',
        phone: values[headers.indexOf('phone')] || '',
        address: values[headers.indexOf('address')] || '',
        company: values[headers.indexOf('company')] || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      result.clients.push(client);
    }
  }
  
  return result;
};
