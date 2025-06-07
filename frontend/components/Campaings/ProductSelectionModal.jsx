import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setSearchTerm as setProductSearchTerm,
  setSortField as setProductSortField,
  setSortDirection as setProductSortDirection,
  fetchProducts,
  fetchApplicationProducts
} from '../../src/features/products/productsSlice';

const ProductSelectionModal = ({
  showModal,
  onClose,
  selectedProducts,
  onProductSelect,
  onSelectAllProducts,
  products,
  isLoading,
  company_id,
  application_id
}) => {
  const dispatch = useDispatch();
  const { 
    filters: { 
      searchTerm: productSearchTerm, 
      sortField: productSortField, 
      sortDirection: productSortDirection 
    },
    lastFetched
  } = useSelector((state) => state.products);

  if (!showModal) return null;

  const allVisibleSelected = products?.length > 0 && products.every(p => 
    selectedProducts?.some(selected => selected.uid === p.uid)
  );

  const handleProductSort = (field) => {
    if (productSortField === field) {
      dispatch(setProductSortDirection(productSortDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch(setProductSortField(field));
      dispatch(setProductSortDirection('asc'));
    }
  };

  const handleRefresh = () => {
    if (application_id) {
      dispatch(fetchApplicationProducts({ company_id, application_id }));
    } else {
      dispatch(fetchProducts(company_id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Select Products</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-blue-600 transition-all duration-200 hover:bg-white rounded-lg"
                title="Refresh products"
                disabled={isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="p-6 bg-white border-b border-gray-100">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search products..."
              value={productSearchTerm}
              onChange={(e) => dispatch(setProductSearchTerm(e.target.value))}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200 relative"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg fill=\'none\' stroke=\'%239CA3AF\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: '1rem center', backgroundSize: '1.25rem' }}
            />
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500">
              <span>Sort by:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleProductSort('name')}
                  className={`hover:text-blue-600 font-medium px-2 py-1 rounded transition-colors duration-200 ${productSortField === 'name' ? 'text-blue-600 bg-blue-50' : ''}`}
                >
                  Name {productSortField === 'name' && (productSortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  type="button"
                  onClick={() => handleProductSort('effective_price')}
                  className={`hover:text-blue-600 font-medium px-2 py-1 rounded transition-colors duration-200 ${productSortField === 'effective_price' ? 'text-blue-600 bg-blue-50' : ''}`}
                >
                  Price {productSortField === 'effective_price' && (productSortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  type="button"
                  onClick={() => handleProductSort('brand_name')}
                  className={`hover:text-blue-600 font-medium px-2 py-1 rounded transition-colors duration-200 ${productSortField === 'brand_name' ? 'text-blue-600 bg-blue-50' : ''}`}
                >
                  Brand {productSortField === 'brand_name' && (productSortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Select All Checkbox */}
        <div className="p-6 bg-white border-b border-gray-100">
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={() => onSelectAllProducts(products)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
              Select All ({products?.length} visible)
            </span>
          </label>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full max-w-2xl animate-pulse flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="h-10 w-10 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : products?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {products.map((product) => (
                <label
                  key={product.uid}
                  className="flex items-center p-4 hover:bg-white transition-colors duration-200 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.some(selected => selected.uid === product.uid)}
                    onChange={() => onProductSelect(product)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200"
                  />
                  <div className="ml-4 flex-1 flex items-center gap-4">
                    {product.images && product.images?.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-lg font-semibold text-blue-600">
                          {product.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {product.name}
                      </div>
                      {product.brand && (
                        <div className="text-xs text-gray-500">{product.brand.name}</div>
                      )}
                    </div>
                    <span className="text-base font-medium text-gray-700 min-w-[60px] text-right">₹{product.price?.effective?.min || 'N/A'}</span>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 font-medium">No products found matching your criteria.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Done ({selectedProducts?.length} selected)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;