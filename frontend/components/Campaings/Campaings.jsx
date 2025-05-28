import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import TopBar from '../TopBar/TopBar';
import { campaigns, campaignStatusColors } from '../../constants/campaigns';
import { customers } from '../../constants/customers';
import axios from "axios";
import urlJoin from "url-join"
import CustomerSelectionModal from './CustomerSelectionModal';
import ProductSelectionModal from './ProductSelectionModal';
import CampaignStepper from './CampaignStepper';
import EmailTemplateForm from './EmailTemplateForm';
import CampaignCreatePage from './CampaignCreatePage';
import { toast } from 'react-toastify';

const SIDEBAR_WIDTH = '16rem';
const EXAMPLE_MAIN_URL = window.location.origin;


const Campaigns = () => {
  const navigate = useNavigate();
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSaleschannelModal, setShowSaleschannelModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedSaleschannels, setSelectedSaleschannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProductList] = useState([]);
  const [fetchedCampaigns, setFetchedCampaigns] = useState([]);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false);

console.log("showproductModal:", showProductModal);

  // State for Customer Modal
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerSortField, setCustomerSortField] = useState('firstname');
  const [customerSortDirection, setCustomerSortDirection] = useState('asc');
  const [customerFilterVip, setCustomerFilterVip] = useState('all');
    const { application_id, company_id } = useParams();
  
  // State for Product Modal
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productSortField, setProductSortField] = useState('name');
  const [productSortDirection, setProductSortDirection] = useState('asc');

  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'draft',
      discounts: {
        type: 'percentage',
        value: '',
        freeDelivery: false
      },
      emailTemplate: {
        subject: '',
        content: '',
        prompt: ''
      }
    }
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = methods;

  useEffect(() => {
    isApplicationLaunch() ? fetchApplicationProducts() : fetchProducts();
  }, [application_id]);

  useEffect(() => {
    fetchCampaigns();
  }, [company_id]);


  const isApplicationLaunch = () => !!application_id;


  const fetchProducts = async () => {
    // setPageLoading(true);
    try {
      const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, '/api/products/'),{
        headers: {
          "x-company-id": company_id,
        }
      });
      console.log("Fetched products:", data);
      setProductList(data.items);
    } catch (e) {
      console.error("Error fetching products:", e);
    } finally {
      // setPageLoading(false);
    }
  };

  const fetchApplicationProducts = async () => {
    // setPageLoading(true);
    try {
      const { data } = await axios.get(urlJoin(EXAMPLE_MAIN_URL, `/api/products/application/${application_id}`),{
        headers: {
          "x-company-id": company_id,
        }
      });
      console.log("Fetched application products:", data);
      setProductList(data.items);
    } catch (e) {
      console.error("Error fetching application products:", e);
    } finally {
      // setPageLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setIsCampaignsLoading(true);
    try {
      const { data } = await axios.get(`https://fetch-db-data-d9ca324b.serverless.boltic.app?module=campaigns&companyId=${company_id}&queryType=scan`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Fetched campaigns:", data);
      if (data.success) {
        setFetchedCampaigns(data.data);
      } else {
        throw new Error('Failed to fetch campaigns');
      }
    } catch (e) {
      console.error("Error fetching campaigns:", e);
      toast.error('Failed to fetch campaigns');
    } finally {
      setIsCampaignsLoading(false);
    }
  };

  console.log("Products:", products);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCustomerSort = (field) => {
    if (customerSortField === field) {
      setCustomerSortDirection(customerSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setCustomerSortField(field);
      setCustomerSortDirection('asc');
    }
  };

  const handleProductSort = (field) => {
    if (productSortField === field) {
      setProductSortDirection(productSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setProductSortField(field);
      setProductSortDirection('asc');
    }
  };

  const filteredAndSortedCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      return aValue > bValue ? modifier : -modifier;
    });

  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const searchTermLower = customerSearchTerm.toLowerCase();
      const matchesSearch = customer.firstname.toLowerCase().includes(searchTermLower) ||
                          customer.lastname.toLowerCase().includes(searchTermLower) ||
                          customer.email.toLowerCase().includes(searchTermLower) ||
                          customer.mobile.includes(customerSearchTerm);

      const matchesFilter = customerFilterVip === 'all' ||
                          (customerFilterVip === 'vip' && customer.vipRatio > 75) ||
                          (customerFilterVip === 'non-vip' && customer.vipRatio <= 75);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[customerSortField];
      const bValue = b[customerSortField];

      if (aValue < bValue) return customerSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return customerSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const filteredAndSortedProducts = products
    .filter(product => {
      const searchTermLower = productSearchTerm.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(searchTermLower) ||
                          product.slug.toLowerCase().includes(searchTermLower) ||
                          product.item_code.toLowerCase().includes(searchTermLower) ||
                          (product.brand && product.brand.name.toLowerCase().includes(searchTermLower));
      // Add other product specific filters here if needed
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      if (productSortField === 'effective_price') {
        aValue = a.price?.effective?.min || 0;
        bValue = b.price?.effective?.min || 0;
      } else if (productSortField === 'brand_name') {
        aValue = a.brand?.name || '';
        bValue = b.brand?.name || '';
      } else {
        aValue = a[productSortField];
        bValue = b[productSortField];
      }

      if (aValue < bValue) return productSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return productSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllProducts = (productUidsToToggle) => {
    setSelectedProducts(prev => {
      const allSelectedInList = productUidsToToggle.every(uid => prev.includes(uid));
      const newSelected = new Set(prev);

      if (allSelectedInList) {
        // Deselect all in the current list
        productUidsToToggle.forEach(uid => newSelected.delete(uid));
      } else {
        // Select all in the current list
        productUidsToToggle.forEach(uid => newSelected.add(uid));
      }

      return Array.from(newSelected);
    });
  };

  const handleSelectAllCustomers = (customerIdsToToggle) => {
    setSelectedCustomers(prev => {
      const allSelectedInList = customerIdsToToggle.every(id => prev.includes(id));
      const newSelected = new Set(prev);

      if (allSelectedInList) {
        // Deselect all in the current list
        customerIdsToToggle.forEach(id => newSelected.delete(id));
      } else {
        // Select all in the current list
        customerIdsToToggle.forEach(id => newSelected.add(id));
      }

      return Array.from(newSelected);
    });
  };

  const handleIndividualProductSelect = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleIndividualCustomerSelect = (customerId) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Handlers for Sales Channel Selection
  const handleIndividualSalesChannelSelect = (channelId) => {
    setSelectedSaleschannels(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleSelectAllSalesChannels = (channelIdsToToggle) => {
    setSelectedSaleschannels(prev => {
      if (channelIdsToToggle.length === 0) {
        return prev;
      }
      const allAreCurrentlySelected = channelIdsToToggle.every(id => prev.includes(id));
      if (allAreCurrentlySelected) {
        return prev.filter(id => !channelIdsToToggle.includes(id));
      } else {
        const newSelected = new Set(prev);
        channelIdsToToggle.forEach(id => newSelected.add(id));
        return Array.from(newSelected);
      }
    });
  };

  const onSubmit = (data) => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      // Handle final submission
      console.log('Campaign Creation Complete:', {
        campaignData: data,
        selectedProducts,
        selectedCustomers,
        selectedSaleschannels,
        timestamp: new Date().toISOString()
      });
      setShowCreateCampaign(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showCreateCampaign ? (
        <CampaignCreatePage
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setShowCreateCampaign={setShowCreateCampaign}
          setShowProductModal={setShowProductModal}
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
          handleIndividualSalesChannelSelect={handleIndividualSalesChannelSelect}
          handleSelectAllCustomers={handleSelectAllCustomers}
          handleSelectAllSalesChannels={handleSelectAllSalesChannels}
        />
      ) : (
        <div>
          {/* Campaigns List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border cursor-pointer rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option className='hover:cursor-pointer' value="all">All Status</option>
                    <option className='hover:cursor-pointer' value="draft">Draft</option>
                    <option className='hover:cursor-pointer' value="active">Active</option>
                    <option className='hover:cursor-pointer' value="completed">Completed</option>
                    <option className='hover:cursor-pointer' value="paused">Paused</option>
                  </select>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>Sort by:</span>
                    <button
                      onClick={() => handleSort('name')}
                      className={`hover:text-blue-600 hover:cursor-pointer ${sortField === 'name' ? 'text-blue-600' : ''}`}
                    >
                      Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                      onClick={() => handleSort('startDate')}
                      className={`hover:text-blue-600 hover:cursor-pointer ${sortField === 'startDate' ? 'text-blue-600' : ''}`}
                    >
                      Start Date {sortField === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                      onClick={() => handleSort('status')}
                      className={`hover:text-blue-600 hover:cursor-pointer ${sortField === 'status' ? 'text-blue-600' : ''}`}
                    >
                      Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Name
                      {sortField === 'name' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('startDate')}
                    >
                      Date Range
                      {sortField === 'startDate' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {sortField === 'status' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isCampaignsLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                          Loading campaigns...
                        </div>
                      </td>
                    </tr>
                  ) : (
                    fetchedCampaigns.map((campaign) => (
                      <tr key={campaign._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{campaign.campaignId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{"N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${campaignStatusColors["active"]}`}>
                            {"active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              // Need to adjust this to handle new data structure if viewing is needed
                              // For now, no action on View
                            }}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer mr-4"
                            disabled={true}
                          >
                            View
                          </button>
                          <button className="text-red-600 hover:text-red-900 cursor-pointer" disabled={true}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {!isCampaignsLoading && fetchedCampaigns.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No campaigns found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Campaign Button */}
          <div className="mt-6">
            <button
              onClick={() => setShowCreateCampaign(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Create Campaign
            </button>
          </div>

          {/* Email Template Modal */}
          {showEmailTemplate && selectedCampaign && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Email Template</h2>
                    <button
                      onClick={() => setShowEmailTemplate(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subject</label>
                      <div className="mt-1 text-gray-900">{selectedCampaign.emailTemplate.subject}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Content</label>
                      <div className="mt-1 border rounded-md p-4 bg-gray-50">
                        <div dangerouslySetInnerHTML={{ __html: selectedCampaign.emailTemplate.content }} />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowEmailTemplate(false)}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          // Handle send email
                          setShowEmailTemplate(false);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Send Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Selection Modal */}
      <CustomerSelectionModal
        showModal={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        selectedCustomers={selectedCustomers}
        onCustomerSelect={handleIndividualCustomerSelect}
        onSelectAllCustomers={() => handleSelectAllCustomers(filteredAndSortedCustomers.map(c => c.id))}
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
        onSelectAllProducts={() => handleSelectAllProducts(filteredAndSortedProducts.map(p => p.uid))}
        products={filteredAndSortedProducts}
        isLoading={isLoading}
        productSearchTerm={productSearchTerm}
        setProductSearchTerm={setProductSearchTerm}
        productSortField={productSortField}
        setProductSortField={setProductSortField}
        productSortDirection={productSortDirection}
        setProductSortDirection={setProductSortDirection}
      />
    </div>
  );
};

export default Campaigns;