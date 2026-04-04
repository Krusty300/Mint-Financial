export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  currency?: string;
  taxId?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  status?: 'active' | 'inactive' | 'prospect' | 'at-risk';
  tags?: string[];
  notes?: string;
  website?: string;
  industry?: string;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
}

export interface ClientMetrics {
  clientId: string;
  totalRevenue: number;
  invoiceCount: number;
  paidRevenue: number;
  outstandingRevenue: number;
  averageInvoiceValue: number;
  paymentRate: number;
  averagePaymentTime: number; // days
  lastInvoiceDate?: Date;
  lastPaymentDate?: Date;
  clientSince: Date;
  revenueGrowth: number; // percentage
  profitMargin: number; // percentage
  clientHealthScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  lifecycleStage: 'new' | 'active' | 'at-risk' | 'inactive' | 'churned';
  segment: 'vip' | 'regular' | 'occasional' | 'dormant';
  communicationScore: number; // 0-100
  satisfactionScore: number; // 0-100
  nextExpectedInvoice?: Date;
  churnRisk: number; // 0-100
  lifetimeValue: number;
  acquisitionCost: number;
  netProfit: number;
}

export interface ClientSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  clientIds: string[];
  metrics: {
    totalRevenue: number;
    clientCount: number;
    averageRevenue: number;
    growthRate: number;
  };
  createdAt: Date;
}

export interface SegmentCriteria {
  revenueRange?: { min: number; max: number };
  invoiceCountRange?: { min: number; max: number };
  paymentRateRange?: { min: number; max: number };
  industries?: string[];
  companySizes?: string[];
  tags?: string[];
  riskLevels?: string[];
  lifecycleStages?: string[];
  customFields?: Record<string, any>;
}

export interface ClientAlert {
  id: string;
  clientId: string;
  type: 'payment_overdue' | 'high_risk' | 'revenue_drop' | 'anniversary' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
}

export interface ClientCommunication {
  id: string;
  clientId: string;
  type: 'email' | 'phone' | 'meeting' | 'note' | 'invoice_sent' | 'payment_received';
  subject: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'failed';
  createdAt: Date;
  scheduledFor?: Date;
  attachments?: string[];
  metadata?: Record<string, any>;
}

export interface ClientOpportunity {
  id: string;
  clientId: string;
  title: string;
  description: string;
  value: number;
  probability: number; // 0-100
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  expectedCloseDate: Date;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  tags?: string[];
}

export interface ClientActivity {
  id: string;
  clientId: string;
  type: 'invoice_created' | 'invoice_paid' | 'invoice_overdue' | 'contact_added' | 'note_added' | 'meeting_scheduled';
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  userId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'viewed' | 'partial';
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
  currency?: string;
  customFields?: Record<string, any>;
  // Company Information
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyLogo?: string | null;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: Invoice['status'];
  items: InvoiceItem[];
  taxRate: number;
  notes: string;
  paymentTerms: string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: {
    small: string;
    medium: string;
    large: string;
  };
  layout: {
    headerStyle: 'center' | 'left' | 'right';
    footerStyle: 'center' | 'left' | 'right';
    tableStyle: 'modern' | 'classic' | 'minimal';
  };
  customCss?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  brandId: string;
  layout: TemplateLayout;
  fields: TemplateField[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateLayout {
  header: {
    showLogo: boolean;
    showCompanyInfo: boolean;
    showClientInfo: boolean;
    showDateInfo: boolean;
    position: 'top' | 'left' | 'right';
  };
  body: {
    showTable: boolean;
    showDescriptions: boolean;
    showQuantities: boolean;
    showRates: boolean;
    showTotals: boolean;
  };
  footer: {
    showNotes: boolean;
    showPaymentTerms: boolean;
    showTotals: boolean;
    showTaxBreakdown: boolean;
  };
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'textarea' | 'file';
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: FieldValidation;
  conditions?: FieldCondition[];
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: any) => boolean | string;
}

export interface FieldCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide' | 'require' | 'optional';
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
  translations: Record<string, string>;
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  country?: string;
  state?: string;
  category?: string;
  description: string;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'textarea' | 'file';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: FieldValidation;
  appliesTo: 'invoice' | 'client' | 'item' | 'all';
  category: string;
  order: number;
}
