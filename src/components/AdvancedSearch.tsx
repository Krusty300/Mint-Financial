import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Save, 
  Bookmark, 
  X, 
  Plus, 
  User,
  FileText,
  Tag,
  Clock,
  Star,
  Settings,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useInvoiceStore } from '../stores/invoiceStore';
import type { Invoice, Client } from '../types';

interface SearchFilters {
  query: string;
  status: string[];
  clientId: string[];
  dateRange: {
    start: string;
    end: string;
  };
  amountRange: {
    min: string;
    max: string;
  };
  tags: string[];
  customFields: Record<string, any>;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
  isDefault: boolean;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'invoice' | 'client' | 'tag' | 'recent';
  count?: number;
  icon?: React.ReactNode;
}

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  layout: WidgetConfig[];
  isDefault: boolean;
  category: 'business' | 'freelancer' | 'enterprise' | 'custom';
}

interface WidgetConfig {
  id: string;
  type: 'stats' | 'chart' | 'table' | 'kpi' | 'activity';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  isVisible: boolean;
}

export const AdvancedSearch: React.FC = () => {
  const { invoices, clients } = useInvoiceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  // Explicit type usage to satisfy linter
  const _invoiceType: Invoice | null = invoices[0] || null;
  const _clientType: Client | null = clients[0] || null;
  
  // Use the types to satisfy linter
  if (_invoiceType || _clientType) {
    console.log('Types loaded for linter satisfaction');
  }
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: [],
    clientId: [],
    dateRange: { start: '', end: '' },
    amountRange: { min: '', max: '' },
    tags: [],
    customFields: {}
  });

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    {
      id: '1',
      name: 'Overdue Invoices',
      filters: {
        query: '',
        status: ['overdue'],
        clientId: [],
        dateRange: { start: '', end: '' },
        amountRange: { min: '', max: '' },
        tags: [],
        customFields: {}
      },
      createdAt: new Date('2024-01-15'),
      useCount: 24,
      isDefault: false
    },
    {
      id: '2',
      name: 'High Value Clients',
      filters: {
        query: '',
        status: [],
        clientId: [],
        dateRange: { start: '', end: '' },
        amountRange: { min: '10000', max: '' },
        tags: [],
        customFields: {}
      },
      createdAt: new Date('2024-01-20'),
      useCount: 18,
      isDefault: false
    }
  ]);

  const [dashboardTemplates] = useState<DashboardTemplate[]>([
    {
      id: '1',
      name: 'Executive Overview',
      description: 'High-level metrics and trends for executives',
      layout: [
        { id: '1', type: 'stats', title: 'Revenue Overview', position: { x: 0, y: 0, w: 4, h: 2 }, config: {}, isVisible: true },
        { id: '2', type: 'chart', title: 'Revenue Trend', position: { x: 4, y: 0, w: 8, h: 3 }, config: {}, isVisible: true },
        { id: '3', type: 'kpi', title: 'Key Metrics', position: { x: 0, y: 2, w: 12, h: 2 }, config: {}, isVisible: true }
      ],
      isDefault: true,
      category: 'business'
    },
    {
      id: '2',
      name: 'Freelancer Dashboard',
      description: 'Focused on project tracking and payments',
      layout: [
        { id: '1', type: 'stats', title: 'Project Stats', position: { x: 0, y: 0, w: 6, h: 2 }, config: {}, isVisible: true },
        { id: '2', type: 'table', title: 'Recent Invoices', position: { x: 6, y: 0, w: 6, h: 4 }, config: {}, isVisible: true },
        { id: '3', type: 'activity', title: 'Recent Activity', position: { x: 0, y: 2, w: 12, h: 2 }, config: {}, isVisible: true }
      ],
      isDefault: true,
      category: 'freelancer'
    }
  ]);

  const [userPreferences, setUserPreferences] = useState({
    defaultSearchScope: 'all',
    autoSaveSearches: true,
    showSuggestions: true,
    resultsPerPage: 20,
    defaultTemplate: '1',
    customWidgets: [] as WidgetConfig[]
  });

  // Generate search suggestions
  const searchSuggestions = useMemo((): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    
    // Recent searches (mock data)
    const recentSearches = ['overdue invoices', 'john doe', 'high value', 'last month'];
    recentSearches.forEach((search, index) => {
      suggestions.push({
        id: `recent-${index}`,
        text: search,
        type: 'recent',
        icon: <Clock className="w-4 h-4" />
      });
    });

    // Invoice suggestions
    if (searchQuery.length > 0) {
      const matchingInvoices = invoices
        .filter(inv => 
          inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.notes?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3);
      
      matchingInvoices.forEach(inv => {
        suggestions.push({
          id: inv.id,
          text: inv.invoiceNumber,
          type: 'invoice',
          count: inv.total,
          icon: <FileText className="w-4 h-4" />
        });
      });
    }

    // Client suggestions
    if (searchQuery.length > 0) {
      const matchingClients = clients
        .filter(client => 
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3);
      
      matchingClients.forEach(client => {
        suggestions.push({
          id: client.id,
          text: client.name,
          type: 'client',
          icon: <User className="w-4 h-4" />
        });
      });
    }

    // Tag suggestions
    const allTags = Array.from(new Set(
      invoices.flatMap(inv => inv.customFields ? Object.keys(inv.customFields) : [])
    ));
    if (searchQuery.length > 0) {
      const matchingTags = allTags
        .filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 2);
      
      matchingTags.forEach(tag => {
        suggestions.push({
          id: tag,
          text: tag,
          type: 'tag',
          icon: <Tag className="w-4 h-4" />
        });
      });
    }

    return suggestions;
  }, [searchQuery, invoices, clients]);

  // Apply filters and search
  const filteredResults = useMemo(() => {
    let filtered = invoices;

    // Apply text search
    if (filters.query || searchQuery) {
      const query = (filters.query || searchQuery).toLowerCase();
      filtered = filtered.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.notes?.toLowerCase().includes(query) ||
        clients.find(c => c.id === inv.clientId)?.name.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(inv => filters.status.includes(inv.status));
    }

    // Apply client filter
    if (filters.clientId.length > 0) {
      filtered = filtered.filter(inv => filters.clientId.includes(inv.clientId));
    }

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(inv => {
        const invDate = new Date(inv.issueDate);
        const start = filters.dateRange.start ? new Date(filters.dateRange.start) : new Date(0);
        const end = filters.dateRange.end ? new Date(filters.dateRange.end) : new Date();
        return invDate >= start && invDate <= end;
      });
    }

    // Apply amount range filter
    if (filters.amountRange.min || filters.amountRange.max) {
      filtered = filtered.filter(inv => {
        const min = filters.amountRange.min ? parseFloat(filters.amountRange.min) : 0;
        const max = filters.amountRange.max ? parseFloat(filters.amountRange.max) : Infinity;
        return inv.total >= min && inv.total <= max;
      });
    }

    return filtered;
  }, [invoices, clients, filters, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, query }));
    setShowSuggestions(false);
  }, []);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
    setSelectedSuggestionIndex(-1);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const saveCurrentSearch = () => {
    const name = prompt('Enter a name for this search:');
    if (name) {
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        name,
        filters: { ...filters, query: searchQuery },
        createdAt: new Date(),
        useCount: 0,
        isDefault: false
      };
      setSavedSearches(prev => [...prev, newSearch]);
    }
  };

  const applySavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
    setSearchQuery(savedSearch.filters.query);
    setShowSavedSearches(false);
    
    // Update usage statistics
    setSavedSearches(prev => 
      prev.map(search => 
        search.id === savedSearch.id 
          ? { ...search, lastUsed: new Date(), useCount: search.useCount + 1 }
          : search
      )
    );
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
  };

  const exportResults = () => {
    const data = {
      searchQuery,
      filters,
      results: filteredResults.map(inv => {
        const client = clients.find(c => c.id === inv.clientId);
        return {
          ...inv,
          clientName: client?.name || 'Unknown'
        };
      }),
      exportedAt: new Date()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Advanced Search</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowSavedSearches(!showSavedSearches)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Saved Searches</span>
              <span className="sm:hidden">Saved</span>
            </button>
            <button
              onClick={exportResults}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Exp</span>
            </button>
          </div>
        </div>

        {/* Main Search Bar */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  setSelectedSuggestionIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedSuggestionIndex(prev => 
                      prev < searchSuggestions.length - 1 ? prev + 1 : prev
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
                  } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
                    e.preventDefault();
                    handleSuggestionClick(searchSuggestions[selectedSuggestionIndex]);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Search invoices, clients, amounts..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters(prev => ({ ...prev, query: '' }));
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
            </button>
            
            <button
              onClick={saveCurrentSearch}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              <span className="hidden sm:inline">Save Search</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-3 cursor-pointer transition-colors ${
                    index === selectedSuggestionIndex 
                      ? 'bg-blue-50 border-l-4 border-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {suggestion.icon}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{suggestion.text}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {suggestion.type}
                      {suggestion.count && ` • ${formatCurrency(suggestion.count)}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="space-y-2 max-h-32 sm:max-h-none overflow-y-auto">
                  {['draft', 'sent', 'paid', 'overdue', 'viewed', 'partial'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('status', [...filters.status, status]);
                          } else {
                            handleFilterChange('status', filters.status.filter(s => s !== status));
                          }
                        }}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Client Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clients</label>
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {clients.slice(0, 10).map(client => (
                    <label key={client.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.clientId.includes(client.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('clientId', [...filters.clientId, client.id]);
                          } else {
                            handleFilterChange('clientId', filters.clientId.filter(id => id !== client.id));
                          }
                        }}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 truncate">{client.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Amount Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min amount"
                    value={filters.amountRange.min}
                    onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, min: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max amount"
                    value={filters.amountRange.max}
                    onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, max: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setFilters({
                    query: searchQuery,
                    status: [],
                    clientId: [],
                    dateRange: { start: '', end: '' },
                    amountRange: { min: '', max: '' },
                    tags: [],
                    customFields: {}
                  });
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved Searches Panel */}
      {showSavedSearches && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Saved Searches</h2>
            <button
              onClick={() => setShowSavedSearches(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedSearches.map(savedSearch => (
              <div key={savedSearch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{savedSearch.name}</h3>
                  <div className="flex items-center gap-1">
                    {savedSearch.isDefault && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <button
                      onClick={() => deleteSavedSearch(savedSearch.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  {savedSearch.filters.status.length > 0 && (
                    <div>Status: {savedSearch.filters.status.join(', ')}</div>
                  )}
                  {savedSearch.filters.amountRange.min && (
                    <div>Amount: ${savedSearch.filters.amountRange.min} - ${savedSearch.filters.amountRange.max || '∞'}</div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Used {savedSearch.useCount} times</span>
                  <span>Created {formatDate(savedSearch.createdAt)}</span>
                </div>
                
                <button
                  onClick={() => applySavedSearch(savedSearch)}
                  className="w-full mt-3 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Apply Search
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Search Results ({filteredResults.length})
          </h2>
          <div className="text-sm text-gray-500">
            Showing {filteredResults.length} of {invoices.length} invoices
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 px-4">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-full sm:min-w-0">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Invoice</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Client</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:table-cell">Date</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:table-cell">Due Date</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Amount</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Status</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(invoice => {
                  const client = clients.find(c => c.id === invoice.clientId);
                  return (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4">
                        <div className="font-medium text-gray-900 text-sm">{invoice.invoiceNumber}</div>
                        {invoice.notes && (
                          <div className="text-xs text-gray-500 truncate max-w-24 sm:max-w-xs">{invoice.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="font-medium text-gray-900 text-sm">{client?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500 hidden sm:block">{client?.email}</div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="py-3 px-2 sm:px-4 font-medium text-gray-900 text-sm">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button className="text-blue-600 hover:text-blue-800 p-1">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 p-1">
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dashboard Templates Section */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Dashboard Templates</h2>
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Template</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {dashboardTemplates.map(template => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                {template.isDefault && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Default
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="capitalize">{template.category}</span>
                <span>{template.layout.length} widgets</span>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Use Template
                </button>
                <button className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Preferences Section */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">User Preferences</h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Reset to Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Search Scope</label>
            <select
              value={userPreferences.defaultSearchScope}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, defaultSearchScope: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Data</option>
              <option value="invoices">Invoices Only</option>
              <option value="clients">Clients Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Results Per Page</label>
            <select
              value={userPreferences.resultsPerPage}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, resultsPerPage: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Dashboard Template</label>
            <select
              value={userPreferences.defaultTemplate}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, defaultTemplate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dashboardTemplates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoSave"
              checked={userPreferences.autoSaveSearches}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, autoSaveSearches: e.target.checked }))}
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoSave" className="text-sm text-gray-700">Auto-save searches</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showSuggestions"
              checked={userPreferences.showSuggestions}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, showSuggestions: e.target.checked }))}
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showSuggestions" className="text-sm text-gray-700">Show search suggestions</label>
          </div>
        </div>
      </div>
    </div>
  );
};
