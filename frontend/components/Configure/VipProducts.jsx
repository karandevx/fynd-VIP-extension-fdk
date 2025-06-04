import React, { useEffect, useState } from "react";
import axios from "axios";
import urlJoin from "url-join";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const VipProducts = ({
  initialProducts = [],
  setActiveTab,
  disabled,
  config,
}) => {
  const { company_id } = useParams();
  const [productList, setProductList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(initialProducts); // [{ PLAN_NAME: { uid, item_code } }]
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isConfigured = disabled;
  const EXAMPLE_MAIN_URL = window.location.origin;

  const enabledPlans = config?.benefits?.filter((plan) => plan.isEnabled);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        urlJoin(EXAMPLE_MAIN_URL, "/api/products/vip-products"),
        {
          headers: {
            "x-company-id": company_id,
          },
        }
      );
      setProductList(data.items || []);
    } catch (e) {
      toast.error("Failed to fetch VIP products");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [company_id]);

  const getSelectedForPlan = (planTitle) => {
    return selectedProducts?.find((item) => item[planTitle])?.[planTitle];
  };

  const handleProductSelect = (planTitle, productUid, itemCode) => {
    if (isConfigured) return;
    const updated = selectedProducts.filter((entry) => !entry[planTitle]);
    updated.push({ [planTitle]: { uid: productUid, item_code: itemCode } });
    setSelectedProducts(updated);
  };

  const handleSave = async () => {
    if (selectedProducts.length === 0) {
      toast.warning("Please select one product for at least one plan");
      return;
    }
    console.log("Selected Products:", selectedProducts);

    setSaving(true);

    try {
      const { data } = await axios.post(
        urlJoin(EXAMPLE_MAIN_URL, "/api/products/vip-products"),
        {
          selectedProducts: selectedProducts,
        },
        {
          headers: {
            "x-company-id": company_id,
          },
        }
      );

      if (data) {
        toast.success("VIP products saved successfully");
        setActiveTab("benefits");
      } else {
        throw new Error("Save failed");
      }
    } catch (error) {
      console.error("Error saving VIP products:", error);
      toast.error("Failed to save VIP products");
    } finally {
      setSaving(false);
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
        </div>
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

      {enabledPlans?.length === 0 ? (
        <p className="text-gray-500 text-center">No enabled plans available.</p>
      ) : (
        enabledPlans.map((plan) => {
          const productsForPlan = productList;

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

              {productsForPlan?.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No products for this plan.
                </p>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {productsForPlan.map((product) => {
                    const isSelected = selected?.uid === product.uid;
                    return (
                      <label
                        key={product.uid}
                        className={`border p-4 rounded-lg cursor-pointer transition-colors flex items-start space-x-4 ${
                          isSelected
                            ? "bg-blue-50 border-blue-400"
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
                          disabled={isConfigured}
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
