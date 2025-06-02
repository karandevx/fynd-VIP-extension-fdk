import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllVipProducts } from "../../src/features/vipProductsSlice";
import { saveVipProducts } from "../../src/features/configureSlice";
import { toast } from "react-toastify";

const VipProducts = ({ setActiveTab, disabled }) => {
  const { company_id } = useParams();
  const dispatch = useDispatch();
  const { items: allVipProducts, loading } = useSelector((state) => state.vipProducts);
  const { vipProducts: selectedVipProductUids, saving } = useSelector((state) => state.configure);
  const [selectedProducts, setSelectedProducts] = useState(selectedVipProductUids || []);
  const isConfigured = disabled;

  useEffect(() => {
    if (company_id && (!allVipProducts || allVipProducts.length === 0)) {
      dispatch(fetchAllVipProducts(company_id));
    }
    // eslint-disable-next-line
  }, [company_id]);

  useEffect(() => {
    setSelectedProducts(selectedVipProductUids || []);
  }, [selectedVipProductUids]);

  // Sort all products: selected first, then unselected
  const sortedProducts = [...allVipProducts].sort((a, b) => {
    const aSelected = selectedProducts.includes(a.uid);
    const bSelected = selectedProducts.includes(b.uid);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  const handleProductSelect = (productUid) => {
    if (isConfigured) return;
    setSelectedProducts((prev) =>
      prev.includes(productUid)
        ? prev.filter((uid) => uid !== productUid)
        : [...prev, productUid]
    );
  };

  const handleRowClick = (productUid) => {
    if (isConfigured) return;
    handleProductSelect(productUid);
  };

  const handleSelectAll = () => {
    if (isConfigured) return;
    if (selectedProducts?.length === allVipProducts?.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(allVipProducts.map((product) => product.uid));
    }
  };

  const handleSave = async () => {
    if (selectedProducts?.length === 0) {
      toast.warning("Please select at least one product");
      return;
    }
    try {
      await dispatch(saveVipProducts({ company_id, vipProducts: selectedProducts })).unwrap();
      toast.success("VIP products saved successfully");
      if (setActiveTab) setActiveTab("benefits");
    } catch (error) {
      toast.error("Failed to save VIP products");
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
            {selectedProducts?.length} {""}
            {selectedProducts?.length === 1 ? "Product " : "Products "} Selected
          </span>
        </div>
        {!isConfigured && (
          <div className="flex items-center space-x-4 ">
            <button
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedProducts?.length === allVipProducts?.length
                ? "Deselect All"
                : "Select All"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || disabled}
              className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md transition-colors ${
                saving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {saving
                ? "Saving..."
                : `Save Selection (${selectedProducts?.length})`}
            </button>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                {!isConfigured && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Select
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts?.length === 0 ? (
                <tr>
                  <td
                    colSpan={isConfigured ? "4" : "5"}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                sortedProducts
                  ?.map((product) => (
                    <tr
                      key={product.uid}
                      className={`${
                        !isConfigured ? "hover:bg-gray-50 cursor-pointer" : ""
                      } ${
                        selectedProducts?.includes(product.uid)
                          ? "bg-blue-50"
                          : ""
                      }`}
                      onClick={() => handleRowClick(product.uid)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {product.images && product.images?.length > 0 ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">
                                  No img
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {product.name}
                              </span>
                              {selectedProducts.includes(product.uid) && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.item_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₹{product.price?.effective?.min}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ₹{product.price?.marked?.min}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
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
                            checked={selectedProducts?.includes(product.uid)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(product.uid);
                            }}
                            className="cursor-pointer h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
