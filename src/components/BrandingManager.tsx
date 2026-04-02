import React, { useState, useRef } from 'react';
import { Upload, Download, Palette, Type, Layout, Eye, Save, Trash2, Plus } from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import type { Brand } from '../types';

export const BrandingManager: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([
    {
      id: '1',
      name: 'Default Brand',
      primaryColor: '#3B82F6',
      secondaryColor: '#64748B',
      accentColor: '#10B981',
      fontFamily: 'Inter',
      fontSize: {
        small: '0.875rem',
        medium: '1rem',
        large: '1.25rem'
      },
      layout: {
        headerStyle: 'center',
        footerStyle: 'center',
        tableStyle: 'modern'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [selectedBrand, setSelectedBrand] = useState<Brand>(brands[0]);
  const [activeTab, setActiveTab] = useState<'branding' | 'templates'>('branding');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create sample invoice data for preview
  const sampleInvoice = {
    id: 'sample-invoice-1',
    invoiceNumber: 'INV-2024-001',
    clientId: 'sample-client-1',
    issueDate: new Date('2024-03-15'),
    dueDate: new Date('2024-04-15'),
    status: 'sent' as const,
    items: [
      {
        id: 'item-1',
        description: 'Web Development Services',
        quantity: 40,
        rate: 150,
        total: 6000
      },
      {
        id: 'item-2',
        description: 'UI/UX Design',
        quantity: 20,
        rate: 120,
        total: 2400
      }
    ],
    subtotal: 8400,
    taxRate: 8.25,
    total: 9093,
    notes: 'Payment due within 30 days. Thank you for your business!',
    paymentTerms: 'Net 30 days'
  };

  const sampleClient = {
    id: 'sample-client-1',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, New York, NY 10001',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setSelectedBrand(prev => ({
          ...prev,
          logo: logoUrl,
          updatedAt: new Date()
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrandUpdate = (field: keyof Brand, value: any) => {
    setSelectedBrand(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date()
    }));
  };

  const saveBrand = () => {
    setBrands(prev => prev.map(brand => 
      brand.id === selectedBrand.id ? selectedBrand : brand
    ));
    // Save to localStorage
    localStorage.setItem('brands', JSON.stringify(brands));
    alert('Brand saved successfully!');
  };

  const createNewBrand = () => {
    const newBrand: Brand = {
      id: Date.now().toString(),
      name: `New Brand ${brands.length + 1}`,
      primaryColor: '#3B82F6',
      secondaryColor: '#64748B',
      accentColor: '#10B981',
      fontFamily: 'Inter',
      fontSize: {
        small: '0.875rem',
        medium: '1rem',
        large: '1.25rem'
      },
      layout: {
        headerStyle: 'center',
        footerStyle: 'center',
        tableStyle: 'modern'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setBrands(prev => [...prev, newBrand]);
    setSelectedBrand(newBrand);
  };

  const deleteBrand = (brandId: string) => {
    if (brands.length === 1) {
      alert('You must have at least one brand.');
      return;
    }
    setBrands(prev => prev.filter(brand => brand.id !== brandId));
    if (selectedBrand.id === brandId) {
      setSelectedBrand(brands.find(b => b.id !== brandId) || brands[0]);
    }
  };

  const exportBrand = () => {
    const dataStr = JSON.stringify(selectedBrand, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${selectedBrand.name.replace(/\s+/g, '_')}_brand.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Branding & Templates</h1>
          <p className="text-gray-600 mt-1">Customize your invoice appearance and create templates</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            onClick={createNewBrand}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Brand
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('branding')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'branding'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Branding
            </div>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Templates
            </div>
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Your Brands</h3>
            </div>
            <div className="p-4 space-y-2">
              {brands.map(brand => (
                <div
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedBrand.id === brand.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{brand.name}</div>
                      <div className="text-xs text-gray-500">
                        Updated {brand.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBrand(brand);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      {brands.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBrand(brand.id);
                          }}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brand Editor */}
        <div className="lg:col-span-2">
          {activeTab === 'branding' ? (
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Brand Settings</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={exportBrand}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                    <button
                      onClick={saveBrand}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                  <input
                    type="text"
                    value={selectedBrand.name}
                    onChange={(e) => handleBrandUpdate('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                  <div className="flex items-center gap-4">
                    {selectedBrand.logo ? (
                      <img 
                        src={selectedBrand.logo} 
                        alt="Company Logo" 
                        className="h-16 w-auto max-w-xs object-contain"
                      />
                    ) : (
                      <div className="h-16 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Upload Logo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Color Scheme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedBrand.primaryColor}
                          onChange={(e) => handleBrandUpdate('primaryColor', e.target.value)}
                          className="h-10 w-10 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={selectedBrand.primaryColor}
                          onChange={(e) => handleBrandUpdate('primaryColor', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Secondary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedBrand.secondaryColor}
                          onChange={(e) => handleBrandUpdate('secondaryColor', e.target.value)}
                          className="h-10 w-10 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={selectedBrand.secondaryColor}
                          onChange={(e) => handleBrandUpdate('secondaryColor', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedBrand.accentColor}
                          onChange={(e) => handleBrandUpdate('accentColor', e.target.value)}
                          className="h-10 w-10 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={selectedBrand.accentColor}
                          onChange={(e) => handleBrandUpdate('accentColor', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Type className="w-4 h-4 inline mr-1" />
                    Typography
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Font Family</label>
                      <select
                        value={selectedBrand.fontFamily}
                        onChange={(e) => handleBrandUpdate('fontFamily', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Merriweather">Merriweather</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Font Sizes</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedBrand.fontSize.small}
                          onChange={(e) => handleBrandUpdate('fontSize', {
                            ...selectedBrand.fontSize,
                            small: e.target.value
                          })}
                          placeholder="Small"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={selectedBrand.fontSize.medium}
                          onChange={(e) => handleBrandUpdate('fontSize', {
                            ...selectedBrand.fontSize,
                            medium: e.target.value
                          })}
                          placeholder="Medium"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={selectedBrand.fontSize.large}
                          onChange={(e) => handleBrandUpdate('fontSize', {
                            ...selectedBrand.fontSize,
                            large: e.target.value
                          })}
                          placeholder="Large"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Layout Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Layout className="w-4 h-4 inline mr-1" />
                    Layout Options
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Header Style</label>
                      <select
                        value={selectedBrand.layout.headerStyle}
                        onChange={(e) => handleBrandUpdate('layout', {
                          ...selectedBrand.layout,
                          headerStyle: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="center">Center</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Footer Style</label>
                      <select
                        value={selectedBrand.layout.footerStyle}
                        onChange={(e) => handleBrandUpdate('layout', {
                          ...selectedBrand.layout,
                          footerStyle: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="center">Center</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Table Style</label>
                      <select
                        value={selectedBrand.layout.tableStyle}
                        onChange={(e) => handleBrandUpdate('layout', {
                          ...selectedBrand.layout,
                          tableStyle: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Custom CSS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS (Advanced)</label>
                  <textarea
                    value={selectedBrand.customCss || ''}
                    onChange={(e) => handleBrandUpdate('customCss', e.target.value)}
                    placeholder="Add custom CSS rules here..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Template Builder</h3>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Template Builder Coming Soon</h4>
                  <p className="text-gray-600">Drag-and-drop template builder will be available in the next update.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Invoice Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <InvoicePreview
                invoice={sampleInvoice}
                client={sampleClient}
                company={{
                  name: selectedBrand.name || 'Your Company',
                  address: '123 Business St, City, State 12345',
                  phone: '+1 (555) 123-4567',
                  email: 'billing@yourcompany.com',
                  logo: selectedBrand.logo
                }}
                template={selectedBrand.layout.tableStyle === 'modern' ? 'modern' : selectedBrand.layout.tableStyle === 'classic' ? 'classic' : 'minimal'}
                showActions={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
