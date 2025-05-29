import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Benefits = ({ initialBenefits = [], applicationIds = [] }) => {
  const { company_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [salesChannels, setSalesChannels] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState(applicationIds);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [benefits, setBenefits] = useState(
    initialBenefits.length > 0
      ? initialBenefits
      : [
          {
            title: "FLASH_SALE",
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
            title: "ASK_FOR_INVENTORY",
            isEnabled: false,
            description: "",
            img: "",
          },
        ]
  );
  const [isConfigured, setIsConfigured] = useState(
    initialBenefits.length > 0 && applicationIds.length > 0 ? true : false
  );

  const fetchSalesChannels = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_FETCH_BACKEND_URL
        }?module=salesChannels&companyId=${company_id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setSalesChannels(response.data.data);
      } else {
        throw new Error("Failed to fetch sales channels");
      }
    } catch (error) {
      console.error("Error fetching sales channels:", error);
      toast.error("Failed to fetch sales channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesChannels();
  }, [company_id]);

  const handleBenefitToggle = (index) => {
    if (isConfigured) return;
    setBenefits((prev) => {
      const newBenefits = [...prev];
      newBenefits[index] = {
        ...newBenefits[index],
        isEnabled: !newBenefits[index].isEnabled,
        description: !newBenefits[index].isEnabled
          ? ""
          : newBenefits[index].description,
        img: !newBenefits[index].isEnabled ? "" : newBenefits[index].img,
      };
      return newBenefits;
    });
  };

  const handleBenefitChange = (index, field, value) => {
    if (isConfigured) return;
    setBenefits((prev) => {
      const newBenefits = [...prev];
      newBenefits[index] = {
        ...newBenefits[index],
        [field]: value,
      };
      return newBenefits;
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

  const handleSave = async () => {
    if (isConfigured) return;
    if (selectedChannels.length === 0) {
      toast.warning("Please select at least one sales channel");
      return;
    }

    setSaving(true);
    try {
      const formattedBenefits = benefits.map((benefit) => ({
        title: benefit.title,
        isEnabled: benefit.isEnabled,
        description: benefit.isEnabled ? benefit.description : "",
        img: benefit.isEnabled ? benefit.img : "",
      }));

      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        {
          type: "feature_benefits",
          companyId: company_id,
          benefits: formattedBenefits,
          applicationIds: selectedChannels,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Benefits saved successfully");
        setIsConfigured(true);
      } else {
        throw new Error("Failed to save benefits");
      }
    } catch (error) {
      console.error("Error saving benefits:", error);
      toast.error("Failed to save benefits");
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
            VIP Benefits Configuration
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

      {/* Benefits Section */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4">
          Configured Benefits
        </h3>
        <div className="space-y-6">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`p-4 border border-gray-200 rounded-lg cursor-pointer  ${
                benefit.isEnabled ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={benefit.isEnabled}
                  onChange={() => handleBenefitToggle(index)}
                  disabled={isConfigured}
                  className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{benefit.title}</h4>

                  {benefit.isEnabled && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        {isConfigured ? (
                          <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                            {benefit.description || "No description provided"}
                          </div>
                        ) : (
                          <textarea
                            value={benefit.description}
                            onChange={(e) =>
                              handleBenefitChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter description"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Image URL
                        </label>
                        {isConfigured ? (
                          <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                            {benefit.img || "No image URL provided"}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={benefit.img}
                            onChange={(e) =>
                              handleBenefitChange(index, "img", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter image URL"
                          />
                        )}
                      </div>

                      {benefit.img && (
                        <div className="mt-2">
                          <img
                            src={benefit.img}
                            alt={benefit.title}
                            className="h-12 w-12 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/48?text=No+Image";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Benefits;
