import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchConfig, setActiveTab, fetchVipProducts } from "../../src/features/configureSlice";
import AccessConfig from "./AccessConfig";
import VipProducts from "./VipProducts";
import Benefits from "./Benefits";
import { fetchSalesChannels } from "../../src/features/salesChannelsSlice";
import { HiOutlineRefresh } from "react-icons/hi";

const Configure = () => {
  const { company_id } = useParams();
  const dispatch = useDispatch();
  const { loading, config, accessConfig, vipProducts, benefits, salesChannels, error, activeTab } = useSelector((state) => state.configure);

  // Only fetch config if not loaded
  const configLoaded = !!config;
  const salesChannelsLoaded = Array.isArray(salesChannels) && salesChannels.length > 0;

  useEffect(() => {
    if (!activeTab) {
      dispatch(setActiveTab("access"));
    }
    if (company_id) {
      if (!configLoaded) dispatch(fetchConfig(company_id));
    }
  }, [company_id, dispatch, activeTab, configLoaded]);

  // Fetch sales channels when switching to benefits tab
  useEffect(() => {
    if (activeTab === "benefits" && company_id) {
      if (!salesChannelsLoaded) dispatch(fetchSalesChannels(company_id));
    }
  }, [activeTab, company_id, dispatch, salesChannelsLoaded]);

  // Refresh handler
  const handleRefresh = () => {
    if (company_id) {
      dispatch(fetchConfig(company_id));
      dispatch(fetchSalesChannels(company_id));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="!text-2xl font-bold text-gray-900">
            Configure VIP Extension
          </h1>
          <p className="mt-2 text-gray-600 !text-base">
            Manage your access configuration, VIP products, and benefits
          </p>
        </div>
        <button
          onClick={handleRefresh}
          title="Refresh Data"
          className="ml-4 p-2 rounded-full bg-gray-100 hover:bg-indigo-200 transition-colors border border-gray-200 shadow-sm flex items-center justify-center"
          aria-label="Refresh Data"
          disabled={loading}
        >
          <HiOutlineRefresh className={`text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => dispatch(setActiveTab("access"))}
            className={`${
              activeTab === "access"
                ? "border-blue-500 text-blue-600 cursor-pointer"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 cursor-pointer border-b-2 font-medium text-sm`}
          >
            Access Config
          </button>
          <button
            onClick={() => config?.clientId && config?.clientSecret && dispatch(setActiveTab("vip"))}
            className={`${
              activeTab === "vip"
                ? "border-blue-500 text-blue-600 cursor-pointer"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap hover:cursor-pointer py-4 px-1 border-b-2 font-medium text-sm`}
          >
            VIP Products
          </button>
          <button
            onClick={() => config?.clientId && config?.clientSecret && config?.vipProducts?.length > 0 && dispatch(setActiveTab("benefits"))}
            className={`${
              activeTab === "benefits"
                ? "border-blue-500 text-blue-600 cursor-pointer"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1  cursor-pointer border-b-2 font-medium text-sm`}
          >
            Benefits
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "access" && (
          <AccessConfig
            accessConfig={accessConfig}
            disabled={!config?.clientId && !config?.clientSecret ? true : false}
            onRefresh={handleRefresh}
            company_id={company_id}
          />
        )}
        {activeTab === "vip" && (
          <VipProducts
            initialProducts={vipProducts || []}
            disabled={vipProducts?.length > 0}
            onRefresh={handleRefresh}
          />
        )}
        {activeTab === "benefits" && (
          <Benefits
            initialBenefits={benefits || []}
            applicationIds={salesChannels || []}
            salesChannels={salesChannels}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </div>
  );
};

export default Configure;
