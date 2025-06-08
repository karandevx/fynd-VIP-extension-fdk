import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fetchCampaigns } from "../../src/features/campaigns/campaignsSlice";
import TopBar from "../TopBar/TopBar";
import { campaigns, campaignStatusColors } from "../../constants/campaigns";
import { customers } from "../../constants/customers";
import axios from "axios";
import urlJoin from "url-join";
import CustomerSelectionModal from "./CustomerSelectionModal";
import ProductSelectionModal from "./ProductSelectionModal";
import CampaignStepper from "./CampaignStepper";
import EmailTemplateForm from "./EmailTemplateForm";
import CampaignCreatePage from "./CampaignCreatePage";
import { toast } from "react-toastify";
import {
  fetchProducts,
  fetchApplicationProducts,
  setSearchTerm as setProductSearchTerm,
  setSortField as setProductSortField,
  setSortDirection as setProductSortDirection,
} from "../../src/features/products/productsSlice";

const SIDEBAR_WIDTH = "16rem";
const EXAMPLE_MAIN_URL = window.location.origin;

const Campaigns = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { company_id } = useParams();
  const {
    campaigns: fetchedCampaigns,
    loading: isCampaignsLoading,
    error,
    lastFetched,
  } = useSelector((state) => state.campaigns);

  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSaleschannelModal, setShowSaleschannelModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedSaleschannels, setSelectedSaleschannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const {
    items: products,
    loading: productsLoading,
    error: productsError,
    filters: {
      searchTerm: productSearchTerm,
      sortField: productSortField,
      sortDirection: productSortDirection,
    },
  } = useSelector((state) => state.products);

  // State for Customer Modal
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerSortField, setCustomerSortField] = useState("firstname");
  const [customerSortDirection, setCustomerSortDirection] = useState("asc");
  const [customerFilterVip, setCustomerFilterVip] = useState("all");
  const { application_id } = useParams();

  const methods = useForm({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "draft",
      discounts: {
        type: "percentage",
        value: "",
        freeDelivery: false,
      },
      emailTemplate: {
        subject: "",
        content: "",
        prompt: "",
      },
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = methods;

  // Add form methods for email template
  const emailTemplateMethods = useForm({
    defaultValues: {
      emailTemplate: {
        subject: "",
        prompt: "",
        content: "",
      },
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    // Only fetch if we don't have data or if it's stale (older than 5 minutes)
    const shouldFetch =
      !fetchedCampaigns ||
      fetchedCampaigns.length === 0 ||
      !lastFetched ||
      Date.now() - new Date(lastFetched).getTime() > 5 * 60 * 1000;
    if (shouldFetch) {
      dispatch(fetchCampaigns(company_id));
    }
  }, [dispatch, company_id, fetchedCampaigns, lastFetched]);

  const handleRefresh = () => {
    dispatch(fetchCampaigns(company_id));
  };

  const isApplicationLaunch = () => !!application_id;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedCampaigns = fetchedCampaigns
    ?.filter((campaign) => {
      const matchesSearch =
        campaign?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign?.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === "all" ? true : campaign?.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;
      return aValue > bValue ? modifier : -modifier;
    });

  const filteredAndSortedCustomers = customers
    ?.filter((customer) => {
      const searchTermLower = customerSearchTerm.toLowerCase();
      const matchesSearch =
        customer.firstname.toLowerCase().includes(searchTermLower) ||
        customer.lastname.toLowerCase().includes(searchTermLower) ||
        customer.email.toLowerCase().includes(searchTermLower) ||
        customer.mobile.includes(customerSearchTerm);

      const matchesFilter =
        customerFilterVip === "all" ||
        (customerFilterVip === "vip" && customer.vipRatio > 75) ||
        (customerFilterVip === "non-vip" && customer.vipRatio <= 75);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[customerSortField];
      const bValue = b[customerSortField];

      if (aValue < bValue) return customerSortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return customerSortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const filteredAndSortedProducts = products
    ?.filter((product) => {
      const searchTermLower = productSearchTerm.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchTermLower) ||
        product.slug.toLowerCase().includes(searchTermLower) ||
        product.item_code.toLowerCase().includes(searchTermLower) ||
        (product.brand &&
          product.brand.name.toLowerCase().includes(searchTermLower));
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      if (productSortField === "effective_price") {
        aValue = a.price?.effective?.min || 0;
        bValue = b.price?.effective?.min || 0;
      } else if (productSortField === "brand_name") {
        aValue = a.brand?.name || "";
        bValue = b.brand?.name || "";
      } else {
        aValue = a[productSortField];
        bValue = b[productSortField];
      }

      if (aValue < bValue) return productSortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return productSortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const handleSelectAllProducts = (productsToToggle) => {
    setSelectedProducts((prev) => {
      const allSelectedInList = productsToToggle.every((product) =>
        prev.some((p) => p.uid === product.uid)
      );
      const newSelected = new Set(prev);

      if (allSelectedInList) {
        // Deselect all in the current list
        return prev.filter(
          (p) => !productsToToggle.some((product) => product.uid === p.uid)
        );
      } else {
        // Select all in the current list
        return [
          ...prev,
          ...productsToToggle.map((product) => ({
            uid: product.uid,
            item_code: product.slug,
          })),
        ];
      }
    });
  };

  const handleSelectAllCustomers = (customerIdsToToggle) => {
    setSelectedCustomers((prev) => {
      const allSelectedInList = customerIdsToToggle.every((id) =>
        prev.includes(id)
      );
      const newSelected = new Set(prev);

      if (allSelectedInList) {
        // Deselect all in the current list
        customerIdsToToggle.forEach((id) => newSelected.delete(id));
      } else {
        // Select all in the current list
        customerIdsToToggle.forEach((id) => newSelected.add(id));
      }

      return Array.from(newSelected);
    });
  };

  const handleIndividualProductSelect = (product) => {
    setSelectedProducts((prev) =>
      prev.some((p) => p.uid === product.uid)
        ? prev.filter((p) => p.uid !== product.uid)
        : [...prev, { uid: product.uid, item_code: product.slug }]
    );
  };

  const handleIndividualCustomerSelect = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev?.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Handlers for Sales Channel Selection
  const handleIndividualSalesChannelSelect = (channelId) => {
    setSelectedSaleschannels((prev) =>
      prev.includes(channelId)
        ? prev?.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleSelectAllSalesChannels = (channelIdsToToggle) => {
    setSelectedSaleschannels((prev) => {
      if (channelIdsToToggle.length === 0) {
        return prev;
      }
      const allAreCurrentlySelected = channelIdsToToggle.every((id) =>
        prev.includes(id)
      );
      if (allAreCurrentlySelected) {
        return prev?.filter((id) => !channelIdsToToggle.includes(id));
      } else {
        const newSelected = new Set(prev);
        channelIdsToToggle.forEach((id) => newSelected.add(id));
        return Array.from(newSelected);
      }
    });
  };

  const onSubmit = (data) => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      // Handle final submission
      console.log("Campaign Creation Complete:", {
        campaignData: data,
        selectedProducts,
        selectedCustomers,
        selectedSaleschannels,
        timestamp: new Date().toISOString(),
      });
      setShowCreateCampaign(false);
    }
  };

  // Add new function to handle modal open
  const handleProductModalOpen = () => {
    setShowProductModal(true);
    // Only fetch if we don't have data or if it's stale (older than 5 minutes)
    const shouldFetch =
      !products?.length ||
      !lastFetched ||
      Date.now() - lastFetched > 5 * 60 * 1000;

    if (shouldFetch) {
      if (isApplicationLaunch()) {
        dispatch(fetchApplicationProducts({ company_id, application_id }));
      } else {
        dispatch(fetchProducts(company_id));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-8 px-2">
      <div className="max-w-6xl mx-auto">
        {showCreateCampaign ? (
          <CampaignCreatePage
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            setShowCreateCampaign={setShowCreateCampaign}
            setShowProductModal={handleProductModalOpen}
            setShowCustomerModal={setShowCustomerModal}
            setShowSaleschannelModal={setShowSaleschannelModal}
            selectedProducts={selectedProducts}
            selectedCustomers={selectedCustomers}
            selectedSaleschannels={selectedSaleschannels}
            methods={methods}
            onSubmit={handleSubmit(onSubmit)}
            errors={errors}
            watch={watch}
            register={register}
            handleIndividualProductSelect={handleIndividualProductSelect}
            handleIndividualCustomerSelect={handleIndividualCustomerSelect}
            handleIndividualSalesChannelSelect={
              handleIndividualSalesChannelSelect
            }
            handleSelectAllCustomers={handleSelectAllCustomers}
            handleSelectAllSalesChannels={handleSelectAllSalesChannels}
          />
        ) : (
          <>
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="!text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
                  Campaigns
                </h1>
                <p className="text-gray-500 !text-base">
                  Manage and analyze your marketing campaigns with ease.
                </p>
              </div>
              <button
                onClick={() => setShowCreateCampaign(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200"
              >
                + Create Campaign
              </button>
            </div>

            {/* Card Container */}
            <div className="bg-white/90 rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Filters Row */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-6 py-5 border-b border-gray-100 bg-white/80">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 text-gray-800 placeholder-gray-400 shadow-sm transition-all"
                  />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 text-gray-800 shadow-sm transition-all"
                  >
                    <option value="all">All Types</option>
                    <option value="PRODUCT_EXCLUSIVITY">
                      Product Exclusivity
                    </option>
                    <option value="CUSTOM_PROMOTIONS">Custom Promotions</option>
                    <option value="PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS">
                      Product Exclusivity & Custom Promotions
                    </option>
                  </select>
                  <button
                    onClick={handleRefresh}
                    className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 shadow-sm transition-all duration-200 flex items-center justify-center"
                    title="Refresh campaigns"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Date Range
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {isCampaignsLoading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-gray-400"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-base font-medium">
                              Loading campaigns...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedCampaigns.map((campaign) => (
                        <tr
                          key={campaign?._id}
                          className="hover:bg-blue-50/60 transition-all"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold text-sm">
                            {campaign?.name || ""}
                          </td>
                          <td className="px-6 py-4 text-gray-700 text-sm">
                            {campaign?.type === "PRODUCT_EXCLUSIVITY"
                              ? "Product Exclusivity"
                              : campaign?.type === "CUSTOM_PROMOTIONS"
                              ? "Custom Promotions"
                              : campaign?.type ===
                                "PRODUCT_EXCLUSIVITY_AND_CUSTOM_PROMOTIONS"
                              ? "Product Exclusivity & Custom Promotions"
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                            {new Date(campaign?.startDate).toLocaleDateString()}{" "}
                            - {new Date(campaign?.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                              const nowUTC = new Date().getTime();
                              const startUTC = new Date(
                                campaign?.startDate
                              ).getTime();
                              const endUTC = new Date(
                                campaign?.endDate
                              ).getTime();

                              let status = "Draft"; // default fallback status if dates are missing

                              if (startUTC && endUTC) {
                                if (nowUTC < startUTC) {
                                  status = "Scheduled";
                                } else if (
                                  nowUTC >= startUTC &&
                                  nowUTC <= endUTC
                                ) {
                                  status = "Active";
                                } else if (nowUTC > endUTC) {
                                  status = "Completed";
                                }
                              }

                              return (
                                <span
                                  className={`px-3 py-1 text-xs font-semibold rounded-full ${campaignStatusColors[status]}`}
                                >
                                  {status}
                                </span>
                              );
                            })()}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {campaign?.htmlContent && campaign?.subject ? (
                              <button
                                onClick={async () => {
                                  setIsLoading(true);
                                  try {
                                    const response = await axios.post(
                                      "https://create-campaign-af13fce1.serverless.boltic.app",
                                      {
                                        type: "send_email",
                                        companyId: campaign?.companyId,
                                        campaignId: campaign?.campaignId,
                                      },
                                      {
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                      }
                                    );
                                    if (response.data.success) {
                                      toast.success("Email sent successfully!");
                                    } else {
                                      throw new Error(
                                        response.data.message ||
                                          "Failed to send email"
                                      );
                                    }
                                  } catch (error) {
                                    toast.error(
                                      `Error sending email: ${error.message}`
                                    );
                                  } finally {
                                    setIsLoading(false);
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900 cursor-pointer mr-4 transition-colors"
                                disabled={isLoading}
                              >
                                Send Email
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedCampaign(campaign);
                                  setShowEmailTemplate(true);
                                  setCurrentStep(2);
                                }}
                                className="text-indigo-600 hover:text-indigo-900 cursor-pointer mr-4 transition-colors"
                              >
                                Add Email Template
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                    {!isCampaignsLoading &&
                      filteredAndSortedCampaigns.length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-16 text-center text-gray-400 bg-gradient-to-r from-blue-50 to-indigo-50"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <svg
                                className="w-12 h-12 text-blue-200 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 17v-2a4 4 0 014-4h3m4 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                />
                              </svg>
                              <span className="text-lg font-semibold">
                                No campaigns found
                              </span>
                              <span className="text-sm text-gray-500">
                                Try adjusting your search or filters.
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Email Template Modal */}
            {showEmailTemplate && selectedCampaign && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Email Template
                      </h2>
                      <button
                        onClick={() => {
                          setShowEmailTemplate(false);
                          setSelectedCampaign(null);
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-white">
                    <FormProvider {...emailTemplateMethods}>
                      <EmailTemplateForm
                        setCurrentStep={setCurrentStep}
                        setShowCreateCampaign={setShowEmailTemplate}
                        campaignId={selectedCampaign?.campaignId}
                        companyId={company_id}
                        campaign={selectedCampaign}
                      />
                    </FormProvider>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Customer Selection Modal */}
        <CustomerSelectionModal
          showModal={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          selectedCustomers={selectedCustomers}
          onCustomerSelect={handleIndividualCustomerSelect}
          onSelectAllCustomers={() =>
            handleSelectAllCustomers(
              filteredAndSortedCustomers.map((c) => c.id)
            )
          }
          customers={filteredAndSortedCustomers}
          customerSearchTerm={customerSearchTerm}
          setCustomerSearchTerm={setCustomerSearchTerm}
          customerSortField={customerSortField}
          setCustomerSortField={setCustomerSortField}
          customerSortDirection={customerSortDirection}
          setCustomerSortDirection={setCustomerSortDirection}
          customerFilterVip={customerFilterVip}
          setCustomerFilterVip={setCustomerFilterVip}
        />

        {/* Product Selection Modal */}
        <ProductSelectionModal
          showModal={showProductModal}
          onClose={() => setShowProductModal(false)}
          selectedProducts={selectedProducts}
          onProductSelect={handleIndividualProductSelect}
          onSelectAllProducts={() =>
            handleSelectAllProducts(filteredAndSortedProducts)
          }
          products={filteredAndSortedProducts}
          isLoading={productsLoading}
          company_id={company_id}
          application_id={application_id}
        />
      </div>
    </div>
  );
};

export default Campaigns;
