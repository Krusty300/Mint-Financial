import { create } from 'zustand';
import type { Client, ClientDocument, Communication, Feedback, ClientPortal, ClientHealthMetrics } from '../types/crm';
import { generateCRMSampleData } from '../utils/crmSampleData';

// Initialize with sample data if localStorage is empty
const initializeCRMData = () => {
  const storedClients = localStorage.getItem('crm-clients');
  const storedDocuments = localStorage.getItem('crm-documents');
  const storedCommunications = localStorage.getItem('crm-communications');
  const storedFeedback = localStorage.getItem('crm-feedback');
  const storedPortals = localStorage.getItem('crm-portals');
  
  if (!storedClients && !storedDocuments && !storedCommunications && !storedFeedback && !storedPortals) {
    const sampleData = generateCRMSampleData();
    
    localStorage.setItem('crm-clients', JSON.stringify(sampleData.clients));
    localStorage.setItem('crm-documents', JSON.stringify(sampleData.documents));
    localStorage.setItem('crm-communications', JSON.stringify(sampleData.communications));
    localStorage.setItem('crm-feedback', JSON.stringify(sampleData.feedback));
    localStorage.setItem('crm-portals', JSON.stringify(sampleData.portals));
  }
};

// Initialize CRM data
initializeCRMData();

interface CRMState {
  clients: Client[];
  selectedClient: Client | null;
  clientPortals: ClientPortal[];
  documents: ClientDocument[];
  communications: Communication[];
  feedback: Feedback[];
  isLoading: boolean;
  searchTerm: string;
  filterSegment: 'all' | 'vip' | 'regular' | 'at-risk' | 'dormant';
  filterStatus: 'all' | 'active' | 'inactive' | 'prospect';
  sortBy: 'name' | 'revenue' | 'healthScore' | 'lastActivity' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

interface CRMActions extends CRMState {
  // Client Management
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  selectClient: (client: Client | null) => void;
  
  // Document Management
  addDocument: (document: Omit<ClientDocument, 'id' | 'uploadedAt'>) => void;
  updateDocument: (id: string, updates: Partial<ClientDocument>) => void;
  deleteDocument: (id: string) => void;
  
  // Communication Management
  addCommunication: (communication: Omit<Communication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCommunication: (id: string, updates: Partial<Communication>) => void;
  deleteCommunication: (id: string) => void;
  
  // Feedback Management
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFeedback: (id: string, updates: Partial<Feedback>) => void;
  deleteFeedback: (id: string) => void;
  
  // Portal Management
  createClientPortal: (clientId: string) => string;
  updateClientPortal: (accessCode: string, updates: Partial<ClientPortal>) => void;
  deactivateClientPortal: (accessCode: string) => void;
  
  // Search and Filter
  setSearchTerm: (term: string) => void;
  setFilterSegment: (segment: 'all' | 'vip' | 'regular' | 'at-risk' | 'dormant') => void;
  setFilterStatus: (status: 'all' | 'active' | 'inactive' | 'prospect') => void;
  setSortBy: (sortBy: 'name' | 'revenue' | 'healthScore' | 'lastActivity' | 'createdAt') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  
  // Bulk Operations
  bulkUpdateClients: (clientIds: string[], updates: Partial<Client>) => void;
  bulkDeleteClients: (clientIds: string[]) => void;
  
  // Data Operations
  loadClients: () => Promise<void>;
  saveClients: () => Promise<void>;
  exportClients: (format: 'json' | 'csv') => void;
  importClients: (data: any[]) => Promise<void>;
}

// Load data from localStorage
const loadFromLocalStorage = () => {
  try {
    const clients = JSON.parse(localStorage.getItem('crm-clients') || '[]');
    const documents = JSON.parse(localStorage.getItem('crm-documents') || '[]');
    const communications = JSON.parse(localStorage.getItem('crm-communications') || '[]');
    const feedback = JSON.parse(localStorage.getItem('crm-feedback') || '[]');
    const portals = JSON.parse(localStorage.getItem('crm-portals') || '[]');
    
    return {
      clients: clients.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt), lastActivity: new Date(c.lastActivity) })),
      documents: documents.map((d: any) => ({ ...d, uploadedAt: new Date(d.uploadedAt) })),
      communications: communications.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) })),
      feedback: feedback.map((f: any) => ({ ...f, createdAt: new Date(f.createdAt), updatedAt: new Date(f.updatedAt) })),
      portals: portals.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt), lastLogin: new Date(p.lastLogin), expiresAt: new Date(p.expiresAt) }))
    };
  } catch (error) {
    console.error('Error loading CRM data from localStorage:', error);
    return {
      clients: [],
      documents: [],
      communications: [],
      feedback: [],
      portals: []
    };
  }
};

const initialData = loadFromLocalStorage();

export const useCRMStore = create<CRMState & CRMActions>((set, get) => ({
  // Initial State
  clients: initialData.clients,
  selectedClient: null,
  clientPortals: initialData.portals,
  documents: initialData.documents,
  communications: initialData.communications,
  feedback: initialData.feedback,
  isLoading: false,
  searchTerm: '',
  filterSegment: 'all',
  filterStatus: 'all',
  sortBy: 'name',
  sortOrder: 'asc',

  // Client Management
  addClient: (clientData) => {
    const newClient: Client = {
      ...clientData,
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalInvoices: 0,
      paidInvoices: 0,
      unpaidInvoices: 0,
      averagePaymentTime: 0,
      satisfactionScore: 0,
      lastActivity: new Date(),
      notes: [],
      tags: [],
      documents: [],
      communications: [],
      feedback: [],
    };
    
    set(state => {
      const updatedClients = [...state.clients, newClient];
      localStorage.setItem('crm-clients', JSON.stringify(updatedClients));
      return {
        ...state,
        clients: updatedClients,
      };
    });
  },

  updateClient: (id, updates) => {
    set(state => {
      const updatedClients = state.clients.map(client =>
        client.id === id ? { ...client, ...updates, updatedAt: new Date() } : client
      );
      localStorage.setItem('crm-clients', JSON.stringify(updatedClients));
      return {
        ...state,
        clients: updatedClients,
        selectedClient: state.selectedClient?.id === id ? { ...state.selectedClient, ...updates } : state.selectedClient,
      };
    });
  },

  deleteClient: (id) => {
    set(state => {
      const updatedClients = state.clients.filter(client => client.id !== id);
      localStorage.setItem('crm-clients', JSON.stringify(updatedClients));
      return {
        ...state,
        clients: updatedClients,
        selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
      };
    });
  },

  selectClient: (client) => {
    set({ selectedClient: client });
  },

  // Document Management
  addDocument: (documentData) => {
    const newDocument: ClientDocument = {
      ...documentData,
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: new Date(),
    };
    
    set(state => ({
      ...state,
      documents: [...state.documents, newDocument],
    }));
  },

  updateDocument: (id, updates) => {
    set(state => ({
      ...state,
      documents: state.documents.map(doc =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    }));
  },

  deleteDocument: (id) => {
    set(state => ({
      ...state,
      documents: state.documents.filter(doc => doc.id !== id),
    }));
  },

  // Communication Management
  addCommunication: (communicationData) => {
    const newCommunication: Communication = {
      ...communicationData,
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set(state => ({
      ...state,
      communications: [...state.communications, newCommunication],
    }));
  },

  updateCommunication: (id, updates) => {
    set(state => ({
      ...state,
      communications: state.communications.map(comm =>
        comm.id === id ? { ...comm, ...updates, updatedAt: new Date() } : comm
      ),
    }));
  },

  deleteCommunication: (id) => {
    set(state => ({
      ...state,
      communications: state.communications.filter(comm => comm.id !== id),
    }));
  },

  // Feedback Management
  addFeedback: (feedbackData) => {
    const newFeedback: Feedback = {
      ...feedbackData,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set(state => ({
      ...state,
      feedback: [...state.feedback, newFeedback],
    }));
  },

  updateFeedback: (id, updates) => {
    set(state => ({
      ...state,
      feedback: state.feedback.map(item =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
      ),
    }));
  },

  deleteFeedback: (id) => {
    set(state => ({
      ...state,
      feedback: state.feedback.filter(item => item.id !== id),
    }));
  },

  // Portal Management
  createClientPortal: (clientId) => {
    const accessCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    const newPortal: ClientPortal = {
      clientId,
      accessCode,
      isActive: true,
      permissions: ['view_invoices', 'download_invoices', 'make_payment', 'view_documents', 'send_message', 'provide_feedback'],
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        timezone: 'UTC',
      },
    };
    
    set(state => ({
      ...state,
      clientPortals: [...state.clientPortals, newPortal],
    }));
    
    return accessCode;
  },

  updateClientPortal: (accessCode, updates) => {
    set(state => ({
      ...state,
      clientPortals: state.clientPortals.map(portal =>
        portal.accessCode === accessCode ? { ...portal, ...updates } : portal
      ),
    }));
  },

  deactivateClientPortal: (accessCode) => {
    set(state => ({
      ...state,
      clientPortals: state.clientPortals.map(portal =>
        portal.accessCode === accessCode ? { ...portal, isActive: false } : portal
      ),
    }));
  },

  // Search and Filter
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setFilterSegment: (segment: 'all' | 'vip' | 'regular' | 'at-risk' | 'dormant') => set({ filterSegment: segment }),
  setFilterStatus: (status: 'all' | 'active' | 'inactive' | 'prospect') => set({ filterStatus: status }),
  setSortBy: (sortBy: 'name' | 'revenue' | 'healthScore' | 'lastActivity' | 'createdAt') => set({ sortBy }),
  setSortOrder: (sortOrder: 'asc' | 'desc') => set({ sortOrder }),

  // Bulk Operations
  bulkUpdateClients: (clientIds, updates) => {
    set(state => ({
      ...state,
      clients: state.clients.map(client =>
        clientIds.includes(client.id) ? { ...client, ...updates, updatedAt: new Date() } : client
      ),
    }));
  },

  bulkDeleteClients: (clientIds) => {
    set(state => ({
      ...state,
      clients: state.clients.filter(client => !clientIds.includes(client.id)),
    }));
  },

  // Data Operations
  loadClients: async () => {
    set({ isLoading: true });
    try {
      // Load from localStorage
      const savedClients = localStorage.getItem('crm_clients');
      if (savedClients) {
        const clients = JSON.parse(savedClients);
        set({ clients, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      set({ isLoading: false });
    }
  },

  saveClients: async () => {
    try {
      localStorage.setItem('crm_clients', JSON.stringify(get().clients));
    } catch (error) {
      console.error('Error saving clients:', error);
    }
  },

  exportClients: (format: 'json' | 'csv') => {
    const clients = get().clients;
    
    if (format === 'json') {
      const dataStr = JSON.stringify(clients, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `crm_clients_${new Date().toISOString().split('T')[0]}.json`);
      linkElement.click();
    } else if (format === 'csv') {
      const headers = [
        'ID', 'Name', 'Email', 'Phone', 'Company', 'Status', 'Segment', 'Health Score', 
        'Total Revenue', 'Total Invoices', 'Paid Invoices', 'Unpaid Invoices', 
        'Average Payment Time', 'Satisfaction Score', 'Last Activity', 'Created At', 'Updated At'
      ];
      
      const csvRows = [headers.join(',')];
      
      clients.forEach(client => {
        csvRows.push([
          client.id,
          `"${client.name}"`,
          `"${client.email}"`,
          client.phone || '',
          `"${client.company || ''}"`,
          client.status,
          client.segment,
          client.healthScore,
          client.totalRevenue.toFixed(2),
          client.totalInvoices,
          client.paidInvoices,
          client.unpaidInvoices,
          client.averagePaymentTime.toFixed(1),
          client.satisfactionScore,
          client.lastActivity.toISOString(),
          client.createdAt.toISOString(),
          client.updatedAt.toISOString()
        ].join(','));
      });
      
      const csvContent = csvRows.join('\n');
      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `crm_clients_${new Date().toISOString().split('T')[0]}.csv`);
      linkElement.click();
    }
  },

  importClients: async (data) => {
    set({ isLoading: true });
    try {
      const clients = data.map(item => ({
        ...item,
        id: item.id || `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        totalInvoices: item.totalInvoices || 0,
        paidInvoices: item.paidInvoices || 0,
        unpaidInvoices: item.unpaidInvoices || 0,
        averagePaymentTime: item.averagePaymentTime || 0,
        satisfactionScore: item.satisfactionScore || 0,
        lastActivity: item.lastActivity ? new Date(item.lastActivity) : new Date(),
        notes: item.notes || [],
        tags: item.tags || [],
        documents: item.documents || [],
        communications: item.communications || [],
        feedback: item.feedback || [],
      }));
      
      set({ clients, isLoading: false });
    } catch (error) {
      console.error('Error importing clients:', error);
      set({ isLoading: false });
    }
  },
}));

// Computed values
export const useFilteredClients = () => {
  const { 
    clients, searchTerm, filterSegment, filterStatus, sortBy, sortOrder 
  } = useCRMStore();

  return clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSegment = filterSegment === 'all' || client.segment === filterSegment;
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesSegment && matchesStatus;
  }).sort((a, b) => {
    const aValue = a[sortBy as keyof Client];
    const bValue = b[sortBy as keyof Client];
    
    let comparison = 0;
    if (aValue !== undefined && bValue !== undefined) {
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
    } else if (aValue === undefined && bValue !== undefined) {
      comparison = 1;
    } else if (aValue !== undefined && bValue === undefined) {
      comparison = -1;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

export const useClientHealthMetrics = (clientId: string): ClientHealthMetrics => {
  const { clients } = useCRMStore();
  const client = clients.find(c => c.id === clientId);
  
  if (!client) {
    return {
      score: 0,
      factors: {
        revenue: 0,
        paymentTimeliness: 0,
        communication: 0,
        satisfaction: 0,
        engagement: 0,
      },
      trends: [],
      recommendations: [],
    };
  }
  
  // Calculate health score based on various factors
  const revenueScore = Math.min(100, (client.totalRevenue / 10000) * 100);
  const paymentScore = client.totalInvoices > 0 ? (client.paidInvoices / client.totalInvoices) * 100 : 0;
  const satisfactionScore = client.satisfactionScore;
  const engagementScore = client.communications.length > 0 ? Math.min(100, (client.communications.length / 10) * 100) : 0;
  
  const score = (revenueScore * 0.3 + paymentScore * 0.3 + satisfactionScore * 0.2 + engagementScore * 0.2);
  
  return {
    score,
    factors: {
      revenue: revenueScore,
      paymentTimeliness: paymentScore,
      communication: engagementScore,
      satisfaction: satisfactionScore,
      engagement: engagementScore,
    },
    trends: [] as Array<{date: Date, score: number, revenue: number}>, // Could be calculated from historical data
    recommendations: [
      ...(score < 70 ? ['Focus on improving client satisfaction'] : []),
      ...(paymentScore < 80 ? ['Improve payment collection process'] : []),
      ...(engagementScore < 60 ? ['Increase client communication frequency'] : []),
    ],
  };
};
