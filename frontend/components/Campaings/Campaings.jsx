import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import TopBar from '../TopBar/TopBar';
import { campaigns, campaignStatusColors } from '../../constants/campaigns';
import { customers } from '../../constants/customers';

const SIDEBAR_WIDTH = '16rem';

const Campaigns = () => {
  const navigate = useNavigate();
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log("showCustomerModal", showCustomerModal);
  console.log("showcreateCampaign", showCreateCampaign);

  // State for Customer Modal
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerSortField, setCustomerSortField] = useState('firstname');
  const [customerSortDirection, setCustomerSortDirection] = useState('asc');
  const [customerFilterVip, setCustomerFilterVip] = useState('all');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
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

  const handleSelectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleSelectAllCustomers = () => {
    const currentlyDisplayedCustomerIds = filteredAndSortedCustomers.map(c => c.id);
    const allCurrentlyDisplayedSelected = currentlyDisplayedCustomerIds.every(id => selectedCustomers.includes(id));

    if (allCurrentlyDisplayedSelected) {
      // Deselect only the ones currently displayed
      setSelectedCustomers(prev => prev.filter(id => !currentlyDisplayedCustomerIds.includes(id)));
    } else {
      // Select all currently displayed that are not already selected
      const newSelections = currentlyDisplayedCustomerIds.filter(id => !selectedCustomers.includes(id));
      setSelectedCustomers(prev => [...prev, ...newSelections]);
    }
  };

  const onSubmit = (data) => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      // Handle final submission
      console.log('Form submitted:', data);
      setShowCreateCampaign(false);
    }
  };

  const renderCreateCampaignPage = () => {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
                <p className="mt-1 text-sm text-gray-500">Set up your new marketing campaign</p>
              </div>
              <button
                onClick={() => setShowCreateCampaign(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-blue-600' : 'border-gray-300'}`}>
                  1
                </div>
                <span className="ml-2">Campaign Details</span>
              </div>
              <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                <div className={`h-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              </div>
              <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-blue-600' : 'border-gray-300'}`}>
                  2
                </div>
                <span className="ml-2">Email Template</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {currentStep === 1 ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                    <input
                      type="text"
                      {...register('name', { required: 'Campaign name is required' })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows="3"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        {...register('startDate', { required: 'Start date is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        {...register('endDate', { required: 'End date is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Products</label>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(true)}
                      className="mt-1 block w-full text-left px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {selectedProducts.length} products selected
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customers</label>
                    <button
                      type="button"
                      onClick={() => setShowCustomerModal(true)}
                      className="mt-1 block w-full text-left px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {selectedCustomers.length} customers selected
                    </button>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateCampaign(false)}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Subject</label>
                    <input
                      type="text"
                      {...register('emailTemplate.subject', { required: 'Subject is required' })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.emailTemplate?.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.emailTemplate.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Content</label>
                    <div className="mt-1 border rounded-md p-4 bg-gray-50">
                      <div dangerouslySetInnerHTML={{ __html: watch('emailTemplate.content') }} />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Create Campaign
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showCreateCampaign ? (
        renderCreateCampaignPage()
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
                    className="px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>Sort by:</span>
                    <button
                      onClick={() => handleSort('name')}
                      className={`hover:text-blue-600 ${sortField === 'name' ? 'text-blue-600' : ''}`}
                    >
                      Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                      onClick={() => handleSort('startDate')}
                      className={`hover:text-blue-600 ${sortField === 'startDate' ? 'text-blue-600' : ''}`}
                    >
                      Start Date {sortField === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                      onClick={() => handleSort('status')}
                      className={`hover:text-blue-600 ${sortField === 'status' ? 'text-blue-600' : ''}`}
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
                  {filteredAndSortedCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{campaign.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {campaign.startDate} - {campaign.endDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${campaignStatusColors[campaign.status]}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowEmailTemplate(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 cursor-pointer mr-4"
                        >
                          View
                        </button>
                        <button className="text-red-600 hover:text-red-900 cursor-pointer">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAndSortedCampaigns.length === 0 && (
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

          {/* Product Selection Modal */}
          {showProductModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Select Products</h2>
                    <button
                      onClick={() => setShowProductModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length}
                        onChange={handleSelectAllProducts}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">Select All</span>
                    </label>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-12 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {products.map((product) => (
                          <label
                            key={product.id}
                            className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleProductSelect(product.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2">{product.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowProductModal(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                {showCustomerModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Select Customers</h2>
                    <button
                      onClick={() => setShowCustomerModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>

                  {/* Search, Filter, and Sort Controls */}
                  <div className="mb-4 space-y-4">
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500">
                      <span>Filter by:</span>
                      <select
                        value={customerFilterVip}
                        onChange={(e) => setCustomerFilterVip(e.target.value)}
                        className="px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Customers</option>
                        <option value="vip">VIP Customers ( 75% VIP Ratio)</option>
                        <option value="non-vip">Non-VIP Customers ( 75% VIP Ratio)</option>
                      </select>
                      <span className="ml-auto sm:ml-0">Sort by:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCustomerSort('firstname')}
                          className={`hover:text-blue-600 ${customerSortField === 'firstname' ? 'text-blue-600' : ''}`}
                        >
                          First Name {customerSortField === 'firstname' && (customerSortDirection === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCustomerSort('lastname')}
                          className={`hover:text-blue-600 ${customerSortField === 'lastname' ? 'text-blue-600' : ''}`}
                        >
                          Last Name {customerSortField === 'lastname' && (customerSortDirection === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCustomerSort('vipRatio')}
                          className={`hover:text-blue-600 ${customerSortField === 'vipRatio' ? 'text-blue-600' : ''}`}
                        >
                          VIP Ratio {customerSortField === 'vipRatio' && (customerSortDirection === 'asc' ? '↑' : '↓')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Select All Checkbox */}
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filteredAndSortedCustomers.length > 0 && filteredAndSortedCustomers.every(c => selectedCustomers.includes(c.id))}
                        onChange={handleSelectAllCustomers}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">Select All</span>
                    </label>
                  </div>

                  {/* Customer List */}
                  <div className="max-h-96 overflow-y-auto border rounded-md">
                    {isLoading ? (
                      <div className="p-4 space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : filteredAndSortedCustomers.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {filteredAndSortedCustomers.map((customer) => (
                          <label
                            key={customer.id}
                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(customer.id)}
                              onChange={() => handleCustomerSelect(customer.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm text-gray-900 flex-1">{customer.firstname} {customer.lastname} ({customer.email})</span>
                            <span className="text-sm text-gray-600">VIP Ratio: {customer.vipRatio}%</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No customers found matching your criteria.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowCustomerModal(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Done ({selectedCustomers.length} selected)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

    </div>
  );
};

export default Campaigns;