// CRM Types and Interfaces
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'prospect';
  segment: 'vip' | 'regular' | 'at-risk' | 'dormant';
  healthScore: number;
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  averagePaymentTime: number;
  satisfactionScore: number;
  lastActivity: Date;
  nextExpectedInvoice?: Date;
  notes: string[];
  tags: string[];
  documents: ClientDocument[];
  communications: Communication[];
  feedback: Feedback[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientDocument {
  id: string;
  name: string;
  type: 'contract' | 'proposal' | 'receipt' | 'other';
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  size: number;
  description?: string;
}

export interface Communication {
  id: string;
  clientId: string;
  type: 'email' | 'phone' | 'meeting' | 'note' | 'invoice' | 'payment';
  subject?: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'opened' | 'replied';
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[];
}

export interface Feedback {
  id: string;
  clientId: string;
  type: 'satisfaction' | 'support' | 'feature_request' | 'complaint';
  rating?: number;
  title: string;
  content: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
  response?: string;
}

export interface ClientPortal {
  clientId: string;
  accessCode: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions: ('view_invoices' | 'download_invoices' | 'make_payment' | 'view_documents' | 'send_message' | 'provide_feedback')[];
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    language: string;
    timezone: string;
  };
}

export interface ClientHealthMetrics {
  score: number;
  factors: {
    revenue: number;
    paymentTimeliness: number;
    communication: number;
    satisfaction: number;
    engagement: number;
  };
  trends: Array<{
    date: Date;
    score: number;
    revenue: number;
  }>;
  recommendations: string[];
}

export interface ClientSegment {
  name: string;
  criteria: {
    minRevenue?: number;
    maxRevenue?: number;
    minInvoices?: number;
    maxInvoices?: number;
    minHealthScore?: number;
    tags?: string[];
  };
  clients: string[];
}
