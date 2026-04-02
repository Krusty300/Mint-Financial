import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Download, 
  Upload,
  AlertTriangle,
  Box,
  Grid,
  List
} from 'lucide-react';
import { useEcommerceStore, useFilteredProducts } from '../../stores/ecommerceStore';
import type { Product } from '../../types/ecommerce';

const ProductCatalog: React.FC = () => {
  const {
    products,
    categories,
    searchTerm,
    selectedCategory,
    selectedStatus,
    sortBy,
    setSearchTerm,
    setSelectedCategory,
    setSelectedStatus,
    setSortBy,
    deleteProduct,
    updateInventory,
    exportData
  } = useEcommerceStore();

  const filteredProducts = useFilteredProducts();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  };

  const handleEditProduct = (product: Product) => {
    // TODO: Implement edit functionality
    console.log('Edit product:', product);
  };

  const handleQuickInventoryUpdate = (productId: string, quantity: number) => {
    updateInventory(productId, quantity);
  };

  const getStockStatus = (product: Product) => {
    if (!product.inventory.trackInventory) return { status: 'not_tracked', color: 'gray', text: 'Not Tracked' };
    if (product.inventory.quantity === 0) return { status: 'out_of_stock', color: 'red', text: 'Out of Stock' };
    if (product.inventory.quantity <= product.inventory.reorderLevel) return { status: 'low_stock', color: 'yellow', text: 'Low Stock' };
    return { status: 'in_stock', color: 'green', text: 'In Stock' };
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const stockStatus = getStockStatus(product);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4">
          {/* Product Image */}
          <div className="aspect-w-1 aspect-h-1 w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
            {product.images.length > 0 ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Package className="h-12 w-12 text-gray-400" />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
            
            {/* SKU and Category */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>SKU: {product.sku}</span>
              <span className="px-2 py-1 bg-gray-100 rounded">{product.category}</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                stockStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {stockStatus.text}
              </span>
            </div>

            {/* Inventory */}
            {product.inventory.trackInventory && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Stock: {product.inventory.quantity}</span>
                {stockStatus.status === 'low_stock' && (
                  <span className="text-yellow-600 text-xs">Reorder at {product.inventory.reorderLevel}</span>
                )}
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {product.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{product.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEditProduct(product)}
                className="p-1 text-gray-600 hover:text-blue-600"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="p-1 text-gray-600 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            {/* Quick Inventory Update */}
            {product.inventory.trackInventory && (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={product.inventory.quantity}
                  onChange={(e) => handleQuickInventoryUpdate(product.id, parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <Box className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ProductListItem: React.FC<{ product: Product }> = ({ product }) => {
    const stockStatus = getStockStatus(product);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                {product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Package className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.description}</p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>SKU: {product.sku}</span>
                  <span>Category: {product.category}</span>
                  {product.tags.length > 0 && (
                    <span>Tags: {product.tags.join(', ')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Price and Stock */}
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</div>
                <div className={`text-sm font-medium ${
                  stockStatus.color === 'green' ? 'text-green-600' :
                  stockStatus.color === 'yellow' ? 'text-yellow-600' :
                  stockStatus.color === 'red' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {stockStatus.text}
                </div>
              </div>

              {product.inventory.trackInventory && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Stock</div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={product.inventory.quantity}
                      onChange={(e) => handleQuickInventoryUpdate(product.id, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    {stockStatus.status === 'low_stock' && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditProduct(product)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
          <p className="text-gray-600">Manage your product inventory and pricing</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
            <option value="createdAt">Sort by Created</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first product</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {/* Products Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
            {/* Add Product Form */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Product Description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="SKU"
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Price"
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
