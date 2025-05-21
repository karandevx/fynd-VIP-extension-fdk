import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const Campaigns = () => {
  const { isDarkMode } = useTheme();
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'draft'
  });

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    setCampaigns([...campaigns, { ...newCampaign, id: Date.now() }]);
    setNewCampaign({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'draft'
    });
    setShowCreateModal(false);
  };

  return (
    <div className={`p-6 min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Campaigns</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your VIP customer campaigns</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Campaign
          </button>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`p-6 rounded-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{campaign.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}
                >
                  {campaign.status}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{campaign.description}</p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Start: {campaign.startDate}</p>
                <p>End: {campaign.endDate}</p>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button className="text-blue-600 hover:text-blue-700">Edit</button>
                <button className="text-red-600 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No campaigns created yet</p>
            </div>
          )}
        </div>

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } p-6`}>
              <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Campaign Name</label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    rows="3"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;