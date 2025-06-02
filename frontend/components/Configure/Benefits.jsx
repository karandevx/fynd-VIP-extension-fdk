import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { saveBenefits, setBenefits } from "../../src/features/configureSlice";
import { toast } from "react-toastify";

const Benefits = ({ initialBenefits = [], applicationIds = [], salesChannels = [] }) => {
  const { company_id } = useParams();
  const dispatch = useDispatch();
  const { benefits, salesChannels: stateSalesChannels, loading, saving } = useSelector((state) => state.configure);
  const [selectedChannels, setSelectedChannels] = useState(applicationIds);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfigured, setIsConfigured] = useState(Array.isArray(benefits) && benefits.length > 0 && Array.isArray(stateSalesChannels) && stateSalesChannels.length > 0);
  const { items: allSalesChannels } = useSelector((state) => state.salesChannels);

  const handleBenefitToggle = (index) => {
    if (isConfigured) return;
    const newBenefits = benefits.map((b, i) =>
      i === index
        ? {
            ...b,
            isEnabled: !b.isEnabled,
            description: !b.isEnabled ? "" : b.description,
            img: !b.isEnabled ? "" : b.img,
          }
        : b
    );
    dispatch(setBenefits(newBenefits));
  };

  const handleBenefitChange = (index, field, value) => {
    if (isConfigured) return;
    const newBenefits = benefits.map((b, i) =>
      i === index ? { ...b, [field]: value } : b
    );
    dispatch(setBenefits(newBenefits));
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
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${"dbjnbj1nx"}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      return data.secure_url;
    } catch (error) {
      toast.error("Image upload failed");
      return null;
    }
  };

  const handleSave = async () => {
    if (isConfigured) return;
    if (selectedChannels.length === 0) {
      toast.warning("Please select at least one sales channel");
      return;
    }
    try {
      const formattedBenefits = benefits.map((benefit) => ({
        title: benefit.title,
        isEnabled: benefit.isEnabled,
        description: benefit.isEnabled ? benefit.description : "",
        img: benefit.isEnabled ? benefit.img : "",
      }));
      await dispatch(
        saveBenefits({ company_id, benefits: formattedBenefits, applicationIds: selectedChannels })
      ).unwrap();
      toast.success("Benefits saved successfully");
      setIsConfigured(true);
    } catch (error) {
      toast.error("Failed to save benefits");
    }
  };

  // Use all sales channels for dropdown
  const dropdownChannels = Array.isArray(allSalesChannels) ? allSalesChannels : [];

  // Filter channels by search term
  const filteredChannels = dropdownChannels.filter(
    (channel) =>
      channel &&
      ((typeof channel.name === 'string' && channel.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (channel.domain && typeof channel.domain.name === 'string' && channel.domain.name.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Select all/deselect all logic for filtered channels
  const allFilteredSelected = filteredChannels.length > 0 && filteredChannels.every((channel) => selectedChannels.includes(channel.id));

  const handleSelectAllFiltered = () => {
    if (isConfigured) return;
    if (allFilteredSelected) {
      // Deselect all filtered
      setSelectedChannels((prev) => prev.filter((id) => !filteredChannels.some((ch) => ch.id === id)));
    } else {
      // Select all filtered
      setSelectedChannels((prev) => {
        const filteredIds = filteredChannels.map((ch) => ch.id);
        return Array.from(new Set([...prev, ...filteredIds]));
      });
    }
  };

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
        <div className="relative">
          <button
            type="button"
            onClick={() => !isConfigured && setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full px-4 py-2.5 text-left border border-gray-300 rounded-md shadow-sm bg-white flex items-center justify-between ${
              isConfigured
                ? "cursor-default"
                : "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            }`}
          >
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
          </button>
          {/* Dropdown UI */}
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
                      checked={allFilteredSelected}
                      onChange={handleSelectAllFiltered}
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
                    className={`px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition`}
                    onClick={() => handleChannelSelect(channel.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(channel.id)}
                      onChange={() => handleChannelSelect(channel.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white border border-gray-200 overflow-hidden">
                      {channel.logo?.secure_url ? (
                        <img src={channel.logo.secure_url} alt={channel.name} className="h-full w-full object-contain" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100">
                          <span className="text-sm font-medium text-gray-600">{channel.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="!text-sm font-medium text-gray-900 truncate">{channel.name}</span>
                      <span className="!text-xs text-gray-500 truncate">{channel.domain?.name}</span>
                    </div>
                    {selectedChannels.includes(channel.id) && (
                      <svg className="h-5 w-5 text-green-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
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
          {/* Configured state: show selected channels as disabled list */}
          {isConfigured && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-3">
                {selectedChannels
                  .map((id) => allSalesChannels?.find((ch) => ch.id === id))
                  .filter(Boolean)
                  .map((channel) => (
                    <div key={channel.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 opacity-60 cursor-not-allowed">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white border border-gray-200 overflow-hidden">
                        {channel.logo?.secure_url ? (
                          <img src={channel.logo.secure_url} alt={channel.name} className="h-full w-full object-contain" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-100">
                            <span className="text-sm font-medium text-gray-600">
                              {typeof channel.name === "string" && channel.name.length > 0 ? channel.name.charAt(0).toUpperCase() : "?"}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{channel.name}</span>
                    </div>
                  ))}
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
              key={index}
              className="border p-4 mb-4 rounded-md shadow-sm bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">
                  {benefit.title.replace(/_/g, " ")}
                </h4>
                <input
                  type="checkbox"
                  checked={benefit.isEnabled}
                  onChange={() => handleBenefitToggle(index)}
                  disabled={isConfigured}
                />
              </div>
              {benefit.isEnabled && (
                <div className="space-y-3">
                  <textarea
                    placeholder="Enter description"
                    className="w-full border p-2 rounded-md"
                    value={benefit.description}
                    onChange={(e) =>
                      handleBenefitChange(index, "description", e.target.value)
                    }
                    disabled={isConfigured}
                  />
                  <div className="flex flex-col items-start space-y-2 w-full">
                    {benefit?.img?.length && (
                      <img
                        src={benefit.img}
                        alt="    Benefit Preview   "
                        className="h-24 w-auto object-cover rounded-md shadow"
                      />
                    )}

                    {!isConfigured && <label
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
                            handleBenefitChange(index, "img", imageUrl);
                            toast.success("Image uploaded successfully");
                          }
                        }}
                        disabled={isConfigured}
                      />
                      📷 Upload Image
                    </label>}
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
