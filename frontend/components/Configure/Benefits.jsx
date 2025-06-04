import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import urlJoin from "url-join";

const Benefits = ({ initialPlans = [], applicationIds = [] }) => {
  const EXAMPLE_MAIN_URL = window.location.origin;
  const { company_id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [salesChannels, setSalesChannels] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState(applicationIds);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [plans, setPlans] = useState(
    initialPlans.length > 0
      ? initialPlans
      : [
          {
            title: "PRODUCT_EXCLUSIVITY",
            isEnabled: false,
            description: "",
            img: "",
          },
          {
            title: "CUSTOM_PROMOTIONS",
            isEnabled: false,
            description: "",
            img: "",
          },
          {
            title: "PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS",
            isEnabled: false,
            description: "",
            img: "",
          },
        ]
  );
  const [isConfigured, setIsConfigured] = useState(
    initialPlans.length > 0 && applicationIds.length > 0 ? true : false
  );

  const fetchSalesChannels = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        urlJoin(EXAMPLE_MAIN_URL, "/api/sales"),
        {
          headers: {
            "x-company-id": company_id,
          },
        }
      );
      console.log("Fetched sales:", data);
      setSalesChannels(data.items || []);
    } catch (e) {
      console.error("Error fetching sales:", e);
      toast.error("Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesChannels();
  }, [company_id]);

  const handlePlansToggle = (index) => {
    if (isConfigured) return;
    setPlans((prev) => {
      const newPlan = [...prev];
      newPlan[index] = {
        ...newPlan[index],
        isEnabled: !newPlan[index].isEnabled,
        description: !newPlan[index].isEnabled
          ? ""
          : newPlan[index].description,
        img: !newPlan[index].isEnabled ? "" : newPlan[index].img,
      };
      return newPlan;
    });
  };

  const handlePlanChange = (index, field, value) => {
    if (isConfigured) return;
    setPlans((prev) => {
      const newPlan = [...prev];
      newPlan[index] = {
        ...newPlan[index],
        [field]: value,
      };
      return newPlan;
    });
  };

  const handleChannelSelect = (channelId) => {
    if (isConfigured) return;
    setSelectedChannels((prev) => {
      if (prev.includes(channelId)) {
        return prev.filter((id) => id !== channelId);
      } else {
        return [...prev, channelId];
      }
    });
  };

  const handleSelectAll = () => {
    if (isConfigured) return;
    if (selectedChannels.length === filteredChannels.length) {
      setSelectedChannels([]);
    } else {
      setSelectedChannels(filteredChannels.map((channel) => channel.id));
    }
  };
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "hacktimus");

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${"dbjnbj1nx"}/image/upload`,
        formData
      );
      return res.data.secure_url;
    } catch (error) {
      toast.error("Image upload failed");
      console.error("Cloudinary upload error:", error);
      return null;
    }
  };

  const handleSave = async () => {
    if (isConfigured) return;
    if (selectedChannels.length === 0) {
      toast.warning("Please select at least one sales channel");
      return;
    }

    //  setSaving(true);
    try {
      const configuredPlans = plans?.map((plan) => ({
        title: plan.title,
        isEnabled: plan.isEnabled,
        description: plan.isEnabled ? plan.description : "",
        img: plan.isEnabled ? plan.img : "",
      }));
      const { data } = await axios.post(
        urlJoin(EXAMPLE_MAIN_URL, "/api/sales/configure-plans"),
        {
          salesChannels: selectedChannels,
          configuredPlans: configuredPlans,
        },
        {
          headers: {
            "x-company-id": company_id,
          },
        }
      );

      if (data.data.success) {
        toast.success("Plans saved successfully");
        setIsConfigured(true);
      } else {
        throw new Error("Failed to save Plans");
      }
    } catch (error) {
      console.error("Error saving plans:", error);
      toast.error("Failed to save plans");
    } finally {
      setSaving(false);
    }
  };

  const filteredChannels = salesChannels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.domain.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-lg font-semibold text-gray-900">
            VIP Plans Configuration
          </h2>
          {isConfigured && (
            <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
              Configured
            </span>
          )}
        </div>
        {!isConfigured && (
          <button
            onClick={handleSave}
            type="button"
            className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md transition-colors ${
              saving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        )}
      </div>

      {/* Sales Channels Section */}
      <div className="mb-8">
        <h3 className="text-md font-medium text-gray-900 mb-4">
          Selected Sales Channels
        </h3>
        <div className="relative">
          <button
            type="button"
            onClick={() => !isConfigured && setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full px-4 py-2.5 text-left border border-gray-300 rounded-md shadow-sm bg-white ${
              isConfigured
                ? "cursor-default"
                : "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            }`}
          >
            <div className="flex justify-between items-center cursor-pointer">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="text-gray-700">
                  {selectedChannels.length === 0
                    ? "Select sales channels"
                    : `${selectedChannels.length} channel${
                        selectedChannels.length === 1 ? "" : "s"
                      } selected`}
                </span>
              </div>
              {!isConfigured && (
                <svg
                  className={`h-5 w-5 text-gray-400 transform transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </div>
          </button>

          {/* Selected Channels Display */}
          {selectedChannels.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {salesChannels
                .filter((channel) => selectedChannels.includes(channel.id))
                .map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white border border-gray-200 overflow-hidden">
                      {channel.logo?.secure_url ? (
                        <img
                          src={channel.logo.secure_url}
                          alt={channel.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100">
                          <span className="text-sm font-medium text-gray-600">
                            {channel.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex gap-2 items-center">
                      <p className="!text-sm font-medium text-gray-900 truncate">
                        {channel.name}
                      </p>
                      <p className="!text-xs text-gray-500 truncate">
                        {channel.domain?.name}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {!isConfigured && isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search channels..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-gray-200 bg-gray-50">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        selectedChannels.length === filteredChannels.length
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All Channels
                    </span>
                  </label>
                </div>
                {filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleChannelSelect(channel.id)}
                  >
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes(channel.id)}
                        onChange={() => handleChannelSelect(channel.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white border border-gray-200 overflow-hidden">
                          {channel.logo?.secure_url ? (
                            <img
                              src={channel.logo.secure_url}
                              alt={channel.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                              <span className="text-sm font-medium text-gray-600">
                                {channel.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="!text-sm font-medium text-gray-900">
                            {channel.name}
                          </span>
                          <p className="!text-xs text-gray-500">
                            {channel.domain?.name}
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
                {filteredChannels.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center bg-gray-50">
                    No channels found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plans Section */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4">
          Configured Plans
        </h3>
        <div className="space-y-6">
          {plans?.map((plan, index) => (
            <div
              key={index}
              className="border p-4 mb-4 rounded-md shadow-sm bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{plan.title.replace(/_/g, " ")}</h4>
                <input
                  type="checkbox"
                  checked={plan.isEnabled}
                  onChange={() => handlePlansToggle(index)}
                  disabled={isConfigured}
                />
              </div>
              {plan?.isEnabled && (
                <div className="space-y-3">
                  <textarea
                    placeholder="Enter description"
                    className="w-full border p-2 rounded-md"
                    value={plan.description}
                    onChange={(e) =>
                      handlePlanChange(index, "description", e.target.value)
                    }
                    disabled={isConfigured}
                  />
                  <div className="flex flex-col items-start space-y-2 w-full">
                    {plan?.img?.length ? (
                      <img
                        src={plan.img}
                        alt="Plan Preview"
                        className="h-24 w-auto object-cover rounded-md shadow"
                      />
                    ) : (
                      <></>
                    )}

                    <label
                      className={`cursor-pointer w-full flex items-center justify-center px-4 py-2 bg-blue-100  text-blue-600 font-medium rounded-lg border border-blue-300 transition-colors duration-200 ${
                        isConfigured
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-blue-200"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const imageUrl = await uploadImageToCloudinary(file);
                          if (imageUrl) {
                            console.log("Image URL:", imageUrl);
                            handlePlanChange(index, "img", imageUrl);
                            toast.success("Image uploaded successfully");
                          }
                        }}
                        disabled={isConfigured}
                      />
                      📷 Upload Image
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Benefits;
