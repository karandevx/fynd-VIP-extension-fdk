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
import { fetchConfig } from "../../src/features/config/configSlice";

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
    dispatch(fetchConfig(company_id));
    dispatch(fetchVipProducts(company_id));
  };

  const getSelectedForPlan = (planTitle) => {
    return selectedProducts?.find((item) => item[planTitle])?.[planTitle];
  };

  const isProductSelectedInAnyPlan = (productUid) => {
    return getAllSelectedProductUids().includes(productUid);
  };

  const isPlanConfigured = (planTitle) => {
    // Check if plan already has a product selected from initial data
    return initialProducts.some(product => product[planTitle]);
  };

  const handleProductSelect = (planTitle, productUid, itemCode) => {
    if (isConfigured || isPlanConfigured(planTitle)) return;
    
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
      handleRefresh();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-gradient-to-br from-blue-50 via-indigo-50 to-white rounded-2xl shadow-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-2xl bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <h2 className="!text-2xl font-extrabold text-gray-900">VIP Plans & Products</h2>
          {isConfigured && (
            <span className="px-3 py-1 !text-sm font-medium text-green-800 bg-green-100 rounded-full border border-green-200">Configured</span>
          )}
          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">{selectedProducts.length} Selected</span>
          {lastFetched && (
            <span className="!text-sm text-gray-500">Last updated: {new Date(lastFetched).toLocaleTimeString()}</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-blue-600 transition-all duration-200 bg-white rounded-lg border border-gray-200 shadow-sm"
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
              className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md transition-all duration-200 ${saving ? "opacity-50 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-700"}`}
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
          const isPlanAlreadyConfigured = isPlanConfigured(plan.title);

          return (
            <div key={plan.title} className="space-y-4 mb-8">
              <div className="flex items-center space-x-4">
                <img
                  src={plan.img}
                  alt={plan.title}
                  className="w-14 h-14 object-cover rounded-xl border border-gray-200 shadow-sm"
                />
                <div>
                  <h3 className="!text-lg font-semibold text-gray-800">{plan.title.replace(/_/g, " ")}</h3>
                  <p className="!text-sm text-gray-600 !m-0">{plan.description}</p>
                  {isPlanAlreadyConfigured && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full border border-green-200">
                      Product Already Selected
                    </span>
                  )}
                </div>
              </div>

              {productList?.length === 0 ? (
                <p className="!text-sm text-gray-400">No products available.</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {productList?.map((product) => {
                    const isSelected = selected?.uid === product.uid;
                    const isDisabled = isConfigured || 
                      isPlanAlreadyConfigured || 
                      (isProductSelectedInAnyPlan(product.uid) && !isSelected);

                    return (
                      <label
                        key={product.uid}
                        className={`border p-5 rounded-2xl cursor-pointer transition-all flex items-start space-x-4 shadow-sm ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
                            : isDisabled
                            ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                            : "hover:bg-gray-50 border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`radio-${plan.title}`}
                          checked={isSelected}
                          onChange={() => handleProductSelect(plan.title, product.uid, product.slug)}
                          disabled={isDisabled}
                          className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-full transition-all duration-200"
                        />
                        <div className="flex-1 flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 shadow-sm">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 !text-xs">No Image</span>
                            )}
                          </div>
                          <div>
                            <h4 className="!text-base font-semibold text-gray-900">{product.name}</h4>
                            <p className="!text-xs text-gray-500">{product.item_code}</p>
                            <p className="!text-sm text-gray-700 mt-1">
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
