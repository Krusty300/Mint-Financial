import type { Invoice, Client, InvoiceItem } from '../types';

export const generateSampleData = () => {
  const sampleClients: Client[] = [
    {
      id: 'client-1',
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      phone: '+1 (555) 123-4567',
      address: '123 Business St, New York, NY 10001',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-03-10')
    },
    {
      id: 'client-2',
      name: 'Tech Solutions Inc',
      email: 'invoices@techsolutions.com',
      phone: '+1 (555) 987-6543',
      address: '456 Tech Ave, San Francisco, CA 94102',
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2024-02-15')
    },
    {
      id: 'client-3',
      name: 'Global Marketing',
      email: 'finance@globalmarketing.com',
      phone: '+1 (555) 246-8135',
      address: '789 Market St, Chicago, IL 60601',
      createdAt: new Date('2023-05-10'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 'client-4',
      name: 'StartUp Ventures',
      email: 'hello@startupventures.com',
      phone: '+1 (555) 369-2580',
      address: '321 Innovation Dr, Austin, TX 78701',
      createdAt: new Date('2023-07-15'),
      updatedAt: new Date('2024-04-05')
    },
    {
      id: 'client-5',
      name: 'Enterprise Co',
      email: 'accounts@enterprise.com',
      phone: '+1 (555) 147-2580',
      address: '654 Corporate Blvd, Boston, MA 02108',
      createdAt: new Date('2023-09-10'),
      updatedAt: new Date('2024-03-25')
    }
  ];

  const generateInvoiceItems = (): InvoiceItem[] => {
    const services = [
      { description: 'Web Development Services', rate: 150, quantity: 40 },
      { description: 'UI/UX Design', rate: 120, quantity: 20 },
      { description: 'Mobile App Development', rate: 180, quantity: 35 },
      { description: 'Database Consulting', rate: 200, quantity: 15 },
      { description: 'Cloud Infrastructure Setup', rate: 250, quantity: 25 },
      { description: 'SEO Optimization', rate: 100, quantity: 30 },
      { description: 'Content Management System', rate: 130, quantity: 25 },
      { description: 'API Development', rate: 160, quantity: 20 }
    ];

    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
    const selectedServices = services.sort(() => Math.random() - 0.5).slice(0, numItems);
    
    return selectedServices.map((service, index) => ({
      id: `item-${Date.now()}-${index}`,
      description: service.description,
      rate: service.rate,
      quantity: service.quantity,
      total: service.rate * service.quantity
    }));
  };

  const generateInvoice = (clientId: string, invoiceNumber: string, status: Invoice['status'], daysAgo: number): Invoice => {
    const items = generateInvoiceItems();
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.08; // 8% tax
    const total = subtotal * (1 + taxRate);

    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - daysAgo);

    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

    return {
      id: `invoice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      invoiceNumber,
      clientId,
      issueDate,
      dueDate,
      status,
      items,
      subtotal,
      taxRate: taxRate * 100,
      total,
      notes: 'Payment due within 30 days. Thank you for your business!',
      paymentTerms: 'Net 30 days'
    };
  };

  const sampleInvoices: Invoice[] = [
    generateInvoice('client-1', 'INV-0001', 'paid', 90),
    generateInvoice('client-2', 'INV-0002', 'paid', 75),
    generateInvoice('client-3', 'INV-0003', 'sent', 45),
    generateInvoice('client-1', 'INV-0004', 'sent', 30),
    generateInvoice('client-4', 'INV-0005', 'draft', 15),
    generateInvoice('client-5', 'INV-0006', 'overdue', 60),
    generateInvoice('client-2', 'INV-0007', 'paid', 120),
    generateInvoice('client-3', 'INV-0008', 'sent', 20),
    generateInvoice('client-4', 'INV-0009', 'draft', 10),
    generateInvoice('client-5', 'INV-0010', 'overdue', 35),
    generateInvoice('client-1', 'INV-0011', 'paid', 180),
    generateInvoice('client-2', 'INV-0012', 'sent', 5),
    generateInvoice('client-3', 'INV-0013', 'draft', 3),
    generateInvoice('client-4', 'INV-0014', 'paid', 150),
    generateInvoice('client-5', 'INV-0015', 'sent', 1)
  ];

  return { clients: sampleClients, invoices: sampleInvoices };
};
