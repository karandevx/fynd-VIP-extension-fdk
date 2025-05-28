import React, { useEffect, useState } from 'react';
import axios from 'axios';
import urlJoin from 'url-join';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const VipProducts = ({ initialProducts = [], applicationIds = [], companyId }) => {
  const { company_id } = useParams();
  const [productList, setProductList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const EXAMPLE_MAIN_URL = window.location.origin;
  const isConfigured = initialProducts.length > 0;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, '/api/products/vip-products'), {
        headers: {
          "x-company-id": company_id,
        }
      });
      console.log("Fetched products:", data);
      setProductList(data.items);
    } catch (e) {
      console.error("Error fetching products:", e);
      toast.error('Failed to fetch VIP products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [company_id]);

  const handleProductSelect = (productUid) => {
    if (isConfigured) return;
    setSelectedProducts(prev => {
      if (prev.includes(productUid)) {
        return prev.filter(uid => uid !== productUid);
      } else {
        return [...prev, productUid];
      }
    });
  };

  const handleRowClick = (productUid) => {
    if (isConfigured) return;
    handleProductSelect(productUid);
  };

  const handleSelectAll = () => {
    if (isConfigured) return;
    if (selectedProducts.length === productList.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(productList.map(product => product.uid));
    }
  };

  const handleSave = async () => {
    if (isConfigured) return;
    if (selectedProducts.length === 0) {
      toast.warning('Please select at least one product');
      return;
    }

    setSaving(true);
    console.log({
      type: "product_create",
      companyId: company_id,
      vipProducts: selectedProducts
    });
    try {
      const response = await axios.post(import.meta.env.VITE_BACKEND_URL, {
        type: "product_create",
        companyId: company_id,
        vipProducts: selectedProducts
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        toast.success('VIP products saved successfully');
      } else {
        throw new Error('Failed to save VIP products');
      }
    } catch (error) {
      console.error('Error saving VIP products:', error);
      toast.error('Failed to save VIP products');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-lg bg-white shadow-sm">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900">VIP Products</h2>
          {isConfigured && (
            <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
              Configured
            </span>
          )}
          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
            {selectedProducts.length} {selectedProducts.length === 1 ? 'Product' : 'Products'} Selected
          </span>
        </div>
        {!isConfigured && (
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {selectedProducts.length === productList.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`bg-blue-600 text-white px-4 py-2 rounded-md transition-colors ${
                saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : `Save Selection (${selectedProducts.length})`}
            </button>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                {!isConfigured && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productList.length === 0 ? (
                <tr>
                  <td colSpan={isConfigured ? "4" : "5"} className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                productList
                  .sort((a, b) => {
                    // Sort selected products to the top
                    const aSelected = selectedProducts.includes(a.uid);
                    const bSelected = selectedProducts.includes(b.uid);
                    if (aSelected && !bSelected) return -1;
                    if (!aSelected && bSelected) return 1;
                    return 0;
                  })
                  .map((product) => (
                    <tr 
                      key={product.uid} 
                      className={`${!isConfigured ? 'hover:bg-gray-50 cursor-pointer' : ''} ${
                        selectedProducts.includes(product.uid) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleRowClick(product.uid)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No img</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{product.name}</span>
                              {selectedProducts.includes(product.uid) && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{product.item_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{product.price?.effective?.min}</div>
                        <div className="text-sm text-gray-500 line-through">₹{product.price?.marked?.min}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category_name}
                      </td>
                      {!isConfigured && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <input
                            type="checkbox"
                            id={`product-${product.uid}`}
                            checked={selectedProducts.includes(product.uid)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleProductSelect(product.uid);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                      )}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VipProducts; 