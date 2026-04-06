import { create } from 'zustand';
import type { Invoice, Client } from '../types';

// Module-level variable to track last export time
let lastExportTime = 0;

import { 
  initDatabase, 
  saveInvoice, 
  getInvoice, 
  getAllInvoices, 
  deleteInvoice,
  saveClient, 
  getClient, 
  getAllClients, 
  deleteClient,
  backupToLocalStorage,
  restoreFromLocalStorage
} from '../utils/database';

// Initialize database on import
initDatabase();

interface InvoiceStore {
  invoices: Invoice[];
  clients: Client[];
  currentInvoice: Invoice | null;
  
  loadData: () => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  setCurrentInvoice: (invoice: Invoice | null) => void;
  duplicateInvoice: (id: string) => void;
  
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  generateInvoiceNumber: () => string;
  backupData: () => void;
  restoreData: () => boolean;
  exportData: () => void;
  importData: (file: File) => Promise<boolean>;
  importDataDirect: (data: { invoices?: Invoice[], clients?: Client[] }) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => {
  // Initialize with data from localStorage
  const loadData = () => {
    const currentState = get();
    set({
      invoices: getAllInvoices(),
      clients: getAllClients(),
      // Preserve currentInvoice when loading data
      currentInvoice: currentState.currentInvoice,
    });
  };

  return {
    invoices: getAllInvoices(),
    clients: getAllClients(),
    currentInvoice: null,
    
    loadData,
    
    addInvoice: (invoice) => {
      saveInvoice(invoice);
      set((state) => ({
        ...state,
        invoices: [...state.invoices, invoice]
      }));
    },
    
    updateInvoice: (id, updates) => {
      const current = getInvoice(id);
      if (current) {
        const updated = { ...current, ...updates };
        saveInvoice(updated);
        set((state) => ({
          ...state,
          invoices: state.invoices.map(inv => 
            inv.id === id ? updated : inv
          ),
          currentInvoice: state.currentInvoice?.id === id 
            ? { ...state.currentInvoice, ...updates } 
            : state.currentInvoice
        }));
      }
    },
    
    deleteInvoice: (id) => {
      deleteInvoice(id);
      set((state) => ({
        ...state,
        invoices: state.invoices.filter(inv => inv.id !== id),
        currentInvoice: state.currentInvoice?.id === id ? null : state.currentInvoice
      }));
    },
    
    setCurrentInvoice: (invoice) => set({ currentInvoice: invoice }),
    
    duplicateInvoice: (id) => {
      const { invoices, generateInvoiceNumber } = get();
      const originalInvoice = invoices.find(inv => inv.id === id);
      
      if (originalInvoice) {
        const duplicatedInvoice: Invoice = {
          ...originalInvoice,
          id: Date.now().toString(),
          invoiceNumber: generateInvoiceNumber(),
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'draft'
        };
        
        saveInvoice(duplicatedInvoice);
        set((state) => ({
          ...state,
          invoices: [...state.invoices, duplicatedInvoice]
        }));
      }
    },
    
    addClient: (client) => {
      saveClient(client);
      set((state) => ({
        ...state,
        clients: [...state.clients, client]
      }));
    },
    
    updateClient: (id, updates) => {
      const current = getClient(id);
      if (current) {
        const updated = { ...current, ...updates };
        saveClient(updated);
        set((state) => ({
          ...state,
          clients: state.clients.map(client => 
            client.id === id ? updated : client
          )
        }));
      }
    },
    
    deleteClient: (id) => {
      deleteClient(id);
      set((state) => ({
        ...state,
        clients: state.clients.filter(client => client.id !== id)
      }));
    },
    
    generateInvoiceNumber: () => {
      const { invoices } = get();
      const lastInvoice = invoices[invoices.length - 1];
      const lastNumber = lastInvoice ? 
        parseInt(lastInvoice.invoiceNumber.replace(/\D/g, '')) : 0;
      return `INV-${String(lastNumber + 1).padStart(4, '0')}`;
    },
    
    backupData: () => {
      backupToLocalStorage();
    },
    
    restoreData: () => {
      const success = restoreFromLocalStorage();
      if (success) {
        loadData();
      }
      return success;
    },
    
    exportData: () => {
      // Prevent multiple rapid exports
      const now = Date.now();
      if (lastExportTime && now - lastExportTime < 1000) {
        return;
      }
      lastExportTime = now;
      
      const data = {
        invoices: getAllInvoices(),
        clients: getAllClients()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-builder-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    importData: async (file: File): Promise<boolean> => {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Validate and import data
        if (data.invoices && Array.isArray(data.invoices)) {
          data.invoices.forEach((inv: any) => {
            const invoice: Invoice = {
              ...inv,
              issueDate: new Date(inv.issueDate),
              dueDate: new Date(inv.dueDate)
            };
            saveInvoice(invoice);
          });
        }
        
        if (data.clients && Array.isArray(data.clients)) {
          data.clients.forEach((client: Client) => {
            saveClient(client);
          });
        }
        
        loadData();
        return true;
      } catch (error) {
        console.error('Failed to import data:', error);
        return false;
      }
    },
    
    importDataDirect: (data: { invoices?: Invoice[], clients?: Client[] }) => {
      // Validate and import data
      if (data.invoices && Array.isArray(data.invoices)) {
        data.invoices.forEach((inv: any) => {
          const invoice: Invoice = {
            ...inv,
            issueDate: new Date(inv.issueDate),
            dueDate: new Date(inv.dueDate)
          };
          saveInvoice(invoice);
        });
      }
      
      if (data.clients && Array.isArray(data.clients)) {
        data.clients.forEach((client: Client) => {
          saveClient(client);
        });
      }
      
      loadData();
    }
  };
});
