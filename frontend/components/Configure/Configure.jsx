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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="!text-2xl font-bold text-gray-900">
          Configure VIP Extension
        </h1>
        <p className="mt-2 text-gray-600 !text-base">
          Manage your access configuration, VIP products, and Plans
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {" "}
          <button
            onClick={() => setActiveTab("plans")}
            className={`${
              activeTab === "plans"
                ? "border-blue-500 text-blue-600 cursor-pointer"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1  cursor-pointer border-b-2 font-medium text-sm`}
          >
            Plans
          </button>
          <button
            onClick={() => setActiveTab("vip")}
            className={`${
              activeTab === "vip"
                ? "border-blue-500 text-blue-600 cursor-pointer"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap hover:cursor-pointer py-4 px-1 border-b-2 font-medium text-sm`}
          >
            VIP Products
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {" "}
        {activeTab === "plans" && (
          <Benefits
            initialPlans={config?.benefits || []}
            applicationIds={config?.applicationIds || []}
          />
        )}
        {activeTab === "vip" && (
          <VipProducts
            initialProducts={config?.vipProducts || []}
            setActiveTab={setActiveTab}
            disabled={config?.vipProducts?.length > 0}
            config={config}
          />
        )}{" "}
      </div>
    </div>
  );
};

export default Configure;
