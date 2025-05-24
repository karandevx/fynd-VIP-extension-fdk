import React from 'react';

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
  setProductSortDirection
}) => {
  if (!showModal) return null;

  const allVisibleSelected = products.length > 0 && products.every(p => selectedProducts.includes(p.uid));

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
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
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
                onChange={() => onSelectAllProducts(products.map(p => p.uid))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">{`Select All (${products.length} visible)`}</span>
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
            ) : products.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {products.map((product) => (
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
                      {product.images && product.images.length > 0 && (
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
              Done ({selectedProducts.length} selected)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;