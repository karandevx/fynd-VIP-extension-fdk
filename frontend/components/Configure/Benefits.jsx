import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import urlJoin from "url-join";
import { useDispatch, useSelector } from 'react-redux';
import {
  setInitialState,
  togglePlan,
  updatePlan,
  toggleChannel,
  toggleAllChannels,
  fetchSalesChannels,
  saveBenefits,
} from '../../src/features/benefits/benefitsSlice';
import { fetchConfig } from "../../src/features/config/configSlice";

const Benefits = ({ initialPlans = [], applicationIds = [] }) => {
  const EXAMPLE_MAIN_URL = window.location.origin;
  const { company_id } = useParams();
  const dispatch = useDispatch();
  const hasFetchedRef = useRef(false);
  const {
    plans,
    salesChannels,
    selectedChannels,
    loading,
    saving,
    error,
    isConfigured,
    hasChanges,
  } = useSelector((state) => state.benefits);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (initialPlans.length > 0 && applicationIds.length > 0) {
      dispatch(setInitialState({ initialPlans, applicationIds }));
    }
  }, [initialPlans, applicationIds]);

  useEffect(() => {
    if (salesChannels.length === 0) {
      dispatch(fetchSalesChannels(company_id));
    }
  }, [company_id, salesChannels.length]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRefresh = () => {
    dispatch(fetchConfig(company_id));
  };

  const handlePlansToggle = (index) => {
    dispatch(togglePlan({ index }));
  };

  const handlePlanChange = (index, field, value) => {
    dispatch(updatePlan({ index, field, value }));
  };

  const handleChannelSelect = (channelId) => {
    dispatch(toggleChannel(channelId));
  };

  const handleSelectAll = () => {
    const allOriginalChannelsSelected = selectedChannels.every(channelId =>
      selectedChannels.includes(channelId)
    );
    
    if (!allOriginalChannelsSelected) {
      return;
    }

    dispatch(toggleAllChannels({
      allSelected: allOriginalChannelsSelected,
      channels: filteredChannels
    }));
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

  const validatePlans = () => {
    const errors = [];
    plans.forEach((plan, index) => {
      if (plan.isEnabled) {
        if (!plan.description?.trim()) {
          errors.push(`Description is required for ${plan.title.replace(/_/g, " ")}`);
        }
        if (!plan.img) {
          errors.push(`Image is required for ${plan.title.replace(/_/g, " ")}`);
        }
      }
    });
    return errors;
  };

  const handleSave = async () => {
    if (selectedChannels.length === 0) {
      toast.warning("Please select at least one sales channel");
      return;
    }

    const validationErrors = validatePlans();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    const configuredPlans = plans?.map((plan) => ({
      title: plan.title,
      isEnabled: plan.isEnabled,
      description: plan.isEnabled ? plan.description : "",
      img: plan.isEnabled ? plan.img : "",
    }));

    const resultAction = await dispatch(saveBenefits({
      salesChannels: selectedChannels,
      configuredPlans,
      companyId: company_id
    }));

    if (saveBenefits.fulfilled.match(resultAction)) {
      toast.success("Plans saved successfully");
      handleRefresh();
    }
  };

  const filteredChannels = salesChannels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.domain.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-2xl font-extrabold text-gray-900">VIP Plans Configuration</h2>
          {isConfigured && (
            <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full border border-green-200">Configured</span>
          )}
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            type="button"
            className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md transition-all duration-200 ${saving ? "opacity-50 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-700"}`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {/* Sales Channels Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Sales Channels</h3>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full px-4 py-2.5 text-left border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                    : `${selectedChannels.length} channel${selectedChannels.length === 1 ? "" : "s"} selected`}
                </span>
              </div>
              <svg
                className={`h-5 w-5 text-gray-400 transform transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
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
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200 shadow-sm"
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

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg">
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-gray-200 bg-gray-50">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedChannels.length === filteredChannels.length}
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
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${selectedChannels.includes(channel.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={selectedChannels.includes(channel.id)}
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
        <h3 className="!text-lg font-semibold text-gray-900 mb-4">Configured Plans</h3>
        <div className="space-y-6">
          {plans?.map((plan, index) => (
            <div
              key={index}
              className={`border p-5 mb-4 rounded-xl shadow-sm bg-gray-50 ${plan.img && plan.description ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900">{plan.title.replace(/_/g, " ")}</h4>
                <input
                  type="checkbox"
                  checked={plan.isEnabled}
                  onChange={() => handlePlansToggle(index)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              {plan?.isEnabled && (
                <div className="space-y-3">
                  <div>
                    <textarea
                      placeholder="Enter description"
                      className={`w-full border p-2 rounded-xl ${!plan.description?.trim() && plan.isEnabled ? 'border-red-500' : ''} ${plan.img && plan.description ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={plan.description}
                      onChange={(e) => handlePlanChange(index, "description", e.target.value)}
                      disabled={plan.img && plan.description}
                    />
                    {!plan.description?.trim() && plan.isEnabled && (
                      <p className="text-red-500 !text-sm mt-1">Description is required</p>
                    )}
                  </div>
                  <div className="flex flex-col items-start space-y-2 w-full">
                    {plan?.img?.length ? (
                      <img
                        src={plan.img}
                        alt="Plan Preview"
                        className="h-24 w-auto object-cover rounded-xl shadow"
                      />
                    ) : (
                      <>
                        <label
                          className={`cursor-pointer w-full flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-600 font-medium rounded-xl border border-blue-300 transition-colors duration-200 hover:bg-blue-200 ${!plan.img && plan.isEnabled ? 'border-red-500' : ''}`}
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
                          />
                          📷 Upload Image
                        </label>
                        {!plan.img && plan.isEnabled && (
                          <p className="text-red-500 !text-sm">Image is required</p>
                        )}
                      </>
                    )}
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
