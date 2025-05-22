import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SIDEBAR_WIDTH = '16rem';

const Campaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'draft',
    selectedProducts: [],
    selectedCustomers: [],
    discounts: {
      type: 'percentage', // or 'fixed'
      value: '',
      freeDelivery: false
    },
    emailTemplate: {
      subject: '',
      content: '',
      prompt: ''
    }
  });

  // Mock data for products and customers
  const products = [
    { id: 1, name: 'Product 1', price: 99.99, category: 'Electronics' },
    { id: 2, name: 'Product 2', price: 149.99, category: 'Fashion' },
    { id: 3, name: 'Product 3', price: 199.99, category: 'Home' },
  ];

  const customers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', tier: 'Gold' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', tier: 'Silver' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', tier: 'Bronze' },
  ];

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    const campaign = { ...newCampaign, id: Date.now() };
    setCampaigns([...campaigns, campaign]);
    setSelectedCampaign(campaign);
    setShowCreateCampaign(false);
    setShowEmailTemplate(true);
  };

  const handleRegenerateTemplate = () => {
    // Here you would typically call an API to regenerate the template based on the prompt
    const updatedCampaign = {
      ...selectedCampaign,
      emailTemplate: {
        ...selectedCampaign.emailTemplate,
        content: `New template generated based on prompt: ${selectedCampaign.emailTemplate.prompt}`
      }
    };
    setSelectedCampaign(updatedCampaign);
    setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
  };

  const handleSendEmail = () => {
    // Here you would typically call an API to send the email
    alert('Email sent successfully!');
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Campaigns</h1>
          <p className="text-gray-600">Manage your VIP customer campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateCampaign(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Campaign
        </button>
      </div>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                <p className="text-sm text-gray-600">{campaign.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {campaign.status}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Products: {campaign.selectedProducts.length}</p>
              <p>Customers: {campaign.selectedCustomers.length}</p>
              <p>Discount: {campaign.discounts.type === 'percentage' ? `${campaign.discounts.value}%` : `$${campaign.discounts.value}`}</p>
              {campaign.discounts.freeDelivery && <p className="text-green-600">Free Delivery</p>}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setSelectedCampaign(campaign);
                  setShowEmailTemplate(true);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                View Template
              </button>
              <button className="text-red-600 hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign Form */}
      {showCreateCampaign && (
        <div
          className="z-40"
          style={{
            position: 'fixed',
            left: SIDEBAR_WIDTH,
            top: 0,
            width: `calc(100% - ${SIDEBAR_WIDTH})`,
            height: '100vh',
          }}
        >
          <div
            className="bg-gray-500 bg-opacity-75 transition-opacity"
            style={{ position: 'absolute', inset: 0 }}
            onClick={() => setShowCreateCampaign(false)}
          ></div>
          <div className="overflow-y-auto" style={{ position: 'absolute', inset: 0 }}>
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
                    <button
                      onClick={() => setShowCreateCampaign(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleCreateCampaign} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Campaign Name</label>
                        <input
                          type="text"
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                        <input
                          type="text"
                          value={newCampaign.description}
                          onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                        <input
                          type="date"
                          value={newCampaign.startDate}
                          onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
                        <input
                          type="date"
                          value={newCampaign.endDate}
                          onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Product Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Select Products</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                        {products.map((product) => (
                          <label key={product.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={newCampaign.selectedProducts.includes(product.id)}
                              onChange={(e) => {
                                const updatedProducts = e.target.checked
                                  ? [...newCampaign.selectedProducts, product.id]
                                  : newCampaign.selectedProducts.filter(id => id !== product.id);
                                setNewCampaign({ ...newCampaign, selectedProducts: updatedProducts });
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{product.name} - ${product.price}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Customer Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Select Customers</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                        {customers.map((customer) => (
                          <label key={customer.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={newCampaign.selectedCustomers.includes(customer.id)}
                              onChange={(e) => {
                                const updatedCustomers = e.target.checked
                                  ? [...newCampaign.selectedCustomers, customer.id]
                                  : newCampaign.selectedCustomers.filter(id => id !== customer.id);
                                setNewCampaign({ ...newCampaign, selectedCustomers: updatedCustomers });
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{customer.name} ({customer.tier})</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Discount Settings */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">Discount Settings</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Discount Type</label>
                          <select
                            value={newCampaign.discounts.type}
                            onChange={(e) => setNewCampaign({
                              ...newCampaign,
                              discounts: { ...newCampaign.discounts, type: e.target.value }
                            })}
                            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Discount Value</label>
                          <input
                            type="number"
                            value={newCampaign.discounts.value}
                            onChange={(e) => setNewCampaign({
                              ...newCampaign,
                              discounts: { ...newCampaign.discounts, value: e.target.value }
                            })}
                            className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="freeDelivery"
                          checked={newCampaign.discounts.freeDelivery}
                          onChange={(e) => setNewCampaign({
                            ...newCampaign,
                            discounts: { ...newCampaign.discounts, freeDelivery: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="freeDelivery" className="ml-2 block text-sm text-gray-700">
                          Include Free Delivery
                        </label>
                      </div>
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Create Campaign
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Template Modal */}
      {showEmailTemplate && selectedCampaign && (
        <div
          className="z-40"
          style={{
            position: 'fixed',
            left: SIDEBAR_WIDTH,
            top: 0,
            width: `calc(100% - ${SIDEBAR_WIDTH})`,
            height: '100vh',
          }}
        >
          <div
            className="bg-gray-500 bg-opacity-75 transition-opacity"
            style={{ position: 'absolute', inset: 0 }}
            onClick={() => setShowEmailTemplate(false)}
          ></div>
          <div className="overflow-y-auto" style={{ position: 'absolute', inset: 0 }}>
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Email Template</h2>
                    <button
                      onClick={() => setShowEmailTemplate(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Email Subject</label>
                      <input
                        type="text"
                        value={selectedCampaign.emailTemplate.subject}
                        onChange={(e) => {
                          const updatedCampaign = {
                            ...selectedCampaign,
                            emailTemplate: { ...selectedCampaign.emailTemplate, subject: e.target.value }
                          };
                          setSelectedCampaign(updatedCampaign);
                          setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
                        }}
                        className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Template Prompt</label>
                      <textarea
                        value={selectedCampaign.emailTemplate.prompt}
                        onChange={(e) => {
                          const updatedCampaign = {
                            ...selectedCampaign,
                            emailTemplate: { ...selectedCampaign.emailTemplate, prompt: e.target.value }
                          };
                          setSelectedCampaign(updatedCampaign);
                          setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
                        }}
                        className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Enter prompt to generate email template..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Email Content</label>
                      <div className="border rounded-md p-4 bg-gray-50">
                        <div dangerouslySetInnerHTML={{ __html: selectedCampaign.emailTemplate.content }} />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={handleRegenerateTemplate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Regenerate Template
                      </button>
                      <button
                        onClick={handleSendEmail}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Send Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;