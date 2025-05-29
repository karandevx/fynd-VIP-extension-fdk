import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AccessConfig from "./AccessConfig";
import VipProducts from "./VipProducts";
import Benefits from "./Benefits";

const Configure = () => {
  const { company_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);

  // Access Config State
  const [accessConfig, setAccessConfig] = useState({
    clientId: "",
    clientSecret: "",
    enabled: true,
  });

  // Active Tab State
  const [activeTab, setActiveTab] = useState("access");

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_FETCH_BACKEND_URL
        }?module=configs&companyId=${company_id}&queryType=scan`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success && response.data.data.length > 0) {
        const configData = response.data.data[0];
        setConfig(configData);

        // Set access config
        setAccessConfig({
          clientId: configData.clientId || "",
          clientSecret: configData.clientSecret || "",
          enabled:
            configData.clientId && configData.clientSecret ? false : true,
        });
      }
    } catch (error) {
      console.error("Error fetching configuration:", error);
      toast.error("Failed to fetch configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [company_id, activeTab]);

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
          Manage your access configuration, VIP products, and benefits
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("access")}
            className={`${
              activeTab === "access"
                ? "border-blue-500 text-blue-600 cursor-pointer"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 cursor-pointer border-b-2 font-medium text-sm`}
          >
            Access Config
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
          <button
            onClick={() => setActiveTab("benefits")}
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
            setAccessConfig={setAccessConfig}
            disabled={!config?.clientId && !config?.clientSecret ? true : false}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "vip" && (
          <VipProducts
            initialProducts={config?.vipProducts || []}
            setActiveTab={setActiveTab}
            disabled={config?.vipProducts?.length > 0}
          />
        )}{" "}
        {activeTab === "benefits" && (
          <Benefits
            initialBenefits={config?.benefits || []}
            applicationIds={config?.applicationIds || []}
          />
        )}
      </div>
    </div>
  );
};

export default Configure;
