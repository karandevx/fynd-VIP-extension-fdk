import React from 'react';
import { HiOutlineRefresh } from 'react-icons/hi';

const ProductSelectionModal = ({
  showModal,
  onClose,
  selectedProducts,
  onProductSelect,
  onSelectAllProducts,
  products,
  isLoading,
  productSearchTerm,
  setProductSearchTerm,
  productSortField,
  setProductSortField,
  productSortDirection,
  setProductSortDirection,
  onRefresh
}) => {
  if (!showModal) return null;

  // Filter products by search term
  let filteredProducts = products.filter(product => {
    const searchTermLower = productSearchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchTermLower) ||
      product.slug?.toLowerCase().includes(searchTermLower) ||
      product.item_code?.toLowerCase().includes(searchTermLower) ||
      (product.brand && product.brand.name.toLowerCase().includes(searchTermLower))
    );
  });

  // Sort products
  filteredProducts = filteredProducts.sort((a, b) => {
    let aValue, bValue;
    if (productSortField === 'effective_price') {
      aValue = a.price?.effective?.min || 0;
      bValue = b.price?.effective?.min || 0;
    } else if (productSortField === 'brand_name') {
      aValue = a.brand?.name || '';
      bValue = b.brand?.name || '';
    } else {
      aValue = a[productSortField] || '';
      bValue = b[productSortField] || '';
    }
    if (aValue < bValue) return productSortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return productSortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const allVisibleSelected = filteredProducts?.length > 0 && filteredProducts.every(p => selectedProducts?.includes(p?.uid));

  const handleProductSort = (field) => {
    if (productSortField === field) {
      setProductSortDirection(productSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setProductSortField(field);
      setProductSortDirection('asc');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#cbdaf561] bg-opacity-25 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl h-[90%] overflow-y-auto w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Select Products</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                title="Refresh Products"
                className="p-2 rounded-full bg-gray-100 hover:bg-indigo-200 transition-colors border border-gray-200 shadow-sm flex items-center justify-center"
                aria-label="Refresh Products"
                disabled={isLoading}
              >
                <HiOutlineRefresh className={`text-indigo-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="mb-4 space-y-4">
            <input
              type="text"
              placeholder="Search products..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500">
              <span>Sort by:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleProductSort('name')}
                  className={`hover:text-blue-600 ${productSortField === 'name' ? 'text-blue-600' : ''}`}
                >
                  Name {productSortField === 'name' && (productSortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  type="button"
                  onClick={() => handleProductSort('effective_price')}
                  className={`hover:text-blue-600 ${productSortField === 'effective_price' ? 'text-blue-600' : ''}`}
                >
                  Price {productSortField === 'effective_price' && (productSortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  type="button"
                  onClick={() => handleProductSort('brand_name')}
                  className={`hover:text-blue-600 ${productSortField === 'brand_name' ? 'text-blue-600' : ''}`}
                >
                  Brand {productSortField === 'brand_name' && (productSortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={() => onSelectAllProducts(filteredProducts.map(p => p.uid))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">{`Select All (${filteredProducts?.length} visible)`}</span>
            </label>
          </div>

          <div className="max-h-96 overflow-y-auto border rounded-md">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : products?.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <label
                    key={product.uid}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.uid)}
                      onChange={() => onProductSelect(product.uid)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3 text-sm text-gray-900 flex-1 flex items-center">
                      {product.images && product.images?.length > 0 && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded mr-3"
                        />
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.brand && (
                          <div className="text-xs text-gray-500">{product.brand.name}</div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{`₹${product.price?.effective?.min || 'N/A'}`}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No products found matching your criteria.
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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