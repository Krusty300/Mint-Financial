import type { Client, ClientDocument, Communication, Feedback, ClientPortal } from '../types/crm';

export const generateCRMSampleData = () => {
  const sampleClients: Client[] = [
    {
      id: 'client-1',
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Business St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA'
      },
      company: 'Acme Corporation',
      status: 'active',
      segment: 'vip',
      healthScore: 85,
      totalRevenue: 125000,
      totalInvoices: 15,
      paidInvoices: 12,
      unpaidInvoices: 3,
      averagePaymentTime: 18,
      satisfactionScore: 92,
      lastActivity: new Date('2024-03-15'),
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-03-15'),
      notes: [
        'Key client - prioritize support',
        'Interested in expanding services'
      ],
      tags: ['vip', 'enterprise', 'long-term'],
      documents: [],
      communications: [],
      feedback: []
    },
    {
      id: 'client-2',
      name: 'Tech Solutions Inc',
      email: 'invoices@techsolutions.com',
      phone: '+1 (555) 987-6543',
      address: {
        street: '456 Tech Ave',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        country: 'USA'
      },
      company: 'Tech Solutions Inc',
      status: 'active',
      segment: 'regular',
      healthScore: 78,
      totalRevenue: 67000,
      totalInvoices: 8,
      paidInvoices: 7,
      unpaidInvoices: 1,
      averagePaymentTime: 25,
      satisfactionScore: 85,
      lastActivity: new Date('2024-03-12'),
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2024-03-12'),
      notes: [
        'Growing startup with potential'
      ],
      tags: ['startup', 'tech', 'growing'],
      documents: [],
      communications: [],
      feedback: []
    },
    {
      id: 'client-3',
      name: 'Global Marketing',
      email: 'finance@globalmarketing.com',
      phone: '+1 (555) 246-8135',
      address: {
        street: '789 Market St',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'USA'
      },
      company: 'Global Marketing',
      status: 'active',
      segment: 'regular',
      healthScore: 78,
      totalRevenue: 45000,
      totalInvoices: 6,
      paidInvoices: 5,
      unpaidInvoices: 1,
      averagePaymentTime: 32,
      satisfactionScore: 78,
      lastActivity: new Date('2024-03-08'),
      createdAt: new Date('2023-05-10'),
      updatedAt: new Date('2024-03-08'),
      notes: [],
      tags: ['marketing', 'agency'],
      documents: [],
      communications: [],
      feedback: []
    },
    {
      id: 'client-4',
      name: 'StartUp Ventures',
      email: 'hello@startupventures.com',
      phone: '+1 (555) 369-2580',
      address: {
        street: '321 Innovation Dr',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        country: 'USA'
      },
      company: 'StartUp Ventures',
      status: 'inactive',
      segment: 'regular',
      healthScore: 45,
      totalRevenue: 23000,
      totalInvoices: 4,
      paidInvoices: 2,
      unpaidInvoices: 2,
      averagePaymentTime: 45,
      satisfactionScore: 65,
      lastActivity: new Date('2024-02-20'),
      createdAt: new Date('2023-07-15'),
      updatedAt: new Date('2024-02-20'),
      notes: [
        'Payment delays - follow up required'
      ],
      tags: ['startup', 'at-risk'],
      documents: [],
      communications: [],
      feedback: []
    },
    {
      id: 'client-5',
      name: 'Enterprise Co',
      email: 'accounts@enterprise.com',
      phone: '+1 (555) 147-2580',
      address: {
        street: '654 Corporate Blvd',
        city: 'Boston',
        state: 'MA',
        zip: '02108',
        country: 'USA'
      },
      company: 'Enterprise Co',
      status: 'inactive',
      segment: 'vip',
      healthScore: 92,
      totalRevenue: 89000,
      totalInvoices: 12,
      paidInvoices: 12,
      unpaidInvoices: 0,
      averagePaymentTime: 15,
      satisfactionScore: 88,
      lastActivity: new Date('2024-01-15'),
      createdAt: new Date('2023-09-10'),
      updatedAt: new Date('2024-01-15'),
      notes: [
        'Large account - re-engagement needed'
      ],
      tags: ['enterprise', 'dormant', 'high-value'],
      documents: [],
      communications: [],
      feedback: []
    }
  ];

  const sampleDocuments: ClientDocument[] = [
    {
      id: 'doc-1',
      name: 'Q4 2023 Report.pdf',
      type: 'other',
      url: '/documents/q4-2023-report.pdf',
      size: 2048576,
      uploadedAt: new Date('2024-01-15'),
      uploadedBy: 'John Doe'
    },
    {
      id: 'doc-2',
      name: 'Service Agreement.pdf',
      type: 'contract',
      url: '/documents/service-agreement.pdf',
      size: 1048576,
      uploadedAt: new Date('2024-02-01'),
      uploadedBy: 'Jane Smith'
    },
    {
      id: 'doc-3',
      name: 'Invoice_2024_03.pdf',
      type: 'receipt',
      url: '/documents/invoice-2024-03.pdf',
      size: 524288,
      uploadedAt: new Date('2024-03-01'),
      uploadedBy: 'Mike Johnson'
    }
  ];

  const sampleCommunications: Communication[] = [
    {
      id: 'comm-1',
      clientId: 'client-1',
      type: 'email',
      subject: 'Q1 2024 Service Review',
      content: 'Hi team, I wanted to schedule a review of our Q1 services...',
      direction: 'outbound',
      status: 'sent',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10')
    },
    {
      id: 'comm-2',
      clientId: 'client-2',
      type: 'phone',
      subject: 'Technical Support Call',
      content: 'Client reported issues with the latest update...',
      direction: 'inbound',
      status: 'replied',
      createdAt: new Date('2024-03-08'),
      updatedAt: new Date('2024-03-08')
    },
    {
      id: 'comm-3',
      clientId: 'client-3',
      type: 'meeting',
      subject: 'Marketing Strategy Meeting',
      content: 'Discussed upcoming marketing campaigns and budget...',
      direction: 'outbound',
      status: 'sent',
      createdAt: new Date('2024-03-12'),
      updatedAt: new Date('2024-03-12')
    }
  ];

  const sampleFeedback: Feedback[] = [
    {
      id: 'feedback-1',
      clientId: 'client-1',
      type: 'satisfaction',
      rating: 5,
      title: 'Excellent Service!',
      content: 'The team has been incredibly responsive and professional. Very satisfied with the services.',
      status: 'resolved',
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-06')
    },
    {
      id: 'feedback-2',
      clientId: 'client-2',
      type: 'support',
      rating: 4,
      title: 'Great Experience',
      content: 'Overall very happy with the service. Would love to see more advanced features.',
      status: 'in_progress',
      createdAt: new Date('2024-03-08'),
      updatedAt: new Date('2024-03-09')
    },
    {
      id: 'feedback-3',
      clientId: 'client-4',
      type: 'complaint',
      rating: 2,
      title: 'Response Time Issues',
      content: 'Experiencing delays in support response times. Please improve.',
      status: 'open',
      createdAt: new Date('2024-02-25'),
      updatedAt: new Date('2024-02-26')
    }
  ];

  const samplePortals: ClientPortal[] = [
    {
      clientId: 'client-1',
      accessCode: 'ACME2024',
      isActive: true,
      lastLogin: new Date('2024-03-15'),
      permissions: ['view_invoices', 'download_invoices', 'view_documents', 'send_message'],
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        timezone: 'America/New_York'
      }
    },
    {
      clientId: 'client-2',
      accessCode: 'TECH2024',
      isActive: true,
      lastLogin: new Date('2024-03-12'),
      permissions: ['view_invoices', 'download_invoices', 'view_documents'],
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        timezone: 'America/Los_Angeles'
      }
    },
    {
      clientId: 'client-3',
      accessCode: 'GLOB2024',
      isActive: false,
      lastLogin: new Date('2024-02-20'),
      permissions: ['view_invoices'],
      preferences: {
        emailNotifications: false,
        smsNotifications: false,
        language: 'en',
        timezone: 'America/Chicago'
      }
    }
  ];

  return {
    clients: sampleClients,
    documents: sampleDocuments,
    communications: sampleCommunications,
    feedback: sampleFeedback,
    portals: samplePortals
  };
};
