import type { 
  Product, 
  Order, 
  TaxRate, 
  ShippingMethod, 
  ReturnRequest 
} from '../types/ecommerce';

export const generateEcommerceSampleData = () => {
  const sampleProducts: Product[] = [
    {
      id: 'product-1',
      name: 'Professional Laptop',
      description: 'High-performance laptop for business professionals with 16GB RAM and 512GB SSD',
      sku: 'LAP-PRO-001',
      price: 1299.99,
      cost: 999.99,
      category: 'Electronics',
      tags: ['laptop', 'professional', 'business'],
      images: ['/images/laptop-pro-1.jpg', '/images/laptop-pro-2.jpg'],
      inventory: {
        quantity: 25,
        reorderLevel: 10,
        reorderQuantity: 20,
        trackInventory: true,
        allowBackorder: false
      },
      dimensions: {
        length: 35,
        width: 25,
        height: 2,
        weight: 2.5
      },
      variants: [
        {
          id: 'var-1',
          productId: 'product-1',
          name: 'Silver',
          sku: 'LAP-PRO-001-SLV',
          price: 1299.99,
          inventory: {
            quantity: 10,
            trackInventory: true
          },
          attributes: { color: 'Silver' }
        },
        {
          id: 'var-2',
          productId: 'product-1',
          name: 'Space Gray',
          sku: 'LAP-PRO-001-GRY',
          price: 1299.99,
          inventory: {
            quantity: 15,
            trackInventory: true
          },
          attributes: { color: 'Space Gray' }
        }
      ],
      taxClass: 'standard',
      shippingClass: 'standard',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-10')
    },
    {
      id: 'product-2',
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with long battery life',
      sku: 'MOU-WRL-001',
      price: 49.99,
      cost: 25.99,
      category: 'Electronics',
      tags: ['mouse', 'wireless', 'ergonomic'],
      images: ['/images/mouse-wireless-1.jpg'],
      inventory: {
        quantity: 150,
        reorderLevel: 20,
        reorderQuantity: 100,
        trackInventory: true,
        allowBackorder: false
      },
      dimensions: {
        length: 10,
        width: 6,
        height: 4,
        weight: 0.2
      },
      variants: [
        {
          id: 'var-3',
          productId: 'product-2',
          name: 'Black',
          sku: 'MOU-WRL-001-BLK',
          price: 49.99,
          inventory: {
            quantity: 75,
            trackInventory: true
          },
          attributes: { color: 'Black' }
        },
        {
          id: 'var-4',
          productId: 'product-2',
          name: 'White',
          sku: 'MOU-WRL-001-WHT',
          price: 49.99,
          inventory: {
            quantity: 75,
            trackInventory: true
          },
          attributes: { color: 'White' }
        }
      ],
      taxClass: 'standard',
      shippingClass: 'standard',
      status: 'active',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-05')
    }
  ];

  // Create a simple order with product references
  const sampleOrders: Order[] = [
    {
      id: 'order-1',
      orderNumber: 'ORD-1001',
      customerId: 'customer-1',
      status: 'delivered',
      paymentStatus: 'paid',
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          variantId: 'var-1',
          name: 'Professional Laptop',
          sku: 'LAP-PRO-001-SLV',
          quantity: 1,
          price: 1299.99,
          total: 1299.99,
          product: sampleProducts[0],
          variant: sampleProducts[0].variants?.[0]
        }
      ],
      subtotal: 1299.99,
      tax: 129.99,
      shipping: 15.00,
      discount: 0,
      total: 1444.98,
      currency: 'USD',
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        company: 'Acme Corp',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        phone: '+1-555-0123',
        email: 'john.doe@email.com'
      },
      billingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        company: 'Acme Corp',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        phone: '+1-555-0123',
        email: 'john.doe@email.com'
      },
      tracking: {
        carrier: 'UPS',
        trackingNumber: '1Z999AA10123456784',
        status: 'delivered',
        events: [
          {
            date: new Date('2024-03-08'),
            status: 'Picked Up',
            location: 'New York, NY',
            description: 'Package picked up from sender'
          },
          {
            date: new Date('2024-03-10'),
            status: 'Delivered',
            location: 'New York, NY',
            description: 'Package delivered'
          }
        ],
        estimatedDelivery: new Date('2024-03-10')
      },
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-10'),
      shippedAt: new Date('2024-03-08'),
      deliveredAt: new Date('2024-03-10')
    }
  ];

  const sampleTaxRates: TaxRate[] = [
    {
      id: 'tax-1',
      name: 'US Sales Tax',
      rate: 8.25,
      type: 'percentage',
      jurisdiction: {
        country: 'USA',
        state: 'CA'
      },
      appliesTo: 'all',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'tax-2',
      name: 'NY Sales Tax',
      rate: 8.875,
      type: 'percentage',
      jurisdiction: {
        country: 'USA',
        state: 'NY'
      },
      appliesTo: 'all',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  const sampleShippingMethods: ShippingMethod[] = [
    {
      id: 'ship-1',
      name: 'Standard Shipping',
      description: 'Standard delivery within 5-7 business days',
      carrier: 'USPS',
      service: 'Ground',
      rate: 15.00,
      rateType: 'fixed',
      estimatedDays: {
        min: 5,
        max: 7
      },
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'ship-2',
      name: 'Express Shipping',
      description: 'Express delivery within 2-3 business days',
      carrier: 'FedEx',
      service: 'Express',
      rate: 35.00,
      rateType: 'fixed',
      estimatedDays: {
        min: 2,
        max: 3
      },
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  const sampleReturnRequests: ReturnRequest[] = [
    {
      id: 'return-1',
      orderNumber: 'ORD-1001',
      customerId: 'customer-1',
      status: 'approved',
      items: [
        {
          id: 'return-item-1',
          orderItemId: 'item-1',
          productId: 'product-1',
          variantId: 'var-1',
          quantity: 1,
          reason: 'defective',
          condition: 'used',
          approvedQuantity: 1,
          refundAmount: 1299.99
        }
      ],
      reason: 'Product arrived defective',
      refundAmount: 1299.99,
      refundMethod: 'original',
      createdAt: new Date('2024-03-08'),
      updatedAt: new Date('2024-03-12'),
      processedAt: new Date('2024-03-12')
    }
  ];

  return {
    products: sampleProducts,
    categories: ['Electronics'],
    tags: ['laptop', 'professional', 'business', 'mouse', 'wireless', 'ergonomic'],
    orders: sampleOrders,
    taxRates: sampleTaxRates,
    shippingMethods: sampleShippingMethods,
    returnRequests: sampleReturnRequests
  };
};
