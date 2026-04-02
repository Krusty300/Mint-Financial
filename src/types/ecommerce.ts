export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  cost: number;
  category: string;
  tags: string[];
  images: string[];
  inventory: {
    quantity: number;
    reorderLevel: number;
    reorderQuantity: number;
    trackInventory: boolean;
    allowBackorder: boolean;
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  variants?: ProductVariant[];
  taxClass: string;
  shippingClass: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  inventory: {
    quantity: number;
    trackInventory: boolean;
  };
  attributes: {
    [key: string]: string; // e.g., color: "red", size: "large"
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'failed';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  tracking?: ShippingTracking;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  product: Product;
  variant?: ProductVariant;
}

export interface ShippingTracking {
  carrier: string;
  trackingNumber: string;
  status: 'in_transit' | 'delivered' | 'exception' | 'pending';
  events: TrackingEvent[];
  estimatedDelivery?: Date;
}

export interface TrackingEvent {
  date: Date;
  status: string;
  location: string;
  description: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  jurisdiction: {
    country: string;
    state?: string;
    city?: string;
    postalCode?: string;
  };
  appliesTo: 'all' | 'shipping' | 'products' | 'digital_goods';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  carrier: string;
  service: string;
  rate: number;
  rateType: 'fixed' | 'percentage' | 'weight_based' | 'price_based';
  conditions?: {
    minWeight?: number;
    maxWeight?: number;
    minPrice?: number;
    maxPrice?: number;
    countries?: string[];
  };
  estimatedDays: {
    min: number;
    max: number;
  };
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReturnRequest {
  id: string;
  orderNumber: string;
  customerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'completed';
  items: ReturnItem[];
  reason: string;
  notes?: string;
  refundAmount: number;
  refundMethod: 'original' | 'store_credit' | 'bank_transfer';
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

export interface ReturnItem {
  id: string;
  orderItemId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  reason: string;
  condition: string;
  approvedQuantity: number;
  refundAmount: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    totalSpent?: { min?: number; max?: number };
    orderCount?: { min?: number; max?: number };
    lastOrder?: { before?: Date; after?: Date };
    categories?: string[];
    tags?: string[];
  };
  customerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EcommerceAnalytics {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    cartAbandonmentRate: number;
    customerLifetimeValue: number;
  };
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  topCategories: Array<{
    category: string;
    revenue: number;
    orders: number;
  }>;
  salesTrend: Array<{
    date: Date;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  customerSegments: Array<{
    segment: CustomerSegment;
    revenue: number;
    customers: number;
    averageOrderValue: number;
  }>;
  inventoryAlerts: Array<{
    product: Product;
    currentStock: number;
    reorderLevel: number;
    status: 'low_stock' | 'out_of_stock';
  }>;
}

export interface EcommerceSettings {
  currencies: Array<{
    code: string;
    symbol: string;
    rate: number;
    default: boolean;
  }>;
  taxSettings: {
    taxIncluded: boolean;
    calculateTaxOnShipping: boolean;
    defaultTaxClass: string;
  };
  shippingSettings: {
    freeShippingThreshold?: number;
    defaultShippingMethod: string;
    trackInventory: boolean;
    allowBackorders: boolean;
  };
  orderSettings: {
    autoProcessOrders: boolean;
    defaultOrderStatus: string;
    orderNumberPrefix: string;
    orderNumberStart: number;
  };
  returnSettings: {
    allowReturns: boolean;
    returnPeriod: number; // days
    requireApproval: boolean;
    refundMethods: string[];
  };
}
