import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import VipProducts from "./VipProducts";
import Benefits from "./Benefits";
import { fetchConfig } from "../../src/features/config/configSlice";

const Configure = () => {
  const { company_id } = useParams();
  const dispatch = useDispatch();
  const { data: config, loading, error, lastFetched } = useSelector((state) => state.config);

  // Active Tab State
  const [activeTab, setActiveTab] = useState("plans");

  useEffect(() => {
    // Only fetch if we don't have data or if it's stale (older than 5 minutes)
    const shouldFetch = !config || !lastFetched || (Date.now() - new Date(lastFetched).getTime() > 5 * 60 * 1000);
    if (shouldFetch) {
      dispatch(fetchConfig(company_id));
    }
  }, [company_id, dispatch, config, lastFetched]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-8 px-2">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full text-center md:text-left">
            <h1 className="!text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Configure VIP Extension</h1>
            <p className="text-gray-500 !text-base">Manage your access configuration, VIP products, and Plans</p>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white/90 rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-100 bg-white/80 px-6 pt-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('plans')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base transition-all duration-200 ${
                  activeTab === 'plans'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                Plans
              </button>
              <button
                onClick={() => setActiveTab('vip')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base transition-all duration-200 ${
                  activeTab === 'vip'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                VIP Products
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6 px-6 pb-8">
            {activeTab === 'plans' && (
              <Benefits
                initialPlans={config?.benefits || []}
                applicationIds={config?.applicationIds || []}
              />
            )}
            {activeTab === 'vip' && (
              <VipProducts
                initialProducts={config?.vipProducts || []}
                setActiveTab={setActiveTab}
                disabled={config?.vipProducts?.length > 0}
                config={config}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configure;
