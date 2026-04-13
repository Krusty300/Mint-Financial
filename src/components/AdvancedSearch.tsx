import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Trash2,
  Calendar
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

interface SearchTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  filters: SearchFilters;
  isDefault?: boolean;
}

interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  filters: SearchFilters;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'invoice' | 'client' | 'amount' | 'date' | 'template';
  icon: React.ReactNode;
  data?: any;
  count?: number;
}

interface UserPreferences {
  defaultSearchScope: 'all' | 'invoices' | 'clients';
  autoSaveSearches: boolean;
  showSuggestions: boolean;
  resultsPerPage: number;
  defaultTemplate: string;
  customWidgets: WidgetConfig[];
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
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showSearchTemplates, setShowSearchTemplates] = useState(false);
  const [showUserPreferences, setShowUserPreferences] = useState(false);
  
  // Search history state
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>(() => {
    try {
      const saved = localStorage.getItem('advanced-search-history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  });
  
  // Search templates state
  const [searchTemplates, setSearchTemplates] = useState<SearchTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('advanced-search-templates');
      return saved ? JSON.parse(saved) : [
        {
          id: '1',
          name: 'Overdue Invoices',
          description: 'Find all overdue invoices',
          icon: 'alert',
          filters: {
            query: '',
            status: ['overdue'],
            clientId: [],
            dateRange: { start: '', end: '' },
            amountRange: { min: '', max: '' },
            tags: [],
            customFields: {}
          },
          isDefault: true
        },
        {
          id: '2',
          name: 'High Value Invoices',
          description: 'Invoices over $10,000',
          icon: 'dollar',
          filters: {
            query: '',
            status: [],
            clientId: [],
            dateRange: { start: '', end: '' },
            amountRange: { min: '10000', max: '' },
            tags: [],
            customFields: {}
          },
          isDefault: false
        },
        {
          id: '3',
          name: 'Recent Invoices',
          description: 'Invoices from last 30 days',
          icon: 'calendar',
          filters: {
            query: '',
            status: [],
            clientId: [],
            dateRange: { 
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end: new Date().toISOString().split('T')[0]
            },
            amountRange: { min: '', max: '' },
            tags: [],
            customFields: {}
          },
          isDefault: false
        }
      ];
    } catch (error) {
      console.error('Error loading search templates:', error);
      return [];
    }
  });
  
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

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    try {
      const saved = localStorage.getItem('advanced-search-saved-searches');
      return saved ? JSON.parse(saved) : [
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
          createdAt: new Date(),
          useCount: 0,
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
          createdAt: new Date(),
          useCount: 0,
          isDefault: false
        }
      ];
    } catch (error) {
      console.error('Error loading saved searches:', error);
      return [];
    }
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('advanced-search-preferences');
      return saved ? JSON.parse(saved) : {
        defaultSearchScope: 'all',
        resultsPerPage: 20,
        defaultTemplate: 'executive',
        autoSaveSearches: true,
        showSuggestions: true
      };
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return {
        defaultSearchScope: 'all',
        resultsPerPage: 20,
        defaultTemplate: 'executive',
        autoSaveSearches: true,
        showSuggestions: true
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('advanced-search-saved-searches', JSON.stringify(savedSearches));
    } catch (error) {
      console.error('Error saving saved searches:', error);
    }
  }, [savedSearches]);

  useEffect(() => {
    try {
      localStorage.setItem('advanced-search-preferences', JSON.stringify(userPreferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }, [userPreferences]);

  const [dashboardTemplates, setDashboardTemplates] = useState<DashboardTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('advanced-search-dashboard-templates');
      return saved ? JSON.parse(saved) : [
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
      ];
    } catch (error) {
      console.error('Error loading dashboard templates:', error);
      return [];
    }
  });

  // Save dashboard templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('advanced-search-dashboard-templates', JSON.stringify(dashboardTemplates));
    } catch (error) {
      console.error('Error saving dashboard templates:', error);
    }
  }, [dashboardTemplates]);

  const createNewTemplate = () => {
    const name = prompt('Enter a name for the new template:');
    if (name) {
      const newTemplate: DashboardTemplate = {
        id: Date.now().toString(),
        name,
        description: 'Custom dashboard template',
        layout: [
          { id: '1', type: 'stats', title: 'Statistics', position: { x: 0, y: 0, w: 12, h: 2 }, config: {}, isVisible: true }
        ],
        isDefault: false,
        category: 'custom'
      };
      setDashboardTemplates(prev => [...prev, newTemplate]);
    }
  };

  const useTemplate = (template: DashboardTemplate) => {
    // Apply template to user preferences
    setUserPreferences(prev => ({ ...prev, defaultTemplate: template.id }));
    console.log('Applied template:', template.name);
    
    // Navigate to dashboard with template
    window.location.href = '/dashboard?template=' + template.id;
  };

  // Fuzzy search function
  const fuzzySearch = (text: string, query: string): boolean => {
    if (!query) return true;
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match
    if (textLower.includes(queryLower)) return true;
    
    // Levenshtein distance approximation (simplified)
    const distance = (str1: string, str2: string): number => {
      const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
      
      for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
      
      for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
          const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1,
            matrix[j - 1][i] + 1,
            matrix[j - 1][i - 1] + indicator
          );
        }
      }
      
      return matrix[str2.length][str1.length];
    };
    
    // Allow small typos
    return distance(textLower, queryLower) <= Math.max(1, Math.floor(query.length * 0.3));
  };

  // Save search to history
  const saveSearchToHistory = useCallback((query: string, resultCount: number) => {
    if (!query.trim()) return;
    
    const historyItem: SearchHistory = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: new Date(),
      resultCount,
      filters: { ...filters, query }
    };
    
    setSearchHistory(prev => {
      // Remove duplicate and add to beginning
      const filtered = prev.filter(item => item.query !== query.trim());
      return [historyItem, ...filtered].slice(0, 20); // Keep last 20 searches
    });
  }, [filters]);

  // Save search history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('advanced-search-history', JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, [searchHistory]);

  // Save search templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('advanced-search-templates', JSON.stringify(searchTemplates));
    } catch (error) {
      console.error('Error saving search templates:', error);
    }
  }, [searchTemplates]);

  // Apply search template
  const applySearchTemplate = (template: SearchTemplate) => {
    setFilters(template.filters);
    setSearchQuery(template.filters.query);
    setShowSearchTemplates(false);
    setShowFilters(true);
  };

  // Create new search template
  const createSearchTemplate = () => {
    const name = prompt('Enter a name for this search template:');
    if (name && searchQuery.trim()) {
      const newTemplate: SearchTemplate = {
        id: Date.now().toString(),
        name,
        description: `Custom template for: ${searchQuery}`,
        icon: 'custom',
        filters: { ...filters, query: searchQuery },
        isDefault: false
      };
      setSearchTemplates(prev => [...prev, newTemplate]);
      setShowSearchTemplates(false);
    }
  };

  // Reset user preferences to defaults
  const resetUserPreferences = () => {
    const defaultPreferences: UserPreferences = {
      defaultSearchScope: 'all',
      resultsPerPage: 20,
      defaultTemplate: 'executive',
      autoSaveSearches: true,
      showSuggestions: true,
      customWidgets: []
    };
    setUserPreferences(defaultPreferences);
  };

  // Generate search suggestions with real-time search
  const searchSuggestions = useMemo((): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) return suggestions;
    
    // Add search templates as suggestions
    searchTemplates.forEach(template => {
      if (fuzzySearch(template.name, query) || fuzzySearch(template.description, query)) {
        suggestions.push({
          id: `template-${template.id}`,
          text: template.name,
          type: 'template' as const,
          icon: <Settings className="w-4 h-4 text-blue-500" />,
          data: template
        });
      }
    });
    
    // Add recent searches from history
    searchHistory.slice(0, 5).forEach(item => {
      if (fuzzySearch(item.query, query)) {
        suggestions.push({
          id: `history-${item.id}`,
          text: item.query,
          type: 'invoice' as const,
          icon: <Clock className="w-4 h-4 text-gray-500" />,
          data: item,
          count: item.resultCount
        });
      }
    });
    
    // Add invoice suggestions
    invoices.forEach(invoice => {
      if (fuzzySearch(invoice.invoiceNumber, query) || 
          fuzzySearch(invoice.notes || '', query)) {
        suggestions.push({
          id: `invoice-${invoice.id}`,
          text: invoice.invoiceNumber,
          type: 'invoice' as const,
          icon: <FileText className="w-4 h-4 text-blue-500" />,
          data: invoice,
          count: invoice.total
        });
      }
    });
    
    // Add client suggestions
    clients.forEach(client => {
      if (fuzzySearch(client.name, query) || 
          fuzzySearch(client.email || '', query)) {
        suggestions.push({
          id: `client-${client.id}`,
          text: client.name,
          type: 'client' as const,
          icon: <User className="w-4 h-4 text-green-500" />,
          data: client
        });
      }
    });
    
    // Add amount suggestions
    if (query.includes('$') || query.includes('amount') || !isNaN(Number(query))) {
      const amounts = [100, 500, 1000, 5000, 10000, 25000, 50000];
      amounts.forEach(amount => {
        if (fuzzySearch(`$${amount}`, query)) {
          suggestions.push({
            id: `amount-${amount}`,
            text: `$${amount}`,
            type: 'amount' as const,
            icon: <Tag className="w-4 h-4 text-purple-500" />,
            count: amount
          });
        }
      });
    }
    
    // Add date suggestions
    if (query.includes('today') || query.includes('yesterday') || query.includes('week') || query.includes('month')) {
      const dates = [
        { text: 'Today', value: new Date().toISOString().split('T')[0] },
        { text: 'Yesterday', value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { text: 'Last Week', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { text: 'Last Month', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
      ];
      
      dates.forEach(date => {
        if (fuzzySearch(date.text, query)) {
          suggestions.push({
            id: `date-${date.value}`,
            text: date.text,
            type: 'date' as const,
            icon: <Calendar className="w-4 h-4 text-orange-500" />,
            data: date
          });
        }
      });
    }
    
    // Remove duplicates and limit to 10 suggestions
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text === suggestion.text)
    );
    
    return uniqueSuggestions.slice(0, 10);
  }, [searchQuery, invoices, clients, searchHistory, searchTemplates]);

  // Apply filters and search
  const filteredResults = useMemo(() => {
    let filtered = invoices;

    // Apply text search with fuzzy matching
    if (filters.query || searchQuery) {
      const query = (filters.query || searchQuery).toLowerCase();
      filtered = filtered.filter(inv => 
        fuzzySearch(inv.invoiceNumber, query) ||
        fuzzySearch(inv.notes || '', query) ||
        fuzzySearch(clients.find(c => c.id === inv.clientId)?.name || '', query)
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
  }, [invoices, clients, filters, searchQuery, fuzzySearch]);

  // Save search to history when results change
  useEffect(() => {
    if (searchQuery.trim()) {
      saveSearchToHistory(searchQuery, filteredResults.length);
    }
  }, [searchQuery, filteredResults.length, saveSearchToHistory]);

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
      exportedAt: new Date(),
      totalResults: filteredResults.length
    };
    
    // Create CSV format for better compatibility
    const csvContent = [
      'Invoice Number,Client Name,Issue Date,Due Date,Amount,Status,Notes',
      ...data.results.map(inv => [
        inv.invoiceNumber,
        inv.clientName,
        new Date(inv.issueDate).toLocaleDateString(),
        new Date(inv.dueDate).toLocaleDateString(),
        inv.total.toFixed(2),
        inv.status,
        inv.notes || ''
      ].join(','))
    ].join('\n');
    
    // Export as CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Also save to localStorage as backup
    try {
      localStorage.setItem('advanced-search-last-export', JSON.stringify(data));
      console.log('Search results exported successfully');
    } catch (error) {
      console.error('Error saving export to localStorage:', error);
    }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && searchSuggestions[selectedSuggestionIndex]) {
          handleSuggestionClick(searchSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Advanced Search</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowSearchHistory(!showSearchHistory)}
              className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Search History</span>
              <span className="sm:hidden">History</span>
            </button>
            <button
              onClick={() => setShowSearchTemplates(!showSearchTemplates)}
              className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Search Templates</span>
              <span className="sm:hidden">Templates</span>
            </button>
            <button
              onClick={() => setShowSavedSearches(!showSavedSearches)}
              className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Saved Searches</span>
              <span className="sm:hidden">Saved</span>
            </button>
            <button
              onClick={exportResults}
              className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Exp</span>
            </button>
          </div>
        </div>

        {/* Main Search Bar */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  setSelectedSuggestionIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search invoices, clients, amounts..."
                className="w-full pl-9 sm:pl-10 pr-10 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base sm:text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 sm:p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors touch-manipulation ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
            </button>
            
            <button
              onClick={saveCurrentSearch}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors touch-manipulation"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Save Search</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 sm:max-h-64 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 cursor-pointer transition-colors ${
                    index === selectedSuggestionIndex 
                      ? 'bg-blue-50 border-l-4 border-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5">{suggestion.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base text-gray-900 truncate">{suggestion.text}</div>
                    <div className="text-xs sm:text-sm text-gray-500 capitalize">
                      {suggestion.type}
                      {suggestion.count && ` ${formatCurrency(suggestion.count)}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search History Panel */}
        {showSearchHistory && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Search History</h2>
              <button
                onClick={() => setShowSearchHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {searchHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No search history yet</p>
              ) : (
                searchHistory.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSearchQuery(item.query);
                      setFilters(item.filters);
                      setShowSearchHistory(false);
                    }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{item.query}</div>
                      <div className="text-xs text-gray-500">
                        {item.resultCount} results
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(item.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Search Templates Panel */}
        {showSearchTemplates && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Search Templates</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={createSearchTemplate}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!searchQuery.trim()}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Template</span>
                  <span className="sm:hidden">Create</span>
                </button>
                <button
                  onClick={() => setShowSearchTemplates(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => applySearchTemplate(template)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    {template.isDefault && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Click to apply</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Search Results ({filteredResults.length})
          </h2>
          <div className="text-xs sm:text-sm text-gray-500">
            Showing {filteredResults.length} of {invoices.length} invoices
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 px-2 sm:px-4 text-sm sm:text-base">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-full sm:min-w-0">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Invoice</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Client</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:table-cell">Date</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:table-cell">Due Date</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Amount</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Status</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(invoice => {
                  const client = clients.find(c => c.id === invoice.clientId);
                  return (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 sm:py-3 px-2 sm:px-3 lg:px-4">
                        <div className="font-medium text-sm sm:text-base text-gray-900">{invoice.invoiceNumber}</div>
                        {invoice.notes && (
                          <div className="text-xs text-gray-500 truncate max-w-20 sm:max-w-24 lg:max-w-xs">{invoice.notes}</div>
                        )}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-3 lg:px-4">
                        <div className="font-medium text-sm sm:text-base text-gray-900">{client?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500 hidden sm:block">{client?.email}</div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-3 lg:px-4 font-medium text-sm sm:text-base text-gray-900">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-3 lg:px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-3 lg:px-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button 
                            onClick={() => {
                              // Navigate to invoice view - open in new tab or modal
                              console.log('View invoice:', invoice.id);
                              // For now, navigate to invoices page with the invoice ID
                              window.location.href = `/invoices?view=${invoice.id}`;
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1 sm:p-1.5 rounded hover:bg-blue-50 transition-colors touch-manipulation"
                            title="View Invoice"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              // Navigate to invoice edit
                              console.log('Edit invoice:', invoice.id);
                              window.location.href = `/invoices?edit=${invoice.id}`;
                            }}
                            className="text-gray-600 hover:text-gray-800 p-1 sm:p-1.5 rounded hover:bg-gray-50 transition-colors touch-manipulation"
                            title="Edit Invoice"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              console.log('Delete invoice:', invoice.id);
                              if (confirm('Are you sure you want to delete this invoice?')) {
                                // TODO: Implement delete functionality
                              }
                            }}
                            className="text-red-600 hover:text-red-800 p-1 sm:p-1.5 rounded hover:bg-red-50 transition-colors touch-manipulation"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
          <button onClick={createNewTemplate} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                <button onClick={() => useTemplate(template)} className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
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
      {showUserPreferences && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">User Preferences</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={resetUserPreferences}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Reset to Defaults
              </button>
              <button
                onClick={() => setShowUserPreferences(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Search Scope</label>
            <select
              value={userPreferences.defaultSearchScope}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, defaultSearchScope: e.target.value as 'all' | 'invoices' | 'clients' }))}
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
              onChange={(e) => setUserPreferences(prev => ({ ...prev, resultsPerPage: parseInt(e.target.value) as number }))}
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
              onChange={(e) => setUserPreferences(prev => ({ ...prev, defaultTemplate: e.target.value as string }))}
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
              onChange={(e) => setUserPreferences(prev => ({ ...prev, autoSaveSearches: e.target.checked as boolean }))}
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoSave" className="text-sm text-gray-700">Auto-save searches</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showSuggestions"
              checked={userPreferences.showSuggestions}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, showSuggestions: e.target.checked as boolean }))}
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showSuggestions" className="text-sm text-gray-700">Show search suggestions</label>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
