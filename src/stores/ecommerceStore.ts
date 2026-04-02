import { create } from 'zustand';
import type { 
  Product, 
  Order, 
  TaxRate, 
  ShippingMethod, 
  ReturnRequest, 
  EcommerceAnalytics,
  EcommerceSettings,
  ShippingTracking,
  Address
} from '../types/ecommerce';
import { generateEcommerceSampleData } from '../utils/ecommerceSampleData';

// Initialize with sample data if localStorage is empty
const initializeEcommerceData = () => {
  const storedData = localStorage.getItem('ecommerce_data');
  if (!storedData) {
    const sampleData = generateEcommerceSampleData();
    localStorage.setItem('ecommerce_data', JSON.stringify(sampleData));
  }
};

// Initialize e-commerce data
initializeEcommerceData();

interface EcommerceState {
  // Product Catalog
  products: Product[];
  categories: string[];
  tags: string[];
  
  // Orders
  orders: Order[];
  
  // Tax & Shipping
  taxRates: TaxRate[];
  shippingMethods: ShippingMethod[];
  
  // Returns
  returnRequests: ReturnRequest[];
  
  // Analytics
  analytics: EcommerceAnalytics | null;
  
  // Settings
  settings: EcommerceSettings;
  
  // UI State
  isLoading: boolean;
  searchTerm: string;
  selectedCategory: string;
  selectedStatus: string;
  sortBy: 'name' | 'price' | 'stock' | 'sales' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

interface EcommerceActions extends EcommerceState {
  // Product Management
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateInventory: (productId: string, quantity: number) => void;
  bulkUpdateInventory: (updates: Array<{ productId: string; quantity: number }>) => void;
  
  // Order Management
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updatePaymentStatus: (id: string, paymentStatus: Order['paymentStatus']) => void;
  addTracking: (orderId: string, tracking: ShippingTracking) => void;
  
  // Tax Management
  addTaxRate: (taxRate: Omit<TaxRate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTaxRate: (id: string, updates: Partial<TaxRate>) => void;
  deleteTaxRate: (id: string) => void;
  calculateTax: (items: Array<{ price: number; quantity: number; taxClass: string }>, shipping: number, address: Address) => number;
  
  // Shipping Management
  addShippingMethod: (method: Omit<ShippingMethod, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateShippingMethod: (id: string, updates: Partial<ShippingMethod>) => void;
  deleteShippingMethod: (id: string) => void;
  calculateShipping: (items: Array<{ weight: number; price: number }>, address: Address) => Array<{ method: ShippingMethod; rate: number }>;
  
  // Return Management
  createReturnRequest: (returnRequest: Omit<ReturnRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReturnRequest: (id: string, updates: Partial<ReturnRequest>) => void;
  processReturn: (id: string, approvedItems: Array<{ itemId: string; quantity: number }>) => void;
  
  // Analytics
  generateAnalytics: () => void;
  refreshAnalytics: () => void;
  
  // Settings
  updateSettings: (settings: Partial<EcommerceSettings>) => void;
  
  // UI State
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedStatus: (status: string) => void;
  setSortBy: (sortBy: 'name' | 'price' | 'stock' | 'sales' | 'createdAt') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  
  // Data Management
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
  exportData: () => void;
  importData: (data: any) => void;
}

const generateOrderNumber = (prefix: string, start: number): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  return `${prefix}${start + timestamp}${randomSuffix}`;
};

const calculateTaxForJurisdiction = (taxRates: TaxRate[], address: Address): TaxRate[] => {
  return taxRates.filter(rate => {
    if (rate.status !== 'active') return false;
    
    const jurisdiction = rate.jurisdiction;
    
    // Country match
    if (jurisdiction.country !== address.country) return false;
    
    // State match (if specified)
    if (jurisdiction.state && jurisdiction.state !== address.state) return false;
    
    // City match (if specified)
    if (jurisdiction.city && jurisdiction.city !== address.city) return false;
    
    // Postal code match (if specified)
    if (jurisdiction.postalCode && !address.postalCode.startsWith(jurisdiction.postalCode)) return false;
    
    return true;
  });
};

// Load data from localStorage
const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem('ecommerce_data');
    if (data) {
      const parsedData = JSON.parse(data);
      return {
        products: parsedData.products || [],
        categories: parsedData.categories || [],
        tags: parsedData.tags || [],
        orders: parsedData.orders || [],
        taxRates: parsedData.taxRates || [],
        shippingMethods: parsedData.shippingMethods || [],
        returnRequests: parsedData.returnRequests || []
      };
    }
  } catch (error) {
    console.error('Failed to load ecommerce data from localStorage:', error);
  }
  
  // Return default empty state
  return {
    products: [],
    categories: [],
    tags: [],
    orders: [],
    taxRates: [],
    shippingMethods: [],
    returnRequests: []
  };
};

const initialData = loadFromLocalStorage();

export const useEcommerceStore = create<EcommerceActions>((set, get) => ({
  // Initial State
  products: initialData.products,
  categories: initialData.categories,
  tags: initialData.tags,
  orders: initialData.orders,
  taxRates: initialData.taxRates,
  shippingMethods: initialData.shippingMethods,
  returnRequests: initialData.returnRequests,
  analytics: null,
  settings: {
    currencies: [
      { code: 'USD', symbol: '$', rate: 1, default: true },
      { code: 'EUR', symbol: '€', rate: 0.85, default: false },
      { code: 'GBP', symbol: '£', rate: 0.73, default: false }
    ],
    taxSettings: {
      taxIncluded: false,
      calculateTaxOnShipping: true,
      defaultTaxClass: 'standard'
    },
    shippingSettings: {
      freeShippingThreshold: 100,
      defaultShippingMethod: 'standard',
      trackInventory: true,
      allowBackorders: false
    },
    orderSettings: {
      autoProcessOrders: true,
      defaultOrderStatus: 'pending',
      orderNumberPrefix: 'ORD-',
      orderNumberStart: 1000
    },
    returnSettings: {
      allowReturns: true,
      returnPeriod: 30,
      requireApproval: true,
      refundMethods: ['original', 'store_credit', 'bank_transfer']
    }
  },
  isLoading: false,
  searchTerm: '',
  selectedCategory: 'all',
  selectedStatus: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',

  // Product Management
  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set((state) => ({
      products: [...state.products, newProduct],
      categories: Array.from(new Set([...state.categories, productData.category])),
      tags: Array.from(new Set([...state.tags, ...productData.tags]))
    }));

    get().saveToLocalStorage();
  },

  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map(product =>
        product.id === id
          ? { ...product, ...updates, updatedAt: new Date() }
          : product
      )
    }));

    get().saveToLocalStorage();
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter(product => product.id !== id)
    }));

    get().saveToLocalStorage();
  },

  updateInventory: (productId, quantity) => {
    set((state) => ({
      products: state.products.map(product =>
        product.id === productId
          ? { 
              ...product, 
              inventory: { ...product.inventory, quantity },
              updatedAt: new Date()
            }
          : product
      )
    }));

    get().saveToLocalStorage();
  },

  bulkUpdateInventory: (updates) => {
    set((state) => ({
      products: state.products.map(product => {
        const update = updates.find(u => u.productId === product.id);
        if (update) {
          return {
            ...product,
            inventory: { ...product.inventory, quantity: update.quantity },
            updatedAt: new Date()
          };
        }
        return product;
      })
    }));

    get().saveToLocalStorage();
  },

  // Order Management
  createOrder: (orderData) => {
    const { settings } = get();
    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderNumber: generateOrderNumber(settings.orderSettings.orderNumberPrefix, settings.orderSettings.orderNumberStart),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set((state) => ({
      orders: [...state.orders, newOrder]
    }));

    get().saveToLocalStorage();
    return newOrder;
  },

  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map(order =>
        order.id === id
          ? { ...order, ...updates, updatedAt: new Date() }
          : order
      )
    }));

    get().saveToLocalStorage();
  },

  updateOrderStatus: (id, status) => {
    const now = new Date();
    set((state) => ({
      orders: state.orders.map(order =>
        order.id === id
          ? { 
              ...order, 
              status,
              updatedAt: now,
              ...(status === 'shipped' && { shippedAt: now }),
              ...(status === 'delivered' && { deliveredAt: now })
            }
          : order
      )
    }));

    get().saveToLocalStorage();
  },

  updatePaymentStatus: (id, paymentStatus) => {
    set((state) => ({
      orders: state.orders.map(order =>
        order.id === id
          ? { ...order, paymentStatus, updatedAt: new Date() }
          : order
      )
    }));

    get().saveToLocalStorage();
  },

  addTracking: (orderId, tracking) => {
    set((state) => ({
      orders: state.orders.map(order =>
        order.id === orderId
          ? { ...order, tracking, updatedAt: new Date() }
          : order
      )
    }));

    get().saveToLocalStorage();
  },

  // Tax Management
  addTaxRate: (taxRateData) => {
    const newTaxRate: TaxRate = {
      ...taxRateData,
      id: `tax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set((state) => ({
      taxRates: [...state.taxRates, newTaxRate]
    }));

    get().saveToLocalStorage();
  },

  updateTaxRate: (id, updates) => {
    set((state) => ({
      taxRates: state.taxRates.map(taxRate =>
        taxRate.id === id
          ? { ...taxRate, ...updates, updatedAt: new Date() }
          : taxRate
      )
    }));

    get().saveToLocalStorage();
  },

  deleteTaxRate: (id) => {
    set((state) => ({
      taxRates: state.taxRates.filter(taxRate => taxRate.id !== id)
    }));

    get().saveToLocalStorage();
  },

  calculateTax: (items, shipping, address) => {
    const { taxRates, settings } = get();
    const applicableRates = calculateTaxForJurisdiction(taxRates, address);
    
    let totalTax = 0;
    
    items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      const itemTaxRates = applicableRates.filter(rate => 
        rate.appliesTo === 'all' || rate.appliesTo === 'products'
      );
      
      itemTaxRates.forEach(rate => {
        if (rate.type === 'percentage') {
          totalTax += itemTotal * (rate.rate / 100);
        } else {
          totalTax += rate.rate;
        }
      });
    });
    
    // Calculate tax on shipping if enabled
    if (settings.taxSettings.calculateTaxOnShipping && shipping > 0) {
      const shippingTaxRates = applicableRates.filter(rate => 
        rate.appliesTo === 'all' || rate.appliesTo === 'shipping'
      );
      
      shippingTaxRates.forEach(rate => {
        if (rate.type === 'percentage') {
          totalTax += shipping * (rate.rate / 100);
        } else {
          totalTax += rate.rate;
        }
      });
    }
    
    return totalTax;
  },

  // Shipping Management
  addShippingMethod: (methodData) => {
    const newMethod: ShippingMethod = {
      ...methodData,
      id: `shipping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set((state) => ({
      shippingMethods: [...state.shippingMethods, newMethod]
    }));

    get().saveToLocalStorage();
  },

  updateShippingMethod: (id, updates) => {
    set((state) => ({
      shippingMethods: state.shippingMethods.map(method =>
        method.id === id
          ? { ...method, ...updates, updatedAt: new Date() }
          : method
      )
    }));

    get().saveToLocalStorage();
  },

  deleteShippingMethod: (id) => {
    set((state) => ({
      shippingMethods: state.shippingMethods.filter(method => method.id !== id)
    }));

    get().saveToLocalStorage();
  },

  calculateShipping: (items, address) => {
    const { shippingMethods, settings } = get();
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    
    return shippingMethods
      .filter(method => method.status === 'active')
      .filter(method => {
        if (!method.conditions) return true;
        
        // Check weight conditions
        if (method.conditions.minWeight && totalWeight < method.conditions.minWeight) return false;
        if (method.conditions.maxWeight && totalWeight > method.conditions.maxWeight) return false;
        
        // Check price conditions
        if (method.conditions.minPrice && totalPrice < method.conditions.minPrice) return false;
        if (method.conditions.maxPrice && totalPrice > method.conditions.maxPrice) return false;
        
        // Check country conditions
        if (method.conditions.countries && !method.conditions.countries.includes(address.country)) return false;
        
        return true;
      })
      .map(method => {
        let rate = method.rate;
        
        if (method.rateType === 'percentage') {
          rate = totalPrice * (method.rate / 100);
        } else if (method.rateType === 'weight_based') {
          rate = totalWeight * method.rate;
        }
        
        // Apply free shipping threshold
        if (settings.shippingSettings.freeShippingThreshold && 
            totalPrice >= settings.shippingSettings.freeShippingThreshold) {
          rate = 0;
        }
        
        return { method, rate };
      });
  },

  // Return Management
  createReturnRequest: (returnData) => {
    const newReturn: ReturnRequest = {
      ...returnData,
      id: `return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set((state) => ({
      returnRequests: [...state.returnRequests, newReturn]
    }));

    get().saveToLocalStorage();
    return newReturn;
  },

  updateReturnRequest: (id, updates) => {
    set((state) => ({
      returnRequests: state.returnRequests.map(returnRequest =>
        returnRequest.id === id
          ? { ...returnRequest, ...updates, updatedAt: new Date() }
          : returnRequest
      )
    }));

    get().saveToLocalStorage();
  },

  processReturn: (id, approvedItems) => {
    const now = new Date();
    set((state) => ({
      returnRequests: state.returnRequests.map(returnRequest => {
        if (returnRequest.id === id) {
          const updatedItems = returnRequest.items.map(item => {
            const approved = approvedItems.find(ai => ai.itemId === item.id);
            return approved 
              ? { ...item, approvedQuantity: approved.quantity }
              : item;
          });
          
          const totalRefund = updatedItems.reduce((sum, item) => 
            sum + (item.refundAmount * item.approvedQuantity), 0
          );
          
          return {
            ...returnRequest,
            items: updatedItems,
            refundAmount: totalRefund,
            status: 'processed',
            processedAt: now,
            updatedAt: now
          };
        }
        return returnRequest;
      })
    }));

    get().saveToLocalStorage();
  },

  // Analytics
  generateAnalytics: () => {
    const { products, orders } = get();
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate top products
    const productSales = new Map<string, { quantity: number; revenue: number }>();
    orders.forEach(order => {
      order.items.forEach(item => {
        const current = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
        productSales.set(item.productId, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.total
        });
      });
    });
    
    const topProducts = Array.from(productSales.entries())
      .map(([productId, sales]) => ({
        product: products.find(p => p.id === productId)!,
        ...sales
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Calculate inventory alerts
    const inventoryAlerts = products
      .filter(product => product.inventory.trackInventory)
      .filter(product => 
        product.inventory.quantity === 0 || 
        product.inventory.quantity <= product.inventory.reorderLevel
      )
      .map(product => ({
        product,
        currentStock: product.inventory.quantity,
        reorderLevel: product.inventory.reorderLevel,
        status: product.inventory.quantity === 0 ? 'out_of_stock' as const : 'low_stock' as const
      }));
    
    const analytics: EcommerceAnalytics = {
      overview: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        conversionRate: 0, // Would need visitor data
        cartAbandonmentRate: 0, // Would need cart data
        customerLifetimeValue: 0 // Would need customer data
      },
      topProducts,
      topCategories: [],
      salesTrend: [],
      customerSegments: [],
      inventoryAlerts
    };
    
    set({ analytics });
  },

  refreshAnalytics: () => {
    get().generateAnalytics();
  },

  // Settings
  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates }
    }));

    get().saveToLocalStorage();
  },

  // UI State
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),

  // Data Management
  loadFromLocalStorage: () => {
    try {
      const data = localStorage.getItem('ecommerce_data');
      if (data) {
        const parsedData = JSON.parse(data);
        set(parsedData);
      }
    } catch (error) {
      console.error('Failed to load ecommerce data from localStorage:', error);
    }
  },

  saveToLocalStorage: () => {
    try {
      const state = get();
      const dataToSave = {
        products: state.products,
        categories: state.categories,
        tags: state.tags,
        orders: state.orders,
        taxRates: state.taxRates,
        shippingMethods: state.shippingMethods,
        returnRequests: state.returnRequests,
        settings: state.settings
      };
      localStorage.setItem('ecommerce_data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save ecommerce data to localStorage:', error);
    }
  },

  exportData: () => {
    const state = get();
    const data = {
      products: state.products,
      orders: state.orders,
      taxRates: state.taxRates,
      shippingMethods: state.shippingMethods,
      returnRequests: state.returnRequests,
      settings: state.settings,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecommerce_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData: (data) => {
    try {
      set({
        products: data.products || [],
        categories: data.categories || [],
        tags: data.tags || [],
        orders: data.orders || [],
        taxRates: data.taxRates || [],
        shippingMethods: data.shippingMethods || [],
        returnRequests: data.returnRequests || [],
        settings: data.settings || get().settings
      });
      
      get().saveToLocalStorage();
    } catch (error) {
      console.error('Failed to import ecommerce data:', error);
    }
  }
}));

// Helper hooks
export const useFilteredProducts = () => {
  const { 
    products, 
    searchTerm, 
    selectedCategory, 
    selectedStatus, 
    sortBy, 
    sortOrder 
  } = useEcommerceStore();

  return products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.inventory.quantity;
          bValue = b.inventory.quantity;
          break;
        case 'sales':
          aValue = 0; // Would need order data
          bValue = 0;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
};

export const useInventoryAlerts = () => {
  const { products } = useEcommerceStore();
  
  return products
    .filter(product => product.inventory.trackInventory)
    .filter(product => 
      product.inventory.quantity === 0 || 
      product.inventory.quantity <= product.inventory.reorderLevel
    )
    .map(product => ({
      product,
      currentStock: product.inventory.quantity,
      reorderLevel: product.inventory.reorderLevel,
      status: product.inventory.quantity === 0 ? 'out_of_stock' : 'low_stock' as const
    }));
};
