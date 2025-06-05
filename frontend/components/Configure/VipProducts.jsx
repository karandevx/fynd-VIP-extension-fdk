import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedProducts,
  addSelectedProduct,
  fetchVipProducts,
  saveVipProducts,
} from '../../src/features/vipProducts/vipProductsSlice';

const VipProducts = ({
  initialProducts = [],
  setActiveTab,
  disabled,
  config,
}) => {
  const { company_id } = useParams();
  const dispatch = useDispatch();
  const {
    productList,
    selectedProducts,
    loading,
    saving,
    error,
    lastFetched,
  } = useSelector((state) => state.vipProducts);

  const isConfigured = disabled;
  const enabledPlans = config?.benefits?.filter((plan) => plan.isEnabled);

  // Get all selected product UIDs across all plans
  const getAllSelectedProductUids = () => {
    return selectedProducts.reduce((acc, product) => {
      const planTitle = Object.keys(product)[0];
      const productData = product[planTitle];
      if (productData?.uid) {
        acc.push(productData.uid);
      }
      return acc;
    }, []);
  };

  // Fetch products only once when component mounts or company_id changes
  useEffect(() => {
    const shouldFetch = !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000; // 5 minutes cache
    if (shouldFetch) {
      dispatch(fetchVipProducts(company_id));
    }
  }, [company_id]);

  // Set initial products only when they change and we don't have selected products
  useEffect(() => {
    if (initialProducts?.length > 0 && selectedProducts.length === 0) {
      dispatch(setSelectedProducts(initialProducts));
    }
  }, [initialProducts]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRefresh = () => {
    dispatch(fetchVipProducts(company_id));
  };

  const getSelectedForPlan = (planTitle) => {
    return selectedProducts?.find((item) => item[planTitle])?.[planTitle];
  };

  const isProductSelectedInAnyPlan = (productUid) => {
    return getAllSelectedProductUids().includes(productUid);
  };

  const handleProductSelect = (planTitle, productUid, itemCode) => {
    if (isConfigured) return;
    
    if (isProductSelectedInAnyPlan(productUid)) {
      toast.warning("This product is already selected in another plan");
      return;
    }

    dispatch(addSelectedProduct({
      planTitle,
      product: { uid: productUid, item_code: itemCode }
    }));
  };

  const handleSave = async () => {
    if (selectedProducts.length === 0) {
      toast.warning("Please select one product for at least one plan");
      return;
    }

    const resultAction = await dispatch(saveVipProducts({
      selectedProducts,
      companyId: company_id
    }));

    if (saveVipProducts.fulfilled.match(resultAction)) {
      toast.success("VIP products saved successfully");
      setActiveTab("benefits");
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-lg bg-white shadow-sm flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-white shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900">
            VIP Plans & Products
          </h2>
          {isConfigured && (
            <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
              Configured
            </span>
          )}
          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
            {selectedProducts.length} Selected
          </span>
          {lastFetched && (
            <span className="text-sm text-gray-500">
              Last updated: {new Date(lastFetched).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Refresh products"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
          {!isConfigured && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md transition-colors ${
                saving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving..." : "Save Selection"}
            </button>
          )}
        </div>
      </div>

      {enabledPlans?.length === 0 ? (
        <p className="text-gray-500 text-center">No enabled plans available.</p>
      ) : (
        enabledPlans?.map((plan) => {
          const selected = getSelectedForPlan(plan.title);

          return (
            <div key={plan.title} className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={plan.img}
                  alt={plan.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <h3 className="text-md font-semibold text-gray-800">
                    {plan.title.replace(/_/g, " ")}
                  </h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
              </div>

              {productList?.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No products available.
                </p>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {productList?.map((product) => {
                    const isSelected = selected?.uid === product.uid;
                    const isDisabled = isConfigured || (isProductSelectedInAnyPlan(product.uid) && !isSelected);
                    
                    return (
                      <label
                        key={product.uid}
                        className={`border p-4 rounded-lg cursor-pointer transition-colors flex items-start space-x-4 ${
                          isSelected
                            ? "bg-blue-50 border-blue-400"
                            : isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50 border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`radio-${plan.title}`}
                          checked={isSelected}
                          onChange={() =>
                            handleProductSelect(
                              plan.title,
                              product.uid,
                              product.item_code
                            )
                          }
                          disabled={isDisabled}
                          className="mt-1 h-4 w-4 text-blue-600"
                        />
                        <div className="flex-1 flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">
                                No Image
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {product.item_code}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              ₹{product.price?.effective?.min}
                              <span className="line-through text-xs text-gray-400 ml-2">
                                ₹{product.price?.marked?.min}
                              </span>
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default VipProducts;
