import React, { useState } from "react";
import { FormProvider } from "react-hook-form";
import CampaignStepper from "./CampaignStepper";
import EmailTemplateForm from "./EmailTemplateForm";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import SalesChannelSelectionModal from "./SalesChannelSelectionModal";
import urlJoin from "url-join";
import { useSelector } from "react-redux";

const CampaignCreatePage = ({
  currentStep,
  setCurrentStep,
  setShowCreateCampaign,
  setShowProductModal,
  // setShowCustomerModal, // Remove or comment out the old prop if it's no longer used
  selectedProducts,
  selectedCustomers, // This prop is likely no longer needed if state is internal
  methods,
  onSubmit: handleFormSubmit,
  errors,
  watch,
  register,
  handleIndividualProductSelect,
  handleIndividualCustomerSelect, // This handler is used for channel selection
  handleSelectAllCustomers, // This handler is used for select all channels
}) => {
  const { handleSubmit, getValues } = methods;
  const { company_id } = useParams();
  const EXAMPLE_MAIN_URL = window.location.origin;

  const [showSaleschannelModal, setShowSaleschannelModal] = useState(false);

  // Rename the state variable selectedCustomers to selectedSaleschannels
  const [selectedSaleschannels, setSelectedSaleschannels] = useState([]);

  const { plans } = useSelector((state) => state.benefits);

  // State for custom validation errors
  const [dateError, setDateError] = useState("");
  const [productError, setProductError] = useState("");
  const [customerError, setCustomerError] = useState(""); // Keep name for error message consistency
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaignId, setCampaignId] = useState(null);

  // Add campaign type state
  const [campaignType, setCampaignType] = useState("");

  // Update handlers to use selectedSaleschannels
  const handleIndividualSalesChannelSelect = (channelId) => {
    setSelectedSaleschannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleSelectAllSalesChannels = (channelIdsToToggle) => {
    setSelectedSaleschannels((prev) => {
      // If channelIdsToToggle is empty, there's nothing to select or deselect
      if (channelIdsToToggle.length === 0) {
        return prev; // Return current state
      }

      // Check if all channels in the current toggled list are already selected
      const allAreCurrentlySelected = channelIdsToToggle.every((id) =>
        prev.includes(id)
      );

      if (allAreCurrentlySelected) {
        // If all are selected, deselect all channels in the toggled list
        return prev.filter((id) => !channelIdsToToggle.includes(id));
      } else {
        // If not all are selected, select all channels in the toggled list
        const newSelected = new Set(prev);
        channelIdsToToggle.forEach((id) => newSelected.add(id));
        return Array.from(newSelected);
      }
    });
  };

  const onSubmit = async (data) => {
    // Clear previous errors
    setDateError("");
    setProductError("");
    setCustomerError("");

    const {
      name,
      description,
      startDate,
      endDate,
      offerText,
      offerLabel,
      discount,
    } = data;

    // Date validation
    if (new Date(startDate) > new Date(endDate)) {
      setDateError("Start date must be before or the same as the end date.");
      return;
    }

    // Product validation
    if (selectedProducts.length === 0) {
      setProductError("Please select at least one product.");
      return;
    }

    // Sales Channel validation
    if (selectedSaleschannels.length === 0) {
      // Use selectedSaleschannels
      setCustomerError("Please select at least one sales channel.");
      return;
    }

    // If all validations pass
    if (currentStep === 1) {
      const payload = {
        type: campaignType,
        name: name,
        description: description || "", // Ensure description is included
        offerText: offerText || "",
        offerLabel: offerLabel || "",
        companyId: company_id, // Use company_id from useParams
        applicationIds: selectedSaleschannels, // Use selectedSaleschannels for applicationIds
        products: selectedProducts, // Use selectedProducts for products
        discount: {
          // Use discount object
          type: discount?.type || "",
          value: discount?.value || "",
        },
        startDate: new Date(startDate).toISOString(), // Format date to ISO string
        endDate: new Date(endDate).toISOString(), // Format date to ISO string
      };

      console.log("Campaign Details Step Payload:", payload);

      setIsSubmitting(true); // Set loading state

      try {
        const response = await axios.post(
          urlJoin(EXAMPLE_MAIN_URL, "/api/promotion/create-campaign"),
          {
            payload: payload,
          },
          {
            headers: {
              "x-company-id": company_id,
            },
          }
        );

        console.log("Campaign creation response:", response);
        if (response.data) {
          setCampaignId(response.data.campaignId);
          toast.success("Campaign details saved successfully!");
          setCurrentStep(2);
        } else {
          throw new Error(data.message || "Failed to save campaign details");
        }
      } catch (error) {
        console.error("Error saving campaign details:", error);
        toast.error(`Error saving campaign details: ${error.message}`); // Update toast message
      } finally {
        setIsSubmitting(false); // Unset loading state
      }
    } else {
      // This is the final submission step (Step 2) - Remove API call here
      // Handle final submission (email template only now)
      console.log("Campaign Creation Complete (Email Template Step):", {
        // Update log message
        // The campaign is already created in Step 1, just log the email template data if needed
        emailTemplateData: data.emailTemplate, // Assuming email template data is nested
        timestamp: new Date().toISOString(),
      });

      // No API call needed here anymore for creating the main campaign
      toast.success("Email template saved!"); // Add a success toast for email template saving
      setShowCreateCampaign(false); // Close the modal after completing the email template step
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-3xl bg-white/90 rounded-3xl shadow-2xl border border-gray-100 p-8">
        {/* Header */}
        <div className="mb-8 border-b pb-6 flex justify-between items-center">
          <div>
            <h1 className="!text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Create Campaign</h1>
            <p className="mt-1 !text-base text-gray-500">Set up your new marketing campaign</p>
          </div>
          <button
            onClick={() => setShowCreateCampaign(false)}
            className="text-gray-400 hover:text-gray-700 text-3xl leading-none font-light transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <CampaignStepper currentStep={currentStep} />
        </div>

        {/* Form Content */}
        <div className="space-y-8">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {currentStep === 1 ? (
                <div className="space-y-8">
                  {/* Campaign Name */}
                  <div>
                    <label htmlFor="campaignName" className="block text-sm font-semibold text-gray-700 mb-1">Campaign Name</label>
                    <input
                      type="text"
                      id="campaignName"
                      {...register("name", { required: "Campaign name is required" })}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
                    />
                    {errors.name && <p className="mt-2 !text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      id="description"
                      {...register("description", { required: "Description is required" })}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
                      rows="3"
                    />
                    {errors.description && <p className="mt-2 !text-sm text-red-600">{errors.description.message}</p>}
                  </div>

                  {/* Campaign Type */}
                  <div>
                    <label htmlFor="campaignType" className="block text-sm font-semibold text-gray-700 mb-1">Campaign Type</label>
                    <select
                      id="campaignType"
                      value={campaignType}
                      onChange={(e) => setCampaignType(e.target.value)}
                      className={`block w-full rounded-lg border ${errors.campaignType ? 'border-red-500' : 'border-gray-300'} px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm`}
                      {...register("campaignType", {
                        required: "Campaign type is required",
                        onChange: (e) => setCampaignType(e.target.value)
                      })}
                    >
                      <option value="">Select Campaign Type</option>
                      {plans.filter((plan) => plan.isEnabled).map((plan) => (
                        <option key={plan.id} className="capitalize" value={plan.title}>
                          {plan.title.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                    {errors.campaignType && <p className="mt-2 !text-sm text-red-600">{errors.campaignType.message}</p>}
                  </div>

                  {/* Offer/Discount Section */}
                  {(campaignType === "CUSTOM_PROMOTIONS" || campaignType === "PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS") && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="offerText" className="block text-sm font-semibold text-gray-700 mb-1">Offer Text</label>
                          <input
                            type="text"
                            id="offerText"
                            {...register("offerText", { required: campaignType === "CUSTOM_PROMOTIONS" || campaignType === "PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS" ? "Offer text is required" : false })}
                            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
                            placeholder="e.g., 20% off"
                          />
                          {errors.offerText && <p className="mt-2 !text-sm text-red-600">{errors.offerText.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="offerLabel" className="block text-sm font-semibold text-gray-700 mb-1">Offer Label</label>
                          <input
                            type="text"
                            id="offerLabel"
                            {...register("offerLabel", { required: campaignType === "CUSTOM_PROMOTIONS" || campaignType === "PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS" ? "Offer label is required" : false })}
                            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
                            placeholder="e.g., Limited Time"
                          />
                          {errors.offerLabel && <p className="mt-2 !text-sm text-red-600">{errors.offerLabel.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="discountType" className="block text-sm font-semibold text-gray-700 mb-1">Discount Type</label>
                          <select
                            id="discountType"
                            {...register("discount.type", { required: campaignType === "CUSTOM_PROMOTIONS" || campaignType === "PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS" ? "Discount type is required" : false })}
                            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
                          >
                            <option value="">Select Discount Type</option>
                            <option value="amount">Amount</option>
                            <option value="percentage">Percentage</option>
                          </select>
                          {errors.discount?.type && <p className="mt-2 !text-sm text-red-600">{errors.discount.type.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="discountValue" className="block text-sm font-semibold text-gray-700 mb-1">Discount Value</label>
                          <input
                            type="number"
                            id="discountValue"
                            {...register("discount.value", {
                              required: campaignType === "CUSTOM_PROMOTIONS" || campaignType === "PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS" ? "Discount value is required" : false,
                              min: { value: 0, message: "Discount value must be positive" },
                              validate: (value) => {
                                const type = watch("discount.type");
                                if (type === "percentage" && (value < 0 || value > 100)) {
                                  return "Percentage discount must be between 0 and 100";
                                }
                                return true;
                              },
                            })}
                            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
                            step="any"
                          />
                          {errors.discount?.value && <p className="mt-2 !text-sm text-red-600">{errors.discount.value.message}</p>}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Date Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-1">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        id="startDate"
                        min={new Date().toISOString().slice(0, 16)}
                        {...register("startDate", {
                          required: "Start date is required",
                          validate: (value) => {
                            const today = new Date();
                            const selected = new Date(value);
                            return (
                              selected >= today ||
                              "Start date cannot be in the past"
                            );
                          },
                        })}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
                      />
                      {errors.startDate && <p className="mt-2 !text-sm text-red-600">{errors.startDate.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-1">End Date & Time</label>
                      <input
                        type="datetime-local"
                        id="endDate"
                        min={watch("startDate") || new Date().toISOString().slice(0, 16)}
                        {...register("endDate", {
                          required: "End date is required",
                          validate: (value) => {
                            const startDate = watch("startDate");
                            if (startDate && new Date(value) <= new Date(startDate)) {
                              return "End date must be after start date";
                            }
                            return true;
                          },
                        })}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
                      />
                      {errors.endDate && <p className="mt-2 !text-sm text-red-600">{errors.endDate.message}</p>}
                    </div>
                    {dateError && <p className="mt-2 !text-sm text-red-600 col-span-full">{dateError}</p>}
                  </div>

                  {/* Products Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Products</label>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(true)}
                      className="flex justify-between items-center w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm transition duration-150 ease-in-out"
                    >
                      <span>{selectedProducts.length} products selected</span>
                      <span className="ml-2 text-gray-400">→</span>
                    </button>
                    {productError && <p className="mt-2 !text-sm text-red-600">{productError}</p>}
                  </div>

                  {/* Sales Channels Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sales Channels</label>
                    <button
                      type="button"
                      onClick={() => setShowSaleschannelModal(true)}
                      className="flex justify-between items-center w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm transition duration-150 ease-in-out"
                    >
                      <span>{selectedSaleschannels.length} channels selected</span>
                      <span className="ml-2 text-gray-400">→</span>
                    </button>
                    {customerError && <p className="mt-2 !text-sm text-red-600">{customerError}</p>}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowCreateCampaign(false)}
                      className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150 ease-in-out shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-lg hover:from-blue-700 hover:to-indigo-600 transition duration-150 ease-in-out shadow-lg font-semibold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <EmailTemplateForm
                  setCurrentStep={setCurrentStep}
                  setShowCreateCampaign={setShowCreateCampaign}
                  register={register}
                  errors={errors}
                  watch={watch}
                  campaignId={campaignId}
                  companyId={company_id}
                />
              )}
            </form>
          </FormProvider>
        </div>
      </div>

      <SalesChannelSelectionModal
        showModal={showSaleschannelModal}
        onClose={() => setShowSaleschannelModal(false)}
        selectedChannels={selectedSaleschannels}
        onChannelSelect={handleIndividualSalesChannelSelect}
        onSelectAllChannels={handleSelectAllSalesChannels}
      />
    </div>
  );
};

export default CampaignCreatePage;
